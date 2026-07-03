"use client"

import { useMemo, useState, useEffect } from "react"
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
import { defaultLightingSettings } from "@/lib/defaultExhibitionSettings"
import { uploadToImgbb } from "@/lib/uploadToImgbb"
import { ADMIN_WALLS } from "@/lib/adminWalls"
import { exhibitions } from "@/data/exhibitions"
import AdminUploadForm from "@/components/admin/AdminUploadForm"
import AdminArtworkLibrary, {
  type AdminArtworkItem,
} from "@/components/admin/AdminArtworkLibrary"
import AdminWallBoard from "@/components/admin/AdminWallBoard"
import AdminLightingPanel from "@/components/admin/AdminLightingPanel"
import AdminVideoPanel from "@/components/admin/AdminVideoPanel"
import AdminGalleryPreview from "@/components/admin/AdminGalleryPreview"
import AdminExhibitionManager from "@/components/admin/AdminExhibitionManager"
import SpaceSelector from "@/components/SpaceSelector"
import ExhibitionSpaceAssignment from "@/components/ExhibitionSpaceAssignment"

type FirestoreArtwork = AdminArtworkItem & {
  exhibitionSlug: string
  createdAt?: {
    seconds?: number
    nanoseconds?: number
  } | null
}

type FirestoreExhibition = {
  id: string
  slug: string
  title: string
  artist: string
  period: string
  description: string
  summary?: string
  rightTitle?: string
  rightBody?: string
  layoutPreset?: string
  coverImage?: string
  isCurrent?: boolean
  isRecommended?: boolean
  createdAt?: {
    seconds?: number
    nanoseconds?: number
  } | null
  updatedAt?: {
    seconds?: number
    nanoseconds?: number
  } | null
}

type AdminSection =
  | "overview"
  | "works"
  | "walls"
  | "lighting"
  | "media"
  | "camera"
  | "assignments"
  | "spaces"

const SECTION_META: Record<
  AdminSection,
  { label: string; title: string; desc: string }
> = {
  overview: {
    label: "Overview",
    title: "운영 개요",
    desc: "현재 전시의 작품 수, 벽 점유 현황, 빠른 관리 패널",
  },
  works: {
    label: "Works",
    title: "작품 관리",
    desc: "업로드, 등록된 작품 확인, 벽 이동",
  },
  walls: {
    label: "Walls",
    title: "벽 배치",
    desc: "벽별 슬롯 순서와 설치 흐름 확인",
  },
  lighting: {
    label: "Lighting",
    title: "조명 / 공간 톤",
    desc: "실제 갤러리와 동일한 톤으로 전시 분위기 조정",
  },
  media: {
    label: "Media",
    title: "미디어 월",
    desc: "CylinderWall 영상 URL 및 전시별 미디어 설정",
  },
  camera: {
    label: "Camera",
    title: "프리뷰 / 촬영 카메라",
    desc: "벽 정면 프리뷰와 촬영 프리셋 확인",
  },
  assignments: {
    label: "Assignments",
    title: "Exhibition Space Assignment",
    desc: "Assign a virtual gallery space to each exhibition for preview. Saved locally for this admin draft only.",
  },
  spaces: {
    label: "Spaces",
    title: "UNFRAME Space Templates",
    desc: "Choose a virtual gallery space and preview how it loads in the exhibition viewer.",
  },
}

export default function AdminPage() {
  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])
  const [exhibitionDocs, setExhibitionDocs] = useState<FirestoreExhibition[]>(
    []
  )
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("실시간 동기화 연결됨")
  const [activeWallId, setActiveWallId] = useState("left_01")
  const [selectedExhibitionSlug, setSelectedExhibitionSlug] = useState(
    exhibitions[0]?.slug ?? ""
  )
  const [previewLighting, setPreviewLighting] = useState(
    defaultLightingSettings
  )
  const [activeSection, setActiveSection] =
    useState<AdminSection>("overview")

  useEffect(() => {
    const q = query(collection(db, "exhibitions"))

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next: FirestoreExhibition[] = snapshot.docs.map((docItem) => {
          const data = docItem.data() as Omit<FirestoreExhibition, "id">
          return {
            id: docItem.id,
            ...data,
          }
        })

        setExhibitionDocs(
          next.sort((a, b) => {
            const aSec = a.createdAt?.seconds ?? 0
            const bSec = b.createdAt?.seconds ?? 0
            return bSec - aSec
          })
        )
      },
      () => {
        setStatus("전시 동기화 중 오류가 발생했습니다.")
      }
    )

    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "artworks"))

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next: FirestoreArtwork[] = snapshot.docs.map((docItem) => {
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

  const exhibitionOptions = useMemo(() => {
    if (exhibitionDocs.length > 0) return exhibitionDocs
    return exhibitions.map((item) => ({
      id: item.slug,
      slug: item.slug,
      title: item.title,
      artist: item.artist,
      period: item.period,
      description: item.description,
      summary: item.summary,
      rightTitle: item.rightTitle,
      rightBody: item.rightBody,
      layoutPreset: item.layoutPreset,
      coverImage: item.coverImage,
      isCurrent: item.isCurrent,
      isRecommended: item.isRecommended,
      createdAt: null,
    }))
  }, [exhibitionDocs])

  const selectedExhibition = useMemo(() => {
    return (
      exhibitionDocs.find((item) => item.slug === selectedExhibitionSlug) ??
      exhibitions.find((item) => item.slug === selectedExhibitionSlug) ??
      exhibitions[0]
    )
  }, [exhibitionDocs, selectedExhibitionSlug])

  const selectedPreviewExhibition = useMemo(
    () =>
      selectedExhibition
        ? {
            slug: selectedExhibition.slug,
            title: selectedExhibition.title,
            artist: selectedExhibition.artist,
            period: selectedExhibition.period,
            description: selectedExhibition.description,
            summary: selectedExhibition.summary,
            rightTitle: selectedExhibition.rightTitle,
            rightBody: selectedExhibition.rightBody,
            coverImage: selectedExhibition.coverImage,
            layoutPreset: selectedExhibition.layoutPreset,
            isCurrent: selectedExhibition.isCurrent,
            isRecommended: selectedExhibition.isRecommended,
          }
        : null,
    [selectedExhibition]
  )

  useEffect(() => {
    setPreviewLighting(defaultLightingSettings)
  }, [selectedExhibitionSlug])

  const exhibitionArtworks = useMemo(() => {
    return artworks.filter(
      (item) => item.exhibitionSlug === selectedExhibitionSlug
    )
  }, [artworks, selectedExhibitionSlug])

  const artworksSortedForLibrary = useMemo(() => {
    return [...exhibitionArtworks].sort((a, b) => {
      const aSec = a.createdAt?.seconds ?? 0
      const bSec = b.createdAt?.seconds ?? 0
      return bSec - aSec
    })
  }, [exhibitionArtworks])

  const wallCounts = useMemo(() => {
    return ADMIN_WALLS.map((wall) => ({
      ...wall,
      count: exhibitionArtworks.filter((item) => item.wallId === wall.id)
        .length,
    }))
  }, [exhibitionArtworks])

  const suggestedOrder = useMemo(() => {
    const wallItems = exhibitionArtworks
      .filter((item) => item.wallId === activeWallId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    if (!wallItems.length) return 1
    return (wallItems[wallItems.length - 1]?.order ?? wallItems.length) + 1
  }, [activeWallId, exhibitionArtworks])

  const wallsInUse = useMemo(
    () => wallCounts.filter((wall) => wall.count > 0).length,
    [wallCounts]
  )

  const currentSectionMeta = SECTION_META[activeSection]

  async function handleCreateExhibition() {
    try {
      setStatus("전시 생성 중...")

      const timestamp = Date.now()
      const slug = `exhibition-${timestamp}`

      await addDoc(collection(db, "exhibitions"), {
        slug,
        title: "New Exhibition",
        artist: "",
        period: "",
        description: "",
        summary: "",
        rightTitle: "About",
        rightBody: "",
        layoutPreset: "default",
        coverImage: "",
        isCurrent: false,
        isRecommended: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setStatus("전시를 추가했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("전시 생성 중 오류가 발생했습니다.")
    }
  }

  async function handleUpdateExhibition(
    id: string,
    payload: Partial<FirestoreExhibition>
  ) {
    try {
      await updateDoc(doc(db, "exhibitions", id), {
        ...payload,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(error)
      setStatus("전시 수정 중 오류가 발생했습니다.")
    }
  }

  async function handleDeleteExhibition(id: string) {
    const target = exhibitionDocs.find((item) => item.id === id)
    if (!target) return

    const ok = window.confirm(
      `"${target.title || "Untitled Exhibition"}" 전시를 삭제할까요?`
    )
    if (!ok) return

    try {
      setStatus("전시 삭제 중...")

      await deleteDoc(doc(db, "exhibitions", id))

      if (selectedExhibitionSlug === target.slug) {
        const next = exhibitionDocs.filter((item) => item.id !== id)
        const fallbackSlug = next[0]?.slug ?? exhibitions[0]?.slug ?? ""
        setSelectedExhibitionSlug(fallbackSlug)
      }

      setStatus("전시를 삭제했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("전시 삭제 중 오류가 발생했습니다.")
    }
  }

  async function normalizeWallOrders(
    nextArtworks: FirestoreArtwork[],
    exhibitionSlug: string,
    wallId: string
  ) {
    const targets = nextArtworks
      .filter(
        (item) => item.exhibitionSlug === exhibitionSlug && item.wallId === wallId
      )
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
        exhibitionSlug: selectedExhibitionSlug,
        width_cm: payload.width_cm,
        height_cm: payload.height_cm,
        order: payload.order,
        imageUrl,
        createdAt: serverTimestamp(),
      })

      setActiveWallId(payload.wallId)
      setActiveSection("works")
      setStatus(
        `등록 완료 · ${selectedExhibition?.title ?? selectedExhibitionSlug}`
      )
    } catch (error) {
      console.error(error)
      setStatus("업로드 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(artwork: AdminArtworkItem) {
    const typedArtwork = artwork as FirestoreArtwork
    const ok = window.confirm(
      `"${artwork.title || "Untitled"}" 작품을 삭제할까요?`
    )
    if (!ok) return

    try {
      setStatus("작품 삭제 중...")
      await deleteDoc(doc(db, "artworks", artwork.id))

      const next = artworks.filter((item) => item.id !== artwork.id)
      await normalizeWallOrders(next, typedArtwork.exhibitionSlug, artwork.wallId)

      setStatus("작품을 삭제했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("삭제 중 오류가 발생했습니다.")
    }
  }

  async function handleMoveWall(artwork: AdminArtworkItem, nextWallId: string) {
    const typedArtwork = artwork as FirestoreArtwork
    if (artwork.wallId === nextWallId) return

    try {
      setStatus("벽 이동 중...")

      const nextWallItems = exhibitionArtworks
        .filter((item) => item.wallId === nextWallId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      await updateDoc(doc(db, "artworks", artwork.id), {
        wallId: nextWallId,
        order: nextWallItems.length + 1,
      })

      const removedCurrent = artworks.filter((item) => item.id !== artwork.id)
      await normalizeWallOrders(
        removedCurrent,
        typedArtwork.exhibitionSlug,
        artwork.wallId
      )

      setActiveWallId(nextWallId)
      setActiveSection("walls")
      setStatus(`${nextWallId} 로 작품을 이동했습니다.`)
    } catch (error) {
      console.error(error)
      setStatus("벽 이동 중 오류가 발생했습니다.")
    }
  }

  async function handleMoveOrder(
    artwork: AdminArtworkItem,
    direction: "up" | "down"
  ) {
    const wallItems = exhibitionArtworks
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
      batch.update(doc(db, "artworks", targetArtwork.id), {
        order: currentOrder,
      })
      await batch.commit()

      setActiveWallId(artwork.wallId)
      setStatus("작품 순서를 조정했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("순서 조정 중 오류가 발생했습니다.")
    }
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <aside style={sidebarStyle}>
          <div style={brandBlockStyle}>
            <p style={eyebrowStyle}>Virtual Exhibition Admin</p>
            <h1 style={brandTitleStyle}>UNFRAME Console</h1>
            <p style={brandDescStyle}>
              전시 운영, 설치, 조명, 미디어, 카메라를 한 화면에서 관리합니다.
            </p>
          </div>

          <div style={exhibitionSelectWrapStyle}>
            <label style={smallLabelStyle}>Current Exhibition</label>
            <select
              value={selectedExhibitionSlug}
              onChange={(e) => setSelectedExhibitionSlug(e.target.value)}
              style={selectStyle}
            >
              {exhibitionOptions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <nav style={navStyle}>
            {(Object.keys(SECTION_META) as AdminSection[]).map((section) => {
              const meta = SECTION_META[section]
              const active = activeSection === section

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  style={{
                    ...navButtonStyle,
                    ...(active ? navButtonActiveStyle : null),
                  }}
                >
                  <span style={navLabelStyle}>{meta.label}</span>
                  <span style={navSubStyle}>{meta.title}</span>
                </button>
              )
            })}
          </nav>

          <div style={sidebarFooterStyle}>
            <div style={miniStatStyle}>
              <span style={miniStatLabelStyle}>Works</span>
              <strong style={miniStatValueStyle}>
                {exhibitionArtworks.length}
              </strong>
            </div>
            <div style={miniStatStyle}>
              <span style={miniStatLabelStyle}>Walls In Use</span>
              <strong style={miniStatValueStyle}>{wallsInUse}</strong>
            </div>
          </div>
        </aside>

        <section style={centerStyle}>
          <header style={centerHeaderStyle}>
            <div>
              <p style={sectionEyebrowStyle}>{currentSectionMeta.label}</p>
              <h2 style={sectionTitleStyle}>{currentSectionMeta.title}</h2>
              <p style={sectionDescStyle}>{currentSectionMeta.desc}</p>
            </div>

            <div style={statusPillStyle}>{status}</div>
          </header>

          <div style={centerBodyStyle}>
            {activeSection === "overview" && (
              <div style={sectionStackStyle}>
                <div style={overviewStatsGridStyle}>
                  <StatCard
                    label="Selected Exhibition"
                    value={selectedExhibition?.title ?? "-"}
                  />
                  <StatCard
                    label="Works In Exhibition"
                    value={String(exhibitionArtworks.length)}
                  />
                  <StatCard label="Walls In Use" value={String(wallsInUse)} />
                  <StatCard label="Active Wall" value={activeWallId} />
                </div>

                <AdminUploadForm
                  loading={loading}
                  suggestedOrder={suggestedOrder}
                  defaultWallId={activeWallId}
                  onSubmit={handleCreate}
                />

                <AdminExhibitionManager
                  exhibitions={exhibitionDocs}
                  selectedExhibitionId={
                    exhibitionDocs.find(
                      (item) => item.slug === selectedExhibitionSlug
                    )?.id ?? ""
                  }
                  onSelectExhibition={(id) => {
                    const target = exhibitionDocs.find((item) => item.id === id)
                    if (!target) return
                    setSelectedExhibitionSlug(target.slug)
                  }}
                  onCreateExhibition={handleCreateExhibition}
                  onUpdateExhibition={handleUpdateExhibition}
                  onDeleteExhibition={handleDeleteExhibition}
                />
              </div>
            )}

            {activeSection === "works" && (
              <div style={sectionStackStyle}>
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
            )}

            {activeSection === "walls" && (
              <div style={sectionStackStyle}>
                <div style={wallChipsWrapStyle}>
                  {wallCounts.map((wall) => (
                    <button
                      key={wall.id}
                      type="button"
                      onClick={() => setActiveWallId(wall.id)}
                      style={{
                        ...wallChipStyle,
                        ...(wall.id === activeWallId ? wallChipActiveStyle : null),
                      }}
                    >
                      <span>{wall.label}</span>
                      <span style={wallChipCountStyle}>{wall.count}</span>
                    </button>
                  ))}
                </div>

                <AdminWallBoard
                  artworks={exhibitionArtworks}
                  onMoveOrder={handleMoveOrder}
                  onMoveWall={handleMoveWall}
                />
              </div>
            )}

            {activeSection === "lighting" && (
              <div style={sectionStackStyle}>
                <AdminLightingPanel
                  selectedSlug={selectedExhibitionSlug}
                  selectedTitle={
                    selectedExhibition?.title ?? selectedExhibitionSlug
                  }
                  onLightingPreviewChange={setPreviewLighting}
                  onLightingSaved={setPreviewLighting}
                />
              </div>
            )}

            {activeSection === "media" && (
              <div style={sectionStackStyle}>
                <AdminVideoPanel
                  selectedSlug={selectedExhibitionSlug}
                  selectedTitle={
                    selectedExhibition?.title ?? selectedExhibitionSlug
                  }
                />
              </div>
            )}

            {activeSection === "camera" && (
              <div style={sectionStackStyle}>
                <div style={cameraIntroStyle}>
                  <p style={cameraIntroTextStyle}>
                    촬영 프리셋과 시네마틱 이동은 우측 프리뷰 패널에서 바로 확인합니다.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "assignments" && (
              <div style={sectionStackStyle}>
                <ExhibitionSpaceAssignment />
              </div>
            )}

            {activeSection === "spaces" && (
              <div style={sectionStackStyle}>
                <SpaceSelector />
              </div>
            )}
          </div>
        </section>

        <aside style={rightStyle}>
          <div style={rightTopStyle}>
            <div style={contextCardStyle}>
              <p style={contextEyebrowStyle}>Context</p>
              <div style={contextRowStyle}>
                <span style={contextLabelStyle}>Exhibition</span>
                <strong style={contextValueStyle}>
                  {selectedExhibition?.title ?? "-"}
                </strong>
              </div>
              <div style={contextRowStyle}>
                <span style={contextLabelStyle}>Active Wall</span>
                <strong style={contextValueStyle}>{activeWallId}</strong>
              </div>
              <div style={contextRowStyle}>
                <span style={contextLabelStyle}>Suggested Order</span>
                <strong style={contextValueStyle}>{suggestedOrder}</strong>
              </div>
            </div>
          </div>

          <div style={previewWrapStyle}>
            <AdminGalleryPreview
              exhibitionSlug={selectedExhibitionSlug}
              activeWallId={activeWallId}
              exhibition={selectedPreviewExhibition}
              lighting={previewLighting}
            />
          </div>
        </aside>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={statCardStyle}>
      <span style={statLabelStyle}>{label}</span>
      <strong style={statValueStyle}>{value}</strong>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(77,86,100,0.16) 0%, rgba(17,19,22,1) 34%, rgba(12,13,16,1) 100%)",
  color: "#f3f1ec",
  padding: 18,
}

const shellStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "260px minmax(0, 1fr) 460px",
  gap: 18,
  minHeight: "calc(100vh - 36px)",
}

const sidebarStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto auto 1fr auto",
  gap: 18,
  borderRadius: 28,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 20,
  backdropFilter: "blur(18px)",
}

const brandBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.42)",
}

const brandTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.02,
  fontWeight: 600,
}

const brandDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.55,
  color: "rgba(243,241,236,0.58)",
}

const exhibitionSelectWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const smallLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.56)",
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
  color: "#f3f1ec",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
}

const navStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  alignContent: "start",
}

const navButtonStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  textAlign: "left",
  padding: "14px 14px",
  borderRadius: 16,
  border: "1px solid transparent",
  background: "transparent",
  color: "#f3f1ec",
  cursor: "pointer",
}

const navButtonActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
}

const navLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#f3f1ec",
}

const navSubStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(243,241,236,0.48)",
}

const sidebarFooterStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
}

const miniStatStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 44,
  padding: "0 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
}

const miniStatLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.52)",
}

const miniStatValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#f3f1ec",
}

const centerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: 18,
  minWidth: 0,
}

const centerHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 18,
  alignItems: "flex-start",
  borderRadius: 28,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 22,
}

const sectionEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.42)",
}

const sectionTitleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: 34,
  lineHeight: 1.02,
  fontWeight: 600,
}

const sectionDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(243,241,236,0.58)",
}

const statusPillStyle: React.CSSProperties = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12,
  color: "rgba(243,241,236,0.74)",
}

const centerBodyStyle: React.CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  overflow: "auto",
  borderRadius: 28,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 18,
}

const sectionStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
}

const overviewStatsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
}

const statCardStyle: React.CSSProperties = {
  minHeight: 108,
  borderRadius: 20,
  padding: 18,
  display: "grid",
  alignContent: "space-between",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
}

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.46)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
}

const statValueStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1.1,
  fontWeight: 600,
}

const wallChipsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
}

const wallChipStyle: React.CSSProperties = {
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f3f1ec",
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
}

const wallChipActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.16)",
}

const wallChipCountStyle: React.CSSProperties = {
  minWidth: 22,
  height: 22,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 11,
}

const cameraIntroStyle: React.CSSProperties = {
  minHeight: 140,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.035)",
  display: "grid",
  placeItems: "center",
  padding: 24,
}

const cameraIntroTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "rgba(243,241,236,0.66)",
  textAlign: "center",
}

const rightStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: 18,
  minHeight: 0,
}

const rightTopStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
}

const contextCardStyle: React.CSSProperties = {
  borderRadius: 28,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 20,
  display: "grid",
  gap: 12,
}

const contextEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.42)",
}

const contextRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
}

const contextLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.5)",
}

const contextValueStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#f3f1ec",
}

const previewWrapStyle: React.CSSProperties = {
  minHeight: 0,
  overflow: "auto",
}
