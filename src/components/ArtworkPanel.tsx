"use client"

import { useArtworkStore } from "@/store/useArtworkStore"

export default function ArtworkPanel() {

  const { selected, close } = useArtworkStore()

  if (!selected) return null

  return (
    <div style={{
      position:"fixed",
      right:30,
      top:30,
      width:320,
      background:"rgba(0,0,0,0.85)",
      color:"white",
      padding:20,
      borderRadius:12,
      backdropFilter:"blur(8px)",
      zIndex:9999
    }}>

      <img
        src={selected.imageUrl}
        style={{
          width:"100%",
          borderRadius:8,
          marginBottom:12
        }}
      />

      <h3 style={{margin:0}}>
        {selected.title}
      </h3>

      <p style={{
        margin:"4px 0 10px 0",
        opacity:0.8
      }}>
        {selected.artist}
      </p>

      <p style={{
        fontSize:13,
        opacity:0.7
      }}>
        {Math.round(selected.width_cm)} × {Math.round(selected.height_cm)} cm
      </p>

      <button
        onClick={close}
        style={{
          marginTop:12,
          padding:"8px 14px",
          borderRadius:6,
          border:"none",
          background:"white",
          cursor:"pointer"
        }}
      >
        Close
      </button>

    </div>
  )
}