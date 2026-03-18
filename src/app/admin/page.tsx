"use client"

import { useMemo, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToImgbb } from "@/lib/uploadToImgbb"
import { ADMIN_WALLS, WALL_LABEL_MAP } from "@/lib/adminWalls"
import AdminUploadForm from "@/components/admin/AdminUploadForm"
import AdminArtworkLibrary, {
  type AdminArtworkItem,
} from "@/components/admin/AdminArtworkLibrary"
import AdminWallBoard from "@/components/admin/AdminWallBoard"
import { useEffect } from "react"

type FirestoreArtwork = AdminArtworkItem & {
  createdAt?: {
    seconds?: number
    nanoseconds?: number
  } | null
}

export default function AdminPage() {
  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("실시간 동기화 연결됨")
  const [activeWallId, setActiveWallId] = useState("left_01")

  useEffect(() => {
    const q = query(collection(db, "artworks"))

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docItem) => {
          const data = docItem.data() as Omit<FirestoreArtwork, "id">
          return {
            id: docItem.id,
            ...data,
          }
        })

        setArtworks(next)
      },
      () => {
        setStatus("동기화 중 오류가 발생했습니다.")
      }
    )

    return () => unsub()
  }, [])

  const artworksSortedForLibrary = useMemo(() => {
    return [...artworks].sort((a, b) => {
      const aSec = a.createdAt?.seconds ?? 0
      const bSec = b.createdAt?.seconds ?? 0
      return bSec - aSec
    })
  }, [artworks])

  const wallCounts = useMemo(() => {
    return ADMIN_WALLS.map((wall) => ({
      ...wall,
      count: artworks.filter((item) => item.wallId === wall.id).length,
    }))
  }, [artworks])

  const suggestedOrder = useMemo(() => {
    const wallItems = artworks
      .filter((item) => item.wallId === activeWallId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    if (!wallItems.length) return 1
    return (wallItems[wallItems.length - 1]?.order ?? wallItems.length) + 1
  }, [activeWallId, artworks])

  const wallsInUse = wallCounts.filter((wall) => wall.count > 0).length

  async function normalizeWallOrders(nextArtworks: FirestoreArtwork[], wallId: string) {
    const targets = nextArtworks
      .filter((item) => item.wallId === wallId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const batch = writeBatch(db)

    targets.forEach((item, index) => {
      batch.update(doc(db, "artworks", item.id), {
        order: index + 1,
      })
    })

    await batch.commit()
  }

  async function handleCreate(payload: {
    title: string
    artist: string
    wallId: string
    width_cm: number
    height_cm: number
    order: number
    file: File
  }) {
    try {
      setLoading(true)
      setStatus("이미지 업로드 중...")

      const imageUrl = await uploadToImgbb(payload.file)

      setStatus("작품 정보 저장 중...")

      await addDoc(collection(db, "artworks"), {
        title: payload.title,
        artist: payload.artist,
        wallId: payload.wallId,
        width_cm: payload.width_cm,
        height_cm: payload.height_cm,
        order: payload.order,
        imageUrl,
        createdAt: serverTimestamp(),
      })

      setActiveWallId(payload.wallId)
      setStatus(`등록 완료 · ${WALL_LABEL_MAP[payload.wallId] ?? payload.wallId}`)
    } catch (error) {
      console.error(error)
      setStatus("업로드 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(artwork: AdminArtworkItem) {
    const ok = window.confirm(`"${artwork.title || "Untitled"}" 작품을 삭제할까요?`)
    if (!ok) return

    try {
      setStatus("작품 삭제 중...")
      await deleteDoc(doc(db, "artworks", artwork.id))

      const next = artworks.filter((item) => item.id !== artwork.id)
      await normalizeWallOrders(next, artwork.wallId)

      setStatus("작품을 삭제했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("삭제 중 오류가 발생했습니다.")
    }
  }

  async function handleMoveWall(artwork: AdminArtworkItem, nextWallId: string) {
    if (artwork.wallId === nextWallId) return

    try {
      setStatus("벽 이동 중...")

      const nextWallItems = artworks
        .filter((item) => item.wallId === nextWallId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      await updateDoc(doc(db, "artworks", artwork.id), {
        wallId: nextWallId,
        order: nextWallItems.length + 1,
      })

      const removedCurrent = artworks.filter((item) => item.id !== artwork.id)
      await normalizeWallOrders(removedCurrent, artwork.wallId)

      setStatus(
        `작품을 ${WALL_LABEL_MAP[nextWallId] ?? nextWallId} 로 이동했습니다.`
      )
    } catch (error) {
      console.error(error)
      setStatus("벽 이동 중 오류가 발생했습니다.")
    }
  }

  async function handleMoveOrder(
    artwork: AdminArtworkItem,
    direction: "up" | "down"
  ) {
    const wallItems = artworks
      .filter((item) => item.wallId === artwork.wallId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const currentIndex = wallItems.findIndex((item) => item.id === artwork.id)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= wallItems.length) return

    const targetArtwork = wallItems[targetIndex]
    const currentOrder = artwork.order ?? currentIndex + 1
    const targetOrder = targetArtwork.order ?? targetIndex + 1

    try {
      setStatus("작품 순서 조정 중...")

      const batch = writeBatch(db)
      batch.update(doc(db, "artworks", artwork.id), { order: targetOrder })
      batch.update(doc(db, "artworks", targetArtwork.id), { order: currentOrder })
      await batch.commit()

      setStatus("작품 순서를 조정했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("순서 조정 중 오류가 발생했습니다.")
    }
  }

  return (
    <main style={pageStyle}>
      <div style={heroStyle}>
        <div>
          <p style={heroEyebrowStyle}>Virtual Exhibition Admin</p>
          <h1 style={heroTitleStyle}>전시 설치 보드</h1>
          <p style={heroTextStyle}>
            작품을 등록하고, 벽에 배치하고, 순서를 조정하는 관리자 페이지입니다.
          </p>
        </div>

        <div style={heroStatsStyle}>
          <StatCard label="Total Works" value={String(artworks.length)} />
          <StatCard label="Walls In Use" value={String(wallsInUse)} />
          <StatCard label="Sync Status" value={status} wide />
        </div>
      </div>

      <div style={topGridStyle}>
        <AdminUploadForm
          loading={loading}
          suggestedOrder={suggestedOrder}
          defaultWallId={activeWallId}
          onSubmit={handleCreate}
        />

        <AdminArtworkLibrary
          artworks={artworksSortedForLibrary}
          onDelete={handleDelete}
          onMoveWall={handleMoveWall}
          walls={ADMIN_WALLS}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <AdminWallBoard
          artworks={artworks}
          onMoveOrder={handleMoveOrder}
          onMoveWall={handleMoveWall}
        />
      </div>

      <div style={wallSummaryStyle}>
        {wallCounts.map((wall) => (
          <div
            key={wall.id}
            style={{
              ...summaryChipStyle,
              border:
                wall.id === activeWallId
                  ? "1px solid rgba(255,255,255,0.24)"
                  : "1px solid rgba(255,255,255,0.08)",
              background:
                wall.id === activeWallId
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.04)",
            }}
            onClick={() => setActiveWallId(wall.id)}
          >
            <span style={summaryLabelStyle}>{wall.label}</span>
            <span style={summaryCountStyle}>{wall.count}</span>
          </div>
        ))}
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  wide,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div
      style={{
        ...statCardStyle,
        gridColumn: wide ? "span 2" : undefined,
      }}
    >
      <span style={statLabelStyle}>{label}</span>
      <strong style={statValueStyle}>{value}</strong>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(61,77,111,0.28) 0%, rgba(7,10,15,1) 45%, rgba(6,8,12,1) 100%)",
  color: "#f5f7fb",
}

const heroStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 16,
  alignItems: "end",
  marginBottom: 24,
}

const heroEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const heroTitleStyle: React.CSSProperties = {
  margin: "8px 0 10px",
  fontSize: 44,
  lineHeight: 1.02,
}

const heroTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
  color: "rgba(255,255,255,0.66)",
  fontSize: 15,
  lineHeight: 1.6,
}

const heroStatsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
}

const statCardStyle: React.CSSProperties = {
  minHeight: 92,
  borderRadius: 20,
  padding: 18,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  alignContent: "space-between",
}

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const statValueStyle: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.2,
}

const topGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(340px, 420px) minmax(0, 1fr)",
  gap: 24,
  alignItems: "start",
}

const wallSummaryStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
}

const summaryChipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 999,
  cursor: "pointer",
}

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.84)",
}

const summaryCountStyle: React.CSSProperties = {
  minWidth: 22,
  height: 22,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 12,
}
