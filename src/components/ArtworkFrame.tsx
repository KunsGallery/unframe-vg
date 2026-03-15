"use client"

import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useState } from "react"
import { useArtworkStore } from "@/store/useArtworkStore"

type Props = {
  artwork: {
    id: string
    title: string
    artist: string
    imageUrl: string
    width_m: number
    height_m: number
  }
}

export default function ArtworkFrame({ artwork }: Props) {
  const texture = useTexture(artwork.imageUrl) as THREE.Texture
  texture.colorSpace = THREE.SRGBColorSpace

  const open = useArtworkStore((s) => s.open)
  const [hover, setHover] = useState(false)

  const framePad = 0.08

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation()
        open({
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          imageUrl: artwork.imageUrl,
          width_cm: artwork.width_m * 100,
          height_cm: artwork.height_m * 100,
        })
      }}
    >
      {/* frame */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry
          args={[
            artwork.width_m + framePad,
            artwork.height_m + framePad,
            0.04,
          ]}
        />
        <meshStandardMaterial color={hover ? "#4fd1ff" : "#111"} />
      </mesh>

      {/* artwork */}
      <mesh>
        <planeGeometry args={[artwork.width_m, artwork.height_m]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  )
}