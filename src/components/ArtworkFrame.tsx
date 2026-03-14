"use client"

import { useTexture, Html } from "@react-three/drei"
import { useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

type Props = {
  position: [number, number, number]
  image: string
  title: string
  artist: string
  onClick: () => void
}

export default function ArtworkFrame({
  position,
  image,
  title,
  artist,
  onClick
}: Props) {

  const texture = useTexture(image) as THREE.Texture
  texture.colorSpace = THREE.SRGBColorSpace

  const [hovered, setHovered] = useState(false)
  const [near, setNear] = useState(false)

  const { camera } = useThree()

  useFrame(() => {

    const dist = camera.position.distanceTo(
      new THREE.Vector3(...position)
    )

    setNear(dist < 3)

  })

  return (
    <group position={position}>

      <mesh
        onPointerEnter={() => near && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => near && onClick()}
      >
        <planeGeometry args={[1.2, 1.6]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {hovered && near && (
        <Html position={[0,-1.1,0]} center>
          <div
            style={{
              background:"rgba(0,0,0,0.7)",
              color:"white",
              padding:"8px 12px",
              borderRadius:"6px",
              fontSize:"12px",
              textAlign:"center",
              width:"150px"
            }}
          >
            <div style={{fontWeight:600}}>{title}</div>
            <div style={{opacity:0.8}}>{artist}</div>
          </div>
        </Html>
      )}

    </group>
  )
}