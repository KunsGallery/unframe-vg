"use client"

import { WALL_GROUPS } from "@/lib/adminWalls"
import type { AdminArtworkItem } from "./AdminArtworkLibrary"

type Props = {
  artworks: AdminArtworkItem[]
  onMoveOrder: (artwork: AdminArtworkItem, direction: "up" | "down") => Promise<void>
  onMoveWall: (artwork: AdminArtworkItem, nextWallId: string) => Promise<void>
}

export default function AdminWallBoard({
  artworks,
  onMoveOrder,
  onMoveWall,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Installation Board</p>
          <h2 style={titleStyle}>벽별 배치 보드</h2>
        </div>
      </div>

      <div style={groupListStyle}>
        {WALL_GROUPS.map((group) => (
          <div key={group.key} style={groupStyle}>
            <div style={groupHeaderStyle}>
              <h3 style={groupTitleStyle}>{group.title}</h3>
            </div>

            <div style={wallsGridStyle}>
              {group.walls.map((wall) => {
                const items = artworks
                  .filter((artwork) => artwork.wallId === wall.id)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

                return (
                  <div key={wall.id} style={wallCardStyle}>
                    <div style={wallCardHeaderStyle}>
                      <div>
                        <h4 style={wallTitleStyle}>{wall.label}</h4>
                        <p style={wallMetaStyle}>
                          length {wall.length}m · {items.length} works
                        </p>
                      </div>
                    </div>

                    <div style={wallItemsStyle}>
                      {items.length === 0 ? (
                        <div style={emptyWallStyle}>이 벽에는 아직 작품이 없습니다.</div>
                      ) : (
                        items.map((artwork, index) => (
                          <article key={artwork.id} style={wallItemStyle}>
                            <img
                              src={artwork.imageUrl}
                              alt={artwork.title ?? "artwork"}
                              style={wallThumbStyle}
                            />

                            <div style={wallItemMetaStyle}>
                              <div>
                                <h5 style={workTitleStyle}>{artwork.title || "Untitled"}</h5>
                                <p style={workSubStyle}>
                                  {artwork.artist || "Unknown Artist"} · #{artwork.order ?? index + 1}
                                </p>
                              </div>

                              <div style={buttonRowStyle}>
                                <button
                                  type="button"
                                  onClick={() => void onMoveOrder(artwork, "up")}
                                  disabled={index === 0}
                                  style={{
                                    ...smallButtonStyle,
                                    opacity: index === 0 ? 0.35 : 1,
                                    cursor: index === 0 ? "not-allowed" : "pointer",
                                  }}
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void onMoveOrder(artwork, "down")}
                                  disabled={index === items.length - 1}
                                  style={{
                                    ...smallButtonStyle,
                                    opacity: index === items.length - 1 ? 0.35 : 1,
                                    cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                                  }}
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
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
}

const headerStyle: React.CSSProperties = {
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

const groupListStyle: React.CSSProperties = {
  display: "grid",
  gap: 24,
}

const groupStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
}

const groupHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}

const groupTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  color: "#f5f7fb",
}

const wallsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
}

const wallCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
}

const wallCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
}

const wallTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: "#f5f7fb",
}

const wallMetaStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.5)",
}

const wallItemsStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
}

const emptyWallStyle: React.CSSProperties = {
  minHeight: 120,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  border: "1px dashed rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.42)",
  textAlign: "center",
  padding: 16,
}

const wallItemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "60px 1fr",
  gap: 10,
  alignItems: "center",
  padding: 10,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
}

const wallThumbStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  objectFit: "cover",
  borderRadius: 10,
  display: "block",
  background: "#0d1117",
}

const wallItemMetaStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  alignItems: "center",
}

const workTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#f5f7fb",
}

const workSubStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.54)",
}

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
}

const smallButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#f5f7fb",
}