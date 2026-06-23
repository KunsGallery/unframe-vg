"use client"

import { useState } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminVideoPanel({
  selectedSlug,
  selectedTitle,
}: {
  selectedSlug: string
  selectedTitle: string
}) {
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("CylinderWall 영상 URL 입력 대기 중")

  async function handleSave() {
    if (!selectedSlug || !videoUrl.trim()) return

    try {
      setLoading(true)
      setStatus("영상 URL 저장 중...")

      await setDoc(
        doc(db, "exhibitionSettings", selectedSlug),
        {
          slug: selectedSlug,
          media: {
            cylinderWallVideoUrl: videoUrl.trim(),
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      )

      setStatus("CylinderWall 영상 URL 저장 완료")
    } catch (error) {
      console.error(error)
      setStatus("영상 URL 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>CylinderWall Media</p>
          <h3 style={titleStyle}>원형벽 영상 URL 저장</h3>
          <p style={descStyle}>
            현재 선택된 전시 <strong>{selectedTitle}</strong>에만 적용됩니다.
          </p>
        </div>

        <div style={statusStyle}>{status}</div>
      </div>

      <div style={bodyStyle}>
        <input
          type="text"
          placeholder="https://..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={inputStyle}
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleSave}
          style={buttonStyle}
          disabled={!videoUrl.trim() || loading}
        >
          {loading ? "저장 중..." : "CylinderWall 영상 URL 저장"}
        </button>
      </div>
    </section>
  )
}

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  marginTop: 24,
}

const headerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 16,
  marginBottom: 16,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const titleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: 24,
  lineHeight: 1.05,
}

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.68)",
}

const statusStyle: React.CSSProperties = {
  minHeight: 56,
  borderRadius: 16,
  padding: "14px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.76)",
  fontSize: 13,
  lineHeight: 1.5,
}

const bodyStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 320,
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
}

const buttonStyle: React.CSSProperties = {
  minHeight: 46,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #f5f1ea 0%, #ddd0bd 100%)",
  color: "#12161d",
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
}