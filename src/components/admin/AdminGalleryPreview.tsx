"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { defaultLightingSettings } from "@/lib/defaultExhibitionSettings"
import ArtworkLightingLayer from "@/components/ArtworkLightingLayer"
import { galleryWalls } from "@/data/galleryWalls"
import GalleryModel from "@/components/GalleryModel"
import FirestoreArtworkLayer from "@/components/FirestoreArtworkLayer"
import { type ExhibitionLighting } from "@/data/exhibitions"

type AdminPreviewExhibition = {
  slug: string
  title: string
  artist?: string
  period?: string
  description?: string
  summary?: string
  rightTitle?: string
  rightBody?: string
  coverImage?: string
  layoutPreset?: string
  isCurrent?: boolean
  isRecommended?: boolean
}

type Props = {
  exhibitionSlug: string
  activeWallId: string
  exhibition?: AdminPreviewExhibition | null
  lighting?: ExhibitionLighting
}

type CameraPreset = {
  id: string
  label: string
  mode: "wall" | "shoot"
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

type CameraPath = {
  id: string
  label: string
  from: CameraPreset
  to: CameraPreset
  duration: number
}

function getWallCameraPreset(activeWallId: string): CameraPreset {
  const wall = galleryWalls.find((item) => item.id === activeWallId)

  if (!wall) {
    return {
      id: "fallback-wall",
      label: "Wall Preview",
      mode: "wall",
      position: [0, 1.9, 6],
      target: [0, 1.9, 0],
      fov: 36,
    }
  }

  const yaw = wall.rotation[1] + Math.PI
  const normalX = Math.sin(yaw)
  const normalZ = Math.cos(yaw)

  const cameraDistance = THREE.MathUtils.clamp(wall.length * 1.1, 2.8, 6.2)
  const cameraY = THREE.MathUtils.clamp(wall.artCenterY + 0.16, 1.6, 2.8)

  return {
    id: `wall-${activeWallId}`,
    label: `${activeWallId} 정면`,
    mode: "wall",
    position: [
      wall.position[0] + normalX * cameraDistance,
      cameraY,
      wall.position[2] + normalZ * cameraDistance,
    ],
    target: [
      wall.position[0] + normalX * 0.02,
      wall.artCenterY,
      wall.position[2] + normalZ * 0.02,
    ],
    fov: 34,
  }
}

function getShootPresets(): CameraPreset[] {
  return [
    {
      id: "shoot-entrance-wide",
      label: "입구 와이드",
      mode: "shoot",
      position: [0, 1.78, 8.4],
      target: [0, 1.95, -8.5],
      fov: 42,
    },
    {
      id: "shoot-center-wide",
      label: "중앙 와이드",
      mode: "shoot",
      position: [0, 1.9, -3.4],
      target: [0, 1.92, -18.5],
      fov: 40,
    },
    {
      id: "shoot-left-pan",
      label: "좌측 전시벽",
      mode: "shoot",
      position: [-4.8, 1.82, -7.6],
      target: [-7.2, 1.92, -18.6],
      fov: 34,
    },
    {
      id: "shoot-right-pan",
      label: "우측 전시벽",
      mode: "shoot",
      position: [4.8, 1.82, -7.6],
      target: [7.2, 1.92, -18.6],
      fov: 34,
    },
    {
      id: "shoot-poster-front",
      label: "포스터월 정면",
      mode: "shoot",
      position: [0, 1.78, 4.8],
      target: [0, 1.82, 9.7],
      fov: 28,
    },
    {
      id: "shoot-cylinder-front",
      label: "실린더 강조",
      mode: "shoot",
      position: [0, 1.86, -10.8],
      target: [0, 1.9, -18.2],
      fov: 26,
    },
  ]
}

function buildPaths(shootPresets: CameraPreset[]): CameraPath[] {
  const entrance = shootPresets.find((item) => item.id === "shoot-entrance-wide")
  const center = shootPresets.find((item) => item.id === "shoot-center-wide")
  const left = shootPresets.find((item) => item.id === "shoot-left-pan")
  const right = shootPresets.find((item) => item.id === "shoot-right-pan")
  const poster = shootPresets.find((item) => item.id === "shoot-poster-front")
  const cylinder = shootPresets.find((item) => item.id === "shoot-cylinder-front")

  const paths: CameraPath[] = []

  if (entrance && center) {
    paths.push({
      id: "path-entrance-center",
      label: "입구 → 중앙",
      from: entrance,
      to: center,
      duration: 4.5,
    })
  }

  if (left && center) {
    paths.push({
      id: "path-left-center",
      label: "좌벽 → 중앙",
      from: left,
      to: center,
      duration: 4.2,
    })
  }

  if (right && center) {
    paths.push({
      id: "path-right-center",
      label: "우벽 → 중앙",
      from: right,
      to: center,
      duration: 4.2,
    })
  }

  if (poster && center) {
    paths.push({
      id: "path-poster-center",
      label: "포스터 → 중앙",
      from: poster,
      to: center,
      duration: 3.6,
    })
  }

  if (center && cylinder) {
    paths.push({
      id: "path-center-cylinder",
      label: "중앙 → 실린더",
      from: center,
      to: cylinder,
      duration: 3.8,
    })
  }

  return paths
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function CameraRig({
  preset,
  path,
  playVersion,
}: {
  preset: CameraPreset
  path: CameraPath | null
  playVersion: number
}) {
  const { camera } = useThree()
  const perspectiveCamera = camera as THREE.PerspectiveCamera

  const posRef = useRef(new THREE.Vector3(...preset.position))
  const targetRef = useRef(new THREE.Vector3(...preset.target))
  const desiredPosRef = useRef(new THREE.Vector3(...preset.position))
  const desiredTargetRef = useRef(new THREE.Vector3(...preset.target))

  const pathStateRef = useRef<{
    active: boolean
    startedAt: number
    duration: number
    fromPos: THREE.Vector3
    toPos: THREE.Vector3
    fromTarget: THREE.Vector3
    toTarget: THREE.Vector3
    fromFov: number
    toFov: number
  } | null>(null)

  useEffect(() => {
    if (!path) {
      desiredPosRef.current.set(...preset.position)
      desiredTargetRef.current.set(...preset.target)
      perspectiveCamera.fov = preset.fov
      perspectiveCamera.updateProjectionMatrix()
      return
    }

    pathStateRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: path.duration * 1000,
      fromPos: new THREE.Vector3(...path.from.position),
      toPos: new THREE.Vector3(...path.to.position),
      fromTarget: new THREE.Vector3(...path.from.target),
      toTarget: new THREE.Vector3(...path.to.target),
      fromFov: path.from.fov,
      toFov: path.to.fov,
    }
  }, [perspectiveCamera, path, playVersion, preset])

  useFrame(() => {
    const running = pathStateRef.current

    if (running?.active) {
      const elapsed = performance.now() - running.startedAt
      const rawT = THREE.MathUtils.clamp(elapsed / running.duration, 0, 1)
      const t = easeInOutCubic(rawT)

      desiredPosRef.current.copy(running.fromPos).lerp(running.toPos, t)
      desiredTargetRef.current.copy(running.fromTarget).lerp(running.toTarget, t)

      perspectiveCamera.fov = THREE.MathUtils.lerp(
        running.fromFov,
        running.toFov,
        t
      )
      perspectiveCamera.updateProjectionMatrix()

      if (rawT >= 1) {
        running.active = false
      }
    }

    posRef.current.lerp(desiredPosRef.current, 0.12)
    targetRef.current.lerp(desiredTargetRef.current, 0.12)

    camera.position.copy(posRef.current)
    camera.lookAt(targetRef.current)
  })

  return null
}

export default function AdminGalleryPreview({
  exhibitionSlug,
  activeWallId,
  exhibition,
  lighting: lightingProp,
}: Props) {
  const previewExhibition =
    exhibition ?? {
      slug: exhibitionSlug,
      title: exhibitionSlug,
      artist: "",
      period: "",
      description: "",
      summary: "",
      rightTitle: "",
      rightBody: "",
      coverImage: "",
      layoutPreset: "default",
      isCurrent: false,
      isRecommended: false,
    }

  const [loadedLighting, setLoadedLighting] = useState<ExhibitionLighting>(
    defaultLightingSettings
  )

  useEffect(() => {
    setLoadedLighting(defaultLightingSettings)

    const ref = doc(db, "exhibitionSettings", exhibitionSlug)

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setLoadedLighting(defaultLightingSettings)
        return
      }

      const data = snap.data() as Partial<{
        lighting: Partial<ExhibitionLighting>
      }>

      setLoadedLighting({
        ...defaultLightingSettings,
        ...(data.lighting ?? {}),
      })
    })

    return () => unsub()
  }, [exhibitionSlug])

  const activeLighting = lightingProp ?? loadedLighting

  const wallPreset = useMemo(
    () => getWallCameraPreset(activeWallId),
    [activeWallId]
  )

  const shootPresets = useMemo(() => getShootPresets(), [])
  const paths = useMemo(() => buildPaths(shootPresets), [shootPresets])

  const [selectedPresetId, setSelectedPresetId] = useState(wallPreset.id)
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)
  const [playVersion, setPlayVersion] = useState(0)

  useEffect(() => {
    setSelectedPresetId(wallPreset.id)
    setSelectedPathId(null)
  }, [wallPreset.id])

  const selectedPreset =
    selectedPresetId === wallPreset.id
      ? wallPreset
      : shootPresets.find((item) => item.id === selectedPresetId) ?? wallPreset

  const selectedPath =
    selectedPathId == null
      ? null
      : paths.find((item) => item.id === selectedPathId) ?? null

  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Wall Preview / Shoot Camera</p>
          <h2 style={titleStyle}>
            {selectedPath ? selectedPath.label : selectedPreset.label}
          </h2>
          <p style={descStyle}>
            실제 갤러리와 같은 조명값을 읽는 프리뷰 / 촬영 카메라입니다.
          </p>
          <p style={metaStyle}>
            {previewExhibition.title}
            {previewExhibition.artist ? ` · ${previewExhibition.artist}` : ""}
            {previewExhibition.period ? ` · ${previewExhibition.period}` : ""}
          </p>
          <p style={summaryStyle}>
            {previewExhibition.summary || previewExhibition.description}
          </p>
        </div>
      </div>

      <div style={presetSectionStyle}>
        <div style={presetBlockStyle}>
          <p style={presetBlockTitleStyle}>벽 정면</p>
          <div style={presetRowStyle}>
            <button
              type="button"
              onClick={() => {
                setSelectedPathId(null)
                setSelectedPresetId(wallPreset.id)
              }}
              style={{
                ...presetButtonStyle,
                ...(selectedPathId === null && selectedPresetId === wallPreset.id
                  ? presetButtonActiveStyle
                  : null),
              }}
            >
              {wallPreset.label}
            </button>
          </div>
        </div>

        <div style={presetBlockStyle}>
          <p style={presetBlockTitleStyle}>촬영 프리셋</p>
          <div style={presetRowStyle}>
            {shootPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPathId(null)
                  setSelectedPresetId(preset.id)
                }}
                style={{
                  ...presetButtonStyle,
                  ...(selectedPathId === null && selectedPresetId === preset.id
                    ? presetButtonActiveStyle
                    : null),
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div style={presetBlockStyle}>
          <p style={presetBlockTitleStyle}>시네마틱 이동</p>
          <div style={presetRowStyle}>
            {paths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => {
                  setSelectedPathId(path.id)
                  setPlayVersion((prev) => prev + 1)
                }}
                style={{
                  ...presetButtonStyle,
                  ...(selectedPathId === path.id
                    ? presetButtonActiveStyle
                    : null),
                }}
              >
                {path.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={canvasWrapStyle}>
        <Canvas
          key={JSON.stringify({
            lighting: activeLighting,
            wall: activeWallId,
            preset: selectedPreset.id,
            path: selectedPath?.id ?? null,
          })}
          camera={{
            position: selectedPreset.position,
            fov: selectedPreset.fov,
            near: 0.1,
            far: 120,
          }}
          dpr={1}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = activeLighting.toneMappingExposure
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.shadowMap.enabled = true
            gl.shadowMap.type = THREE.PCFSoftShadowMap

            scene.background = new THREE.Color(activeLighting.backgroundColor)
            scene.fog = new THREE.Fog(
              activeLighting.fogColor,
              activeLighting.fogNear,
              activeLighting.fogFar
            )
          }}
        >
          <color attach="background" args={[activeLighting.backgroundColor]} />
          <fog
            attach="fog"
            args={[activeLighting.fogColor, activeLighting.fogNear, activeLighting.fogFar]}
          />

          <Suspense fallback={null}>
            <CameraRig
              preset={selectedPreset}
              path={selectedPath}
              playVersion={playVersion}
            />

            <Environment
              files="/textures/sky/Cloudymorning4k.hdr"
              background
              backgroundBlurriness={activeLighting.environmentBackgroundBlurriness}
              environmentIntensity={activeLighting.environmentIntensity}
            />

            <ambientLight
              intensity={activeLighting.ambientIntensity}
              color={activeLighting.ambientColor}
            />
            <hemisphereLight
              intensity={activeLighting.hemisphereIntensity}
              color={activeLighting.hemisphereSkyColor}
              groundColor={activeLighting.hemisphereGroundColor}
            />
            <directionalLight
              position={[6, 12, 4]}
              intensity={activeLighting.directionalIntensity}
              color={activeLighting.directionalColor}
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

            <ArtworkLightingLayer
              lighting={activeLighting}
              exhibitionSlug={exhibitionSlug}
            />

            <GalleryModel exhibitionSlug={exhibitionSlug} />
            <FirestoreArtworkLayer
              exhibitionSlug={exhibitionSlug}
              artworkBrightness={activeLighting.artworkBrightness}
              matteBrightness={activeLighting.matteBrightness}
              frameBrightness={activeLighting.frameBrightness}
            />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}

const cardStyle: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(20,22,28,0.92) 0%, rgba(13,15,20,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
  marginTop: 24,
}

const headerStyle: React.CSSProperties = {
  marginBottom: 16,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const titleStyle: React.CSSProperties = {
  margin: "6px 0 6px",
  fontSize: 28,
  lineHeight: 1.1,
  color: "#f5f7fb",
}

const descStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.56)",
  fontSize: 13,
}

const metaStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "rgba(255,255,255,0.52)",
  fontSize: 12,
  lineHeight: 1.5,
}

const summaryStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(255,255,255,0.42)",
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
}

const presetSectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginBottom: 16,
}

const presetBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const presetBlockTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.44)",
}

const presetRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

const presetButtonStyle: React.CSSProperties = {
  minHeight: 36,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5f7fb",
  padding: "0 12px",
  fontSize: 12,
  cursor: "pointer",
}

const presetButtonActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.24)",
}

const canvasWrapStyle: React.CSSProperties = {
  width: "100%",
  height: 480,
  overflow: "hidden",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}
