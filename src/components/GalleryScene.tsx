"use client"

import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import * as THREE from "three"
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useParams } from "next/navigation"

import GalleryModel from "./GalleryModel"
import PlayerControls, { mobileDirection } from "./PlayerControls"
import MobileJoystick from "./MobileJoystick"
import MobileLookJoystick from "./MobileLookJoystick"
import MobileOrientationGate from "./MobileOrientationGate"
import WallDebug from "@/components/WallDebug"
import ArtworkPanel from "@/components/ArtworkPanel"
import AimUI from "@/components/AimUI"
import ModelInspector from "@/components/ModelInspector"
import FirestoreArtworkLayer from "@/components/FirestoreArtworkLayer"
import InfoWallUI from "./InfoWallUI"
import { db } from "@/lib/firebase"
import {
  exhibitions,
  type Exhibition,
  type ExhibitionLighting,
} from "@/data/exhibitions"
import { getStaticExhibitionBySlug } from "@/lib/getStaticExhibitionBySlug"
import { galleryWalls, type GalleryWall } from "@/data/galleryWalls"
import GalleryWalls from "./GalleryWalls"

type FirestoreArtwork = {
  id: string
  title?: string
  artist?: string
  wallId: string
  exhibitionSlug?: string
  imageUrl: string
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

const FRAME_PADDING_X = 0.18
const FRAME_PADDING_Y = 0.18

function isFirestoreArtwork(value: unknown): value is FirestoreArtwork {
  if (!value || typeof value !== "object") return false

  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.wallId === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.width_cm === "number" &&
    typeof item.height_cm === "number" &&
    (item.exhibitionSlug === undefined || typeof item.exhibitionSlug === "string") &&
    (item.title === undefined || typeof item.title === "string") &&
    (item.artist === undefined || typeof item.artist === "string") &&
    (item.order === undefined || typeof item.order === "number")
  )
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

  const placeSide = (
    sideItems: FirestoreArtwork[],
    direction: "left" | "right"
  ) => {
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

function kelvinToColor(kelvin: number) {
  const temp = kelvin / 100
  let red = 255
  let green = 255
  let blue = 255

  if (temp <= 66) {
    red = 255
    green = 99.4708025861 * Math.log(temp) - 161.1195681661
    blue =
      temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307
  } else {
    red = 329.698727446 * Math.pow(temp - 60, -0.1332047592)
    green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492)
    blue = 255
  }

  const clamp = (value: number) => Math.max(0, Math.min(255, value)) / 255

  return new THREE.Color(clamp(red), clamp(green), clamp(blue))
}

function usePositionedArtworks(exhibitionSlug: string) {
  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])

  useEffect(() => {
    const q = query(
      collection(db, "artworks"),
      where("exhibitionSlug", "==", exhibitionSlug)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs
        .map((docItem) => {
          const data = docItem.data()

          return {
            id: docItem.id,
            title: typeof data.title === "string" ? data.title : undefined,
            artist: typeof data.artist === "string" ? data.artist : undefined,
            wallId: data.wallId,
            exhibitionSlug:
              typeof data.exhibitionSlug === "string"
                ? data.exhibitionSlug
                : undefined,
            imageUrl: data.imageUrl,
            width_cm: data.width_cm,
            height_cm: data.height_cm,
            order: typeof data.order === "number" ? data.order : undefined,
          }
        })
        .filter(isFirestoreArtwork)
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
  exhibitionSlug,
}: {
  lighting: ExhibitionLighting
  exhibitionSlug: string
}) {
  const positioned = usePositionedArtworks(exhibitionSlug)

  if (!positioned.length) return null
  if (!lighting.rectEnabled) return null

  return (
    <>
      {positioned.map((artwork) => (
        <ArtworkRectLight
          key={artwork.id}
          artwork={artwork}
          lighting={lighting}
        />
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
  const spotTargetRef = useRef<THREE.Object3D>(null)

  const yaw = artwork.rotation[1]
  const normalX = Math.sin(yaw)
  const normalZ = Math.cos(yaw)

  // 작품+액자 기준 사각 조명 면적
  // rectWidthPadding / rectHeightPadding 값을 줄일수록 더 타이트하게 맞음
  const displayWidth =
    artwork.width_m + FRAME_PADDING_X + lighting.rectWidthPadding
  const displayHeight =
    artwork.height_m + FRAME_PADDING_Y + lighting.rectHeightPadding

  // RectAreaLight 위치
  // rectWallOffset: 벽에서 앞으로 띄우는 거리
  // rectHeightOffset: 작품 중심보다 위쪽에서 쏘는 정도
  const rectLightX = artwork.position[0] + normalX * lighting.rectWallOffset
  const rectLightY = artwork.position[1] + lighting.rectHeightOffset
  const rectLightZ = artwork.position[2] + normalZ * lighting.rectWallOffset

  // SpotLight는 RectAreaLight보다 살짝 더 멀고, 살짝 더 위에서 쏴서
  // 벽 전체 확산보다 작품 중심 집중도를 올리는 역할
  const focusWallOffset = lighting.rectWallOffset + 0.18
  const focusHeightOffset = lighting.rectHeightOffset + 0.1

  const spotLightX = artwork.position[0] + normalX * focusWallOffset
  const spotLightY = artwork.position[1] + focusHeightOffset
  const spotLightZ = artwork.position[2] + normalZ * focusWallOffset

  const maxSide = Math.max(displayWidth, displayHeight)

  // 작품 크기에 따라 좁은 스포트 범위 자동 계산
  const focusAngle = THREE.MathUtils.clamp(maxSide * 0.16, 0.08, 0.2)

  // Rect 조명 위에 얹는 집중광 세기
  const focusIntensity = lighting.rectIntensity * 0.9

  // 작품 크기에 따라 도달 거리 자동 계산
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
        position={[spotLightX, spotLightY, spotLightZ]}
        target={spotTargetRef.current ?? undefined}
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
  exhibitionSlug,
}: {
  lighting: ExhibitionLighting
  exhibitionSlug: string
}) {
  const positioned = usePositionedArtworks(exhibitionSlug)

  if (!positioned.length) return null
  if (lighting.rectEnabled) return null

  return (
    <>
      {positioned.map((artwork) => (
        <ArtworkLight
          key={artwork.id}
          artwork={artwork}
          lighting={lighting}
        />
      ))}
    </>
  )
}

function ArtworkLight({
  artwork,
  lighting,
}: {
  artwork: PositionedArtwork
  lighting: ExhibitionLighting
}) {
  const targetRef = useRef<THREE.Object3D>(null)

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

  const targetX = artwork.position[0]
  const targetY = artwork.position[1]
  const targetZ = artwork.position[2]

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

  return (
    <>
      <object3D ref={targetRef} position={[targetX, targetY, targetZ]} />

      <spotLight
        position={[lightX, lightY, lightZ]}
        target={targetRef.current ?? undefined}
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

type GallerySceneProps = {
  exhibitionSlug?: string
  exhibition?: Exhibition | null
}

export default function GalleryScene({
  exhibitionSlug,
  exhibition: exhibitionProp,
}: GallerySceneProps = {}) {
  const params = useParams()
  const slugFromParams = typeof params?.slug === "string" ? params.slug : undefined
  const activeSlug = exhibitionSlug ?? slugFromParams

  const exhibition =
    exhibitionProp ??
    (activeSlug ? getStaticExhibitionBySlug(activeSlug) : undefined) ??
    exhibitions[0]
  const exhibitionSlugForChildren = activeSlug ?? exhibition.slug

  const [lighting, setLighting] = useState<ExhibitionLighting>(exhibition.lighting)

  useEffect(() => {
    setLighting(exhibition.lighting)

    const ref = doc(db, "exhibitionSettings", exhibition.slug)

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setLighting(exhibition.lighting)
        return
      }

      const data = snap.data() as Partial<{
        lighting: Partial<ExhibitionLighting>
      }>

      setLighting({
        ...exhibition.lighting,
        ...(data.lighting ?? {}),
      })
    })

    return () => unsub()
  }, [exhibition.lighting, exhibition.slug])

  const isTouchDevice = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    )
  }, [])

  useEffect(() => {
    RectAreaLightUniformsLib.init()
  }, [])

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.6, 4], fov: 50, near: 0.1, far: 120 }}
        dpr={1}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping

          // 전체 전시장 밝기
          gl.toneMappingExposure = lighting.toneMappingExposure

          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap

          scene.background = new THREE.Color(lighting.backgroundColor)
          scene.fog = new THREE.Fog(
            lighting.fogColor,
            lighting.fogNear,
            lighting.fogFar
          )
        }}
        style={{ touchAction: "none" }}
      >
        <color attach="background" args={[lighting.backgroundColor]} />
        <fog
          attach="fog"
          args={[lighting.fogColor, lighting.fogNear, lighting.fogFar]}
        />

        <Suspense fallback={null}>
          <Environment
            files="/textures/sky/Cloudymorning4k.hdr"
            background
            backgroundBlurriness={lighting.environmentBackgroundBlurriness}
            environmentIntensity={lighting.environmentIntensity}
          />

          <ambientLight
            intensity={lighting.ambientIntensity}
            color={lighting.ambientColor}
          />

          <hemisphereLight
            intensity={lighting.hemisphereIntensity}
            color={lighting.hemisphereSkyColor}
            groundColor={lighting.hemisphereGroundColor}
          />

          <directionalLight
            position={[6, 12, 4]}
            intensity={lighting.directionalIntensity}
            color={lighting.directionalColor}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-24}
            shadow-camera-right={24}
            shadow-camera-top={24}
            shadow-camera-bottom={-24}
            shadow-bias={-0.00012}
          />

          <ArtworkRectLights
            lighting={lighting}
            exhibitionSlug={exhibitionSlugForChildren}
          />

          <ArtworkSpotLights
            lighting={lighting}
            exhibitionSlug={exhibitionSlugForChildren}
          />

          <GalleryModel exhibitionSlug={exhibitionSlugForChildren} />
          <GalleryWalls />

          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("edit") === "1" && (
              <WallDebug />
            )}
        </Suspense>

        <PlayerControls />
        <ModelInspector />
        <FirestoreArtworkLayer
          exhibitionSlug={exhibitionSlugForChildren}
          artworkBrightness={lighting.artworkBrightness}
          matteBrightness={lighting.matteBrightness}
          frameBrightness={lighting.frameBrightness}
        />
        <InfoWallUI exhibition={exhibition} />
      </Canvas>

      <div
        style={{
          ...vignetteStyle,
          background: `radial-gradient(circle at center, rgba(0,0,0,0) 56%, rgba(0,0,0,${Math.max(
            0,
            lighting.vignetteOpacity * 0.42
          )}) 80%, rgba(0,0,0,${lighting.vignetteOpacity}) 100%)`,
        }}
      />
      <div
        style={{
          ...topGlowStyle,
          background: `linear-gradient(180deg, rgba(255,248,238,${lighting.topGlowOpacity}) 0%, rgba(255,248,238,${lighting.topGlowOpacity * 0.35}) 16%, rgba(0,0,0,0) 38%)`,
        }}
      />

      <MobileJoystick
        onMove={(dir: any) => {
          mobileDirection.x = dir.x
          mobileDirection.z = dir.z
        }}
      />

      {isTouchDevice ? <MobileLookJoystick /> : null}

      <AimUI />
      <ArtworkPanel />
      <MobileOrientationGate />
    </>
  )
}

const vignetteStyle: React.CSSProperties = {
  pointerEvents: "none",
  position: "fixed",
  inset: 0,
  zIndex: 1,
}

const topGlowStyle: React.CSSProperties = {
  pointerEvents: "none",
  position: "fixed",
  inset: 0,
  zIndex: 1,
}
