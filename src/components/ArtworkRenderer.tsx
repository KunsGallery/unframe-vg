"use client"

import * as THREE from "three"
import { useMemo } from "react"
import { useTexture } from "@react-three/drei"
import { galleryWalls } from "@/data/galleryWalls"

type Artwork = {
  id: string
  title?: string
  artist?: string
  imageUrl: string
  wallId: string
  width_cm: number
  height_cm: number
  order?: number
}

type Props = {
  artworks: Artwork[]
  spacing_cm?: number
  centerLine_cm?: number
}

export default function ArtworkRenderer({
  artworks,
  spacing_cm = 80,
  centerLine_cm = 150,
}: Props) {

  const spacing = spacing_cm / 100
  const centerLine = centerLine_cm / 100

  return (
    <>
      {artworks.map((artwork) => {

        const wall = galleryWalls.find(w => w.id === artwork.wallId)
        if (!wall) return null

        const width = artwork.width_cm / 100
        const height = artwork.height_cm / 100

        const order = artwork.order ?? 0

        const offsetX = order * spacing

        const position: [number, number, number] = [
          wall.position[0] + Math.cos(wall.rotation[1]) * offsetX,
          centerLine,
          wall.position[2] - Math.sin(wall.rotation[1]) * offsetX
        ]

        const rotation: [number, number, number] = wall.rotation

        return (
          <ArtworkMesh
            key={artwork.id}
            imageUrl={artwork.imageUrl}
            width={width}
            height={height}
            position={position}
            rotation={rotation}
          />
        )
      })}
    </>
  )
}

function ArtworkMesh({
  imageUrl,
  width,
  height,
  position,
  rotation,
}: {
  imageUrl: string
  width: number
  height: number
  position: [number, number, number]
  rotation: [number, number, number]
}) {

  const texture = useTexture(imageUrl)

  useMemo(() => {

    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 16
    texture.flipY = false

  }, [texture])

  return (
    <group position={position} rotation={rotation}>

      {/* 액자 프레임 */}

      <mesh position={[0,0,-0.01]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* 캔버스 */}

      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

    </group>
  )
}