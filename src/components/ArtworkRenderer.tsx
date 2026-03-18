"use client"

import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"
import { Text, useTexture } from "@react-three/drei"
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber"
import { galleryWalls, type GalleryWall } from "@/data/galleryWalls"
import { useArtworkStore } from "@/store/useArtworkStore"

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
}

type PositionedArtwork = Artwork & {
  width_m: number
  height_m: number
  position: [number, number, number]
  rotation: [number, number, number]
  wall: GalleryWall
}

export default function ArtworkRenderer({
  artworks,
  spacing_cm = 90,
}: Props) {
  const spacing = spacing_cm / 100

  const positioned = useMemo<PositionedArtwork[]>(() => {
    return galleryWalls.flatMap((wall) => {
      const items = artworks
        .filter((artwork) => artwork.wallId === wall.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      if (!items.length) return []

      if (wall.id === "info_wall" && wall.reservedCenterGap) {
        return layoutInfoWall(items, wall, spacing)
      }

      return layoutStraightWall(items, wall, spacing)
    })
  }, [artworks, spacing])

  return (
    <>
      {positioned.map((artwork) => (
        <ArtworkMesh key={artwork.id} artwork={artwork} />
      ))}
    </>
  )
}

function layoutStraightWall(
  items: Artwork[],
  wall: GalleryWall,
  spacing: number
): PositionedArtwork[] {
  const widths = items.map((item) => item.width_cm / 100)
  const totalWidth = widths.reduce((acc, current) => acc + current, 0)
  const totalSpacing = spacing * Math.max(items.length - 1, 0)
  const runLength = totalWidth + totalSpacing
  let cursor = -runLength / 2

  return items.map((artwork, index) => {
    const width_m = artwork.width_cm / 100
    const height_m = artwork.height_cm / 100

    const localCenter = cursor + width_m / 2
    cursor += width_m + spacing

    return buildPositionedArtwork(artwork, wall, width_m, height_m, localCenter, index)
  })
}

function layoutInfoWall(
  items: Artwork[],
  wall: GalleryWall,
  spacing: number
): PositionedArtwork[] {
  const gap = wall.reservedCenterGap ?? 0
  const left: Artwork[] = []
  const right: Artwork[] = []

  items.forEach((item, index) => {
    if (index % 2 === 0) left.push(item)
    else right.push(item)
  })

  const result: PositionedArtwork[] = []

  const placeSide = (sideItems: Artwork[], direction: "left" | "right") => {
    let cursor =
      direction === "left"
        ? -(gap / 2) - spacing
        : gap / 2 + spacing

    sideItems.forEach((artwork, index) => {
      const width_m = artwork.width_cm / 100
      const height_m = artwork.height_cm / 100

      const localCenter =
        direction === "left"
          ? cursor - width_m / 2
          : cursor + width_m / 2

      result.push(
        buildPositionedArtwork(
          artwork,
          wall,
          width_m,
          height_m,
          localCenter,
          index
        )
      )

      if (direction === "left") {
        cursor -= width_m + spacing
      } else {
        cursor += width_m + spacing
      }
    })
  }

  placeSide(left, "left")
  placeSide(right, "right")

  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function buildPositionedArtwork(
  artwork: Artwork,
  wall: GalleryWall,
  width_m: number,
  height_m: number,
  localCenter: number,
  index: number
): PositionedArtwork {
  const yaw = wall.rotation[1] + Math.PI

  const tangentX = Math.cos(yaw)
  const tangentZ = -Math.sin(yaw)

  const normalX = Math.sin(yaw)
  const normalZ = Math.cos(yaw)

  const offsetFromWall =
  wall.id === "poster_wall"
    ? -(wall.thickness / 2 + wall.artworkOffset)
    : wall.thickness / 2 + wall.artworkOffset

  const position: [number, number, number] = [
    wall.position[0] + tangentX * localCenter + normalX * offsetFromWall,
    wall.artCenterY,
    wall.position[2] + tangentZ * localCenter + normalZ * offsetFromWall,
  ]

  return {
    ...artwork,
    order: artwork.order ?? index,
    width_m,
    height_m,
    wall,
    position,
    rotation: [wall.rotation[0], yaw, wall.rotation[2]],
  }
}

function ArtworkMesh({ artwork }: { artwork: PositionedArtwork }) {
  const texture = useTexture("/test/poster.jpg")
  const open = useArtworkStore((state) => state.open)
  const selected = useArtworkStore((state) => state.selected)
  const lastClosedAt = useArtworkStore((state) => state.lastClosedAt)

  const { gl, camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const [hovered, setHovered] = useState(false)
  const [isNearEnough, setIsNearEnough] = useState(false)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy())
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.flipY = true
    texture.needsUpdate = true
  }, [gl, texture])

  useFrame(() => {
    if (!groupRef.current) return

    const worldPos = new THREE.Vector3()
    groupRef.current.getWorldPosition(worldPos)
    const distance = camera.position.distanceTo(worldPos)
    const near = distance <= 4.2

    if (near !== isNearEnough) setIsNearEnough(near)
    if (!near && hovered) setHovered(false)
  })

  useEffect(() => {
    document.body.style.cursor =
      hovered && !selected && isNearEnough ? "pointer" : "default"

    return () => {
      document.body.style.cursor = "default"
    }
  }, [hovered, selected, isNearEnough])

  function handleOpen(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()

    if (selected) return
    if (!isNearEnough) return
    if (Date.now() - lastClosedAt < 420) return

    open({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      imageUrl: artwork.imageUrl,
      width_cm: artwork.width_m * 100,
      height_cm: artwork.height_m * 100,
    })
  }

  const framePadding = 0.09
  const mattePadding = 0.032

  const labelWidth = 0.42
  const labelHeight = 0.11
  const labelGap = 0.06

  const labelX = artwork.width_m / 2 + labelGap + labelWidth / 2
  const labelY = -artwork.height_m / 2 + labelHeight / 2
  const labelZ = 0.003

  return (
    <group
      ref={groupRef}
      position={artwork.position}
      rotation={artwork.rotation}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!selected && isNearEnough) setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
      onClick={handleOpen}
    >
      <mesh position={[0, 0, -0.03]} castShadow={false} receiveShadow={false}>
        <boxGeometry
          args={[
            artwork.width_m + framePadding,
            artwork.height_m + framePadding,
            0.055,
          ]}
        />
        <meshStandardMaterial
          color={hovered ? "#2a241d" : "#171411"}
          roughness={0.5}
          metalness={0.22}
          emissive={hovered ? "#241b11" : "#000000"}
          emissiveIntensity={hovered ? 0.16 : 0}
        />
      </mesh>

      <mesh position={[0, 0, -0.007]} castShadow={false} receiveShadow={false}>
        <planeGeometry
          args={[
            artwork.width_m + mattePadding,
            artwork.height_m + mattePadding,
          ]}
        />
        <meshStandardMaterial
          color="#f3efe6"
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      <mesh position={[0, 0, 0.001]} castShadow={false} receiveShadow={false}>
        <planeGeometry args={[artwork.width_m, artwork.height_m]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {isNearEnough && artwork.wall.id !== "poster_wall" ? (
        <group position={[labelX, labelY, labelZ]}>
          <mesh castShadow={false} receiveShadow={false}>
            <planeGeometry args={[labelWidth, labelHeight]} />
            <meshStandardMaterial
              color="#f3efe6"
              roughness={0.92}
              metalness={0.02}
            />
          </mesh>

          <Text
            position={[-labelWidth / 2 + 0.02, labelHeight / 2 - 0.026, 0.001]}
            anchorX="left"
            anchorY="top"
            fontSize={0.018}
            lineHeight={1.15}
            maxWidth={labelWidth - 0.04}
            color="#161616"
          >
            {artwork.title || "Untitled"}
          </Text>

          <Text
            position={[-labelWidth / 2 + 0.02, 0.002, 0.001]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.013}
            lineHeight={1.1}
            maxWidth={labelWidth - 0.04}
            color="#3f3f3f"
          >
            {artwork.artist || "Unknown Artist"}
          </Text>

          <Text
            position={[-labelWidth / 2 + 0.02, -labelHeight / 2 + 0.02, 0.001]}
            anchorX="left"
            anchorY="bottom"
            fontSize={0.012}
            lineHeight={1.1}
            maxWidth={labelWidth - 0.04}
            color="#5a5a5a"
          >
            {`${Math.round(artwork.width_m * 100)} × ${Math.round(artwork.height_m * 100)} cm`}
          </Text>
        </group>
      ) : null}
    </group>
  )
}