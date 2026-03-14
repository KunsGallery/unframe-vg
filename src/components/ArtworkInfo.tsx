"use client"

export default function ArtworkInfo({ title, artist }: any) {

  return (
    <div
      style={{
        position: "absolute",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontSize: "14px",
        pointerEvents: "none"
      }}
    >
      <strong>{title}</strong><br/>
      {artist}
    </div>
  )

}