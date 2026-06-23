"use client"

import { WALL_GROUPS } from "@/lib/adminWalls"
import type { AdminArtworkItem } from "./AdminArtworkLibrary"

type Props = {
  artworks: AdminArtworkItem[]
  onMoveOrder: (artwork: AdminArtworkItem, direction: "up" | "down") => Promise<void>
  onMoveWall: (artwork: AdminArtworkItem, nextWallId: string) => Promise<void>
}

const DEFAULT_EMPTY_SLOTS = 4

export default function AdminWallBoard({
  artworks,
  onMoveOrder,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Installation Board</p>
          <h2 style={titleStyle}>벽별 슬롯 배치 보드</h2>
          <p style={descStyle}>
            작품은 자동 간격으로 배치되고, 여기서는 슬롯 순서만 바꿉니다.
          </p>
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

                const totalSlots = Math.max(DEFAULT_EMPTY_SLOTS, items.length)
                const slots = Array.from({ length: totalSlots }, (_, index) => ({
                  slot: index + 1,
                  artwork: items[index] ?? null,
                }))

                return (
                  <div key={wall.id} style={wallCardStyle}>
                    <div style={wallCardHeaderStyle}>
                      <div>
                        <h4 style={wallTitleStyle}>{wall.label}</h4>
                        <p style={wallMetaStyle}>
                          length {wall.length}m · {items.length} works
                        </p>
                      </div>

                      <div style={wallCountBadgeStyle}>
                        {items.length}/{totalSlots}
                      </div>
                    </div>

                    <div style={slotRailStyle}>
                      {slots.map(({ slot, artwork }) => {
                        const isEmpty = artwork == null

                        return (
                          <div
                            key={`${wall.id}-slot-${slot}`}
                            style={{
                              ...slotCardStyle,
                              ...(isEmpty ? emptySlotCardStyle : filledSlotCardStyle),
                            }}
                          >
                            <div style={slotTopRowStyle}>
                              <div style={slotIndexBadgeStyle}>{slot}</div>
                              {!isEmpty ? (
                                <div style={slotPositionTextStyle}>현재 슬롯</div>
                              ) : (
                                <div style={emptyTextStyle}>빈 슬롯</div>
                              )}
                            </div>

                            {isEmpty ? (
                              <div style={emptyBodyStyle}>
                                <div style={emptyArtworkBoxStyle} />
                              </div>
                            ) : (
                              <div style={filledBodyStyle}>
                                <img
                                  src={artwork.imageUrl}
                                  alt={artwork.title ?? "artwork"}
                                  style={wallThumbStyle}
                                />

                                <div style={slotMetaStyle}>
                                  <h5 style={workTitleStyle}>
                                    {artwork.title || "Untitled"}
                                  </h5>
                                  <p style={workSubStyle}>
                                    {artwork.artist || "Unknown Artist"}
                                  </p>
                                </div>

                                <div style={buttonRowStyle}>
                                  <button
                                    type="button"
                                    onClick={() => void onMoveOrder(artwork, "up")}
                                    disabled={slot === 1}
                                    style={{
                                      ...slotButtonStyle,
                                      ...(slot === 1 ? disabledButtonStyle : null),
                                    }}
                                    title="왼쪽 슬롯으로 이동"
                                  >
                                    ←
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => void onMoveOrder(artwork, "down")}
                                    disabled={slot === items.length}
                                    style={{
                                      ...slotButtonStyle,
                                      ...(slot === items.length ? disabledButtonStyle : null),
                                    }}
                                    title="오른쪽 슬롯으로 이동"
                                  >
                                    →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
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
  margin: "6px 0 8px",
  fontSize: 28,
  lineHeight: 1.1,
  color: "#f5f7fb",
}

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "rgba(255,255,255,0.56)",
  lineHeight: 1.5,
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
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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

const wallCountBadgeStyle: React.CSSProperties = {
  minWidth: 54,
  height: 30,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  color: "#f5f7fb",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
}

const slotRailStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
}

const slotCardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 12,
  border: "1px solid rgba(255,255,255,0.08)",
}

const filledSlotCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
}

const emptySlotCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px dashed rgba(255,255,255,0.12)",
}

const slotTopRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
}

const slotIndexBadgeStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  color: "#f5f7fb",
  background: "rgba(255,255,255,0.08)",
}

const slotPositionTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.52)",
}

const emptyTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.34)",
}

const filledBodyStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "60px 1fr auto",
  gap: 10,
  alignItems: "center",
}

const emptyBodyStyle: React.CSSProperties = {
  minHeight: 72,
  display: "grid",
  alignItems: "center",
}

const emptyArtworkBoxStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 10,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)",
}

const wallThumbStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  objectFit: "cover",
  borderRadius: 10,
  display: "block",
  background: "#0d1117",
}

const slotMetaStyle: React.CSSProperties = {
  minWidth: 0,
}

const workTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#f5f7fb",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}

const workSubStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.54)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
}

const slotButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#f5f7fb",
  fontSize: 14,
  cursor: "pointer",
}

const disabledButtonStyle: React.CSSProperties = {
  opacity: 0.35,
  cursor: "not-allowed",
}