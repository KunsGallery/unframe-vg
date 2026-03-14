"use client"

type Props = {
  title: string
  artist: string
  image: string
  onClose: () => void
}

export default function ArtworkModal({ title, artist, image, onClose }: Props) {

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "10px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center"
        }}
        onClick={(e)=>e.stopPropagation()}
      >
        <img
          src={image}
          style={{
            width: "100%",
            borderRadius: "6px",
            marginBottom: "12px"
          }}
        />

        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ opacity: 0.7 }}>{artist}</p>

        <button
          style={{
            marginTop: "12px",
            padding: "8px 14px",
            border: "none",
            background: "black",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={onClose}
        >
          Close
        </button>

      </div>
    </div>
  )
}