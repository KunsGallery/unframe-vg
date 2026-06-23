"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { galleryWalls, type GalleryWall } from "@/data/galleryWalls"
import { type ExhibitionLighting } from "@/data/exhibitions"

type FirestoreArtwork = {
  id: string
  wallId: string
  exhibitionSlug?: string
  width_cm: number
  height_cm: number
  order?: number
}

type PositionedArtwork = FirestoreArtwork & {
  width_m: number
  height_m: number
  position: [number, number, number]
  rotation: [number, number, number]
  wall: GalleryWall
}

type Props = {
  lighting: ExhibitionLighting
  exhibitionSlug: string
}

const FRAME_PADDING_X = 0.18
const FRAME_PADDING_Y = 0.18

function kelvinToColor(kelvin: number) {
  const temperature = THREE.MathUtils.clamp(kelvin, 1000, 12000) / 100
  let red: number
  let green: number
  let blue: number

  if (temperature <= 66) {
    red = 255
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661
    blue =
      temperature <= 19
        ? 0
        : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592)
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492)
    blue = 255
  }

  return new THREE.Color(
    `rgb(${THREE.MathUtils.clamp(red, 0, 255)}, ${THREE.MathUtils.clamp(
      green,
      0,
      255
    )}, ${THREE.MathUtils.clamp(blue, 0, 255)})`
  )
}

function buildPositionedArtwork(
  artwork: FirestoreArtwork,
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

  const offsetFromWall = wall.thickness / 2 + wall.artworkOffset

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

function layoutStraightWall(
  items: FirestoreArtwork[],
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

    return buildPositionedArtwork(
      artwork,
      wall,
      width_m,
      height_m,
      localCenter,
      index
    )
  })
}

function layoutInfoWall(
  items: FirestoreArtwork[],
  wall: GalleryWall,
  spacing: number
): PositionedArtwork[] {
  const gap = wall.reservedCenterGap ?? 0
  const left: FirestoreArtwork[] = []
  const right: FirestoreArtwork[] = []

  items.forEach((item, index) => {
    if (index % 2 === 0) left.push(item)
    else right.push(item)
  })

  const result: PositionedArtwork[] = []

  const placeSide = (sideItems: FirestoreArtwork[], direction: "left" | "right") => {
    let cursor =
      direction === "left" ? -(gap / 2) - spacing : gap / 2 + spacing

    sideItems.forEach((artwork, index) => {
      const width_m = artwork.width_cm / 100
      const height_m = artwork.height_cm / 100

      const localCenter =
        direction === "left" ? cursor - width_m / 2 : cursor + width_m / 2

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

function usePositionedArtworks(exhibitionSlug: string) {
  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])

  useEffect(() => {
    const q = query(
      collection(db, "artworks"),
      where("exhibitionSlug", "==", exhibitionSlug)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const next: FirestoreArtwork[] = snapshot.docs
        .flatMap((docItem) => {
          const data = docItem.data()

          if (
            typeof data.wallId !== "string" ||
            typeof data.width_cm !== "number" ||
            typeof data.height_cm !== "number"
          ) {
            return []
          }

          return [
            {
              id: docItem.id,
              wallId: data.wallId,
              exhibitionSlug:
                typeof data.exhibitionSlug === "string"
                  ? data.exhibitionSlug
                  : undefined,
              width_cm: data.width_cm,
              height_cm: data.height_cm,
              order: typeof data.order === "number" ? data.order : undefined,
            },
          ]
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      setArtworks(next)
    })

    return () => unsub()
  }, [exhibitionSlug])

  return useMemo<PositionedArtwork[]>(() => {
    const spacing = 0.9

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
  }, [artworks])
}

function ArtworkRectLights({
  lighting,
  positioned,
}: {
  lighting: ExhibitionLighting
  positioned: PositionedArtwork[]
}) {
  if (!positioned.length) return null
  if (!lighting.rectEnabled) return null

  return (
    <>
      {positioned.map((artwork) => (
        <ArtworkRectLight key={artwork.id} artwork={artwork} lighting={lighting} />
      ))}
    </>
  )
}

function ArtworkRectLight({
  artwork,
  lighting,
}: {
  artwork: PositionedArtwork
  lighting: ExhibitionLighting
}) {
  const rectLightRef = useRef<THREE.RectAreaLight>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const spotTargetRef = useRef<THREE.Object3D>(null)

  const yaw = artwork.rotation[1]
  const normalX = Math.sin(yaw)
  const normalZ = Math.cos(yaw)

  const displayWidth =
    artwork.width_m + FRAME_PADDING_X + lighting.rectWidthPadding
  const displayHeight =
    artwork.height_m + FRAME_PADDING_Y + lighting.rectHeightPadding

  const rectLightX = artwork.position[0] + normalX * lighting.rectWallOffset
  const rectLightY = artwork.position[1] + lighting.rectHeightOffset
  const rectLightZ = artwork.position[2] + normalZ * lighting.rectWallOffset

  const focusWallOffset = lighting.rectWallOffset + 0.18
  const focusHeightOffset = lighting.rectHeightOffset + 0.1

  const spotLightX = artwork.position[0] + normalX * focusWallOffset
  const spotLightY = artwork.position[1] + focusHeightOffset
  const spotLightZ = artwork.position[2] + normalZ * focusWallOffset

  const maxSide = Math.max(displayWidth, displayHeight)
  const focusAngle = THREE.MathUtils.clamp(maxSide * 0.16, 0.08, 0.2)
  const focusIntensity = lighting.rectIntensity * 0.9
  const focusDistance = THREE.MathUtils.clamp(2.2 + maxSide * 1.4, 2.8, 4.8)
  const color = useMemo(
    () => kelvinToColor(lighting.rectTemperature),
    [lighting.rectTemperature]
  )

  const rectTarget = useMemo(
    () =>
      new THREE.Vector3(
        artwork.position[0],
        artwork.position[1],
        artwork.position[2]
      ),
    [artwork.position]
  )

  useLayoutEffect(() => {
    if (!rectLightRef.current) return
    rectLightRef.current.lookAt(rectTarget)
  }, [rectTarget])

  useLayoutEffect(() => {
    if (!spotLightRef.current || !spotTargetRef.current) return
    spotLightRef.current.target = spotTargetRef.current
    spotLightRef.current.target.updateMatrixWorld()
  }, [artwork.position])

  return (
    <>
      <rectAreaLight
        ref={rectLightRef}
        position={[rectLightX, rectLightY, rectLightZ]}
        width={displayWidth}
        height={displayHeight}
        intensity={lighting.rectIntensity}
        color={color}
      />

      <object3D ref={spotTargetRef} position={artwork.position} />

      <spotLight
        ref={spotLightRef}
        position={[spotLightX, spotLightY, spotLightZ]}
        intensity={focusIntensity}
        distance={focusDistance}
        angle={focusAngle}
        penumbra={0.12}
        decay={2}
        color={color}
      />
    </>
  )
}

function ArtworkSpotLights({
  lighting,
  positioned,
}: {
  lighting: ExhibitionLighting
  positioned: PositionedArtwork[]
}) {
  if (!positioned.length) return null
  if (lighting.rectEnabled) return null

  return (
    <>
      {positioned.map((artwork) => (
        <ArtworkSpotLight
          key={artwork.id}
          artwork={artwork}
          lighting={lighting}
        />
      ))}
    </>
  )
}

function ArtworkSpotLight({
  artwork,
  lighting,
}: {
  artwork: PositionedArtwork
  lighting: ExhibitionLighting
}) {
  const targetRef = useRef<THREE.Object3D>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)

  const yaw = artwork.rotation[1]
  const normalX = Math.sin(yaw)
  const normalZ = Math.cos(yaw)

  const sizeFactor = Math.max(artwork.width_m, artwork.height_m)
  const areaFactor = artwork.width_m * artwork.height_m

  const lightX = artwork.position[0] + normalX * lighting.spotWallOffset
  const lightY = Math.min(
    lighting.spotHeightMax,
    artwork.position[1] + lighting.spotHeightOffset
  )
  const lightZ = artwork.position[2] + normalZ * lighting.spotWallOffset

  const angle = Math.min(
    lighting.spotAngleBase + sizeFactor * lighting.spotAngleSizeFactor,
    lighting.spotAngleMax
  )

  const intensity = Math.min(
    lighting.spotIntensityBase + areaFactor * lighting.spotIntensityAreaFactor,
    lighting.spotIntensityMax
  )

  const distance = Math.min(
    lighting.spotDistanceBase + sizeFactor * lighting.spotDistanceSizeFactor,
    lighting.spotDistanceMax
  )

  useLayoutEffect(() => {
    if (!spotLightRef.current || !targetRef.current) return
    spotLightRef.current.target = targetRef.current
    spotLightRef.current.target.updateMatrixWorld()
  }, [artwork.position])

  return (
    <>
      <object3D ref={targetRef} position={artwork.position} />

      <spotLight
        ref={spotLightRef}
        position={[lightX, lightY, lightZ]}
        intensity={intensity}
        distance={distance}
        angle={angle}
        penumbra={0.72}
        decay={2}
        color={lighting.spotColor}
      />
    </>
  )
}

export default function ArtworkLightingLayer({ lighting, exhibitionSlug }: Props) {
  const positioned = usePositionedArtworks(exhibitionSlug)

  useEffect(() => {
    RectAreaLightUniformsLib.init()
  }, [])

  if (!positioned.length) return null

  return lighting.rectEnabled ? (
    <ArtworkRectLights lighting={lighting} positioned={positioned} />
  ) : (
    <ArtworkSpotLights lighting={lighting} positioned={positioned} />
  )
}
