"use client"

export default function StartOverlay({
  start
}: {
  start: () => void
}) {

  return (
    <div
      onClick={start}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: 1000
      }}
    >
      Click to enter gallery
    </div>
  )
}