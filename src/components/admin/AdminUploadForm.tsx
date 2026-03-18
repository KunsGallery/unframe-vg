"use client"

import { useEffect, useMemo, useState } from "react"
import { ADMIN_WALLS } from "@/lib/adminWalls"

type Props = {
  loading: boolean
  suggestedOrder: number
  defaultWallId: string
  onSubmit: (payload: {
    title: string
    artist: string
    wallId: string
    width_cm: number
    height_cm: number
    order: number
    file: File
  }) => Promise<void>
}

export default function AdminUploadForm({
  loading,
  suggestedOrder,
  defaultWallId,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [wallId, setWallId] = useState(defaultWallId)
  const [widthCm, setWidthCm] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [order, setOrder] = useState(String(suggestedOrder))
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    setWallId(defaultWallId)
  }, [defaultWallId])

  useEffect(() => {
    setOrder(String(suggestedOrder))
  }, [suggestedOrder, wallId])

  const previewUrl = useMemo(() => {
    if (!file) return ""
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!file) {
      setError("작품 이미지를 먼저 선택해주세요.")
      return
    }

    if (!title.trim() || !artist.trim()) {
      setError("작품명과 작가명을 입력해주세요.")
      return
    }

    if (!widthCm || !heightCm) {
      setError("가로/세로(cm)를 입력해주세요.")
      return
    }

    const width = Number(widthCm)
    const height = Number(heightCm)
    const nextOrder = Number(order)

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      setError("작품 크기는 0보다 큰 숫자여야 합니다.")
      return
    }

    if (!Number.isFinite(nextOrder) || nextOrder <= 0) {
      setError("순서는 1 이상의 숫자여야 합니다.")
      return
    }

    await onSubmit({
      title: title.trim(),
      artist: artist.trim(),
      wallId,
      width_cm: width,
      height_cm: height,
      order: nextOrder,
      file,
    })

    setTitle("")
    setArtist("")
    setWidthCm("")
    setHeightCm("")
    setOrder(String(suggestedOrder))
    setFile(null)
    setError("")
  }

  return (
    <section style={cardStyle}>
      <div style={headerRowStyle}>
        <div>
          <p style={eyebrowStyle}>Artwork Intake</p>
          <h2 style={titleStyle}>작품 등록</h2>
        </div>
        <button
          type="button"
          onClick={() => window.open("/", "_blank")}
          style={ghostButtonStyle}
        >
          갤러리 미리보기
        </button>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={previewWrapStyle}>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" style={previewImageStyle} />
          ) : (
            <div style={emptyPreviewStyle}>
              <span style={emptyPreviewTitleStyle}>Preview</span>
              <span style={emptyPreviewSubStyle}>작품 이미지를 선택하면 미리보기가 표시됩니다.</span>
            </div>
          )}
        </div>

        <label style={uploadButtonWrapStyle}>
          <span style={uploadLabelStyle}>작품 이미지 선택</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
          <span style={uploadButtonStyle}>
            {file ? file.name : "파일 고르기"}
          </span>
        </label>

        <div style={fieldGridStyle}>
          <Field label="작품명">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              style={inputStyle}
            />
          </Field>

          <Field label="작가명">
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist Name"
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={fieldGridStyle}>
          <Field label="걸 벽">
            <select
              value={wallId}
              onChange={(e) => setWallId(e.target.value)}
              style={inputStyle}
            >
              {ADMIN_WALLS.map((wall) => (
                <option key={wall.id} value={wall.id}>
                  {wall.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="벽 안 순서">
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={fieldGridStyle}>
          <Field label="가로(cm)">
            <input
              type="number"
              min={1}
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
              placeholder="100"
              style={inputStyle}
            />
          </Field>

          <Field label="세로(cm)">
            <input
              type="number"
              min={1}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="80"
              style={inputStyle}
            />
          </Field>
        </div>

        {error ? <p style={errorStyle}>{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...primaryButtonStyle,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "업로드 중..." : "작품 등록"}
        </button>
      </form>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  )
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(20,22,28,0.92) 0%, rgba(13,15,20,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
}

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const titleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 28,
  lineHeight: 1.1,
  color: "#f5f7fb",
}

const ghostButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  cursor: "pointer",
}

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
}

const previewWrapStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}

const previewImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
}

const emptyPreviewStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  padding: 24,
  color: "rgba(255,255,255,0.72)",
}

const emptyPreviewTitleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 18,
  fontWeight: 600,
}

const emptyPreviewSubStyle: React.CSSProperties = {
  display: "block",
  marginTop: 8,
  fontSize: 14,
  color: "rgba(255,255,255,0.45)",
}

const uploadButtonWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
}

const uploadLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
}

const uploadButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.06)",
  color: "#f5f7fb",
  border: "1px dashed rgba(255,255,255,0.16)",
  fontSize: 14,
}

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
}

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 50,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "0 14px",
  fontSize: 15,
  outline: "none",
}

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffb4b4",
  fontSize: 14,
}

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 52,
  border: "none",
  borderRadius: 16,
  background: "linear-gradient(135deg, #f5f7fb 0%, #d7ddea 100%)",
  color: "#11151c",
  fontSize: 15,
  fontWeight: 700,
}