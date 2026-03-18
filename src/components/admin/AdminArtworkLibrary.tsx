"use client"

import { WALL_LABEL_MAP } from "@/lib/adminWalls"

export type AdminArtworkItem = {
  id: string
  title?: string
  artist?: string
  wallId: string
  width_cm: number
  height_cm: number
  order?: number
  imageUrl: string
}

type Props = {
  artworks: AdminArtworkItem[]
  onDelete: (artwork: AdminArtworkItem) => Promise<void>
  onMoveWall: (artwork: AdminArtworkItem, nextWallId: string) => Promise<void>
  walls: { id: string; label: string }[]
}

export default function AdminArtworkLibrary({
  artworks,
  onDelete,
  onMoveWall,
  walls,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Artwork Library</p>
          <h2 style={titleStyle}>등록된 작품</h2>
        </div>
        <span style={countBadgeStyle}>{artworks.length} works</span>
      </div>

      <div style={listStyle}>
        {artworks.length === 0 ? (
          <div style={emptyStyle}>등록된 작품이 아직 없습니다.</div>
        ) : (
          artworks.map((artwork) => (
            <article key={artwork.id} style={itemStyle}>
              <img src={artwork.imageUrl} alt={artwork.title ?? "artwork"} style={thumbStyle} />

              <div style={metaStyle}>
                <div>
                  <h3 style={itemTitleStyle}>{artwork.title || "Untitled"}</h3>
                  <p style={itemArtistStyle}>{artwork.artist || "Unknown Artist"}</p>
                </div>

                <div style={chipsRowStyle}>
                  <span style={chipStyle}>{artwork.width_cm} × {artwork.height_cm} cm</span>
                  <span style={chipStyle}>{WALL_LABEL_MAP[artwork.wallId] ?? artwork.wallId}</span>
                  <span style={chipStyle}>#{artwork.order ?? 1}</span>
                </div>

                <div style={actionsRowStyle}>
                  <select
                    value={artwork.wallId}
                    onChange={(e) => void onMoveWall(artwork, e.target.value)}
                    style={selectStyle}
                  >
                    {walls.map((wall) => (
                      <option key={wall.id} value={wall.id}>
                        {wall.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => void onDelete(artwork)}
                    style={deleteButtonStyle}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(20,22,28,0.92) 0%, rgba(13,15,20,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
  minHeight: 560,
}

const headerStyle: React.CSSProperties = {
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

const countBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  padding: "0 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  color: "#f5f7fb",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
}

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  maxHeight: 920,
  overflowY: "auto",
  paddingRight: 4,
}

const emptyStyle: React.CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  borderRadius: 20,
  border: "1px dashed rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.5)",
}

const itemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "116px 1fr",
  gap: 14,
  padding: 14,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
}

const thumbStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  display: "block",
  background: "#0d1117",
}

const metaStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
}

const itemTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  color: "#f5f7fb",
}

const itemArtistStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
}

const chipsRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "0 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  color: "rgba(255,255,255,0.78)",
}

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
}

const selectStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 42,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "0 12px",
  fontSize: 14,
}

const deleteButtonStyle: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 14,
  border: "1px solid rgba(255,120,120,0.26)",
  background: "rgba(255,120,120,0.08)",
  color: "#ffd1d1",
  padding: "0 14px",
  fontSize: 14,
  cursor: "pointer",
}