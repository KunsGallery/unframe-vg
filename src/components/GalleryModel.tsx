"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { useGLTF } from "@react-three/drei"
import { doc, onSnapshot } from "firebase/firestore"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import {
  exhibitions,
  type ExhibitionMediaSettings,
  type ExhibitionSurfaceSettings,
} from "@/data/exhibitions"
import { getStaticExhibitionBySlug } from "@/lib/getStaticExhibitionBySlug"

/* =========================
   CylinderWall media controls
========================= */

const CYLINDER_VIDEO_UV_ROTATION = -Math.PI / 2
const CYLINDER_VIDEO_UV_OFFSET_X = 0
const CYLINDER_VIDEO_UV_OFFSET_Y = 0
const CYLINDER_VIDEO_UV_REPEAT_X = 1
const CYLINDER_VIDEO_UV_REPEAT_Y = 1
const CYLINDER_VIDEO_BRIGHTNESS = 1.0

/* ========================= */

const CURVE_WALL_DEBUG_COLORS: Record<string, string> = {
  CurveWall_L_01: "#7e63ff",
  CurveWall_L_02: "#8f6fff",
  CurveWall_L_03: "#a27cff",
  CurveWall_L_04: "#b489ff",
  CurveWall_L_05: "#c597ff",
  CurveWall_L_06: "#d6a5ff",

  CurveWall_R_01: "#ff5fb2",
  CurveWall_R_02: "#ff72bd",
  CurveWall_R_03: "#ff86c8",
  CurveWall_R_04: "#ff99d2",
  CurveWall_R_05: "#ffaddd",
  CurveWall_R_06: "#ffc0e8",
}

const DEFAULT_MODEL_PATH = "/models/unframe_skylight_room_v1.glb"

function applyCylinderUvTransform(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.center.set(0.5, 0.5)
  texture.rotation = CYLINDER_VIDEO_UV_ROTATION
  texture.repeat.set(CYLINDER_VIDEO_UV_REPEAT_X, CYLINDER_VIDEO_UV_REPEAT_Y)
  texture.offset.set(CYLINDER_VIDEO_UV_OFFSET_X, CYLINDER_VIDEO_UV_OFFSET_Y)
  texture.needsUpdate = true
}

function createCylinderPlaceholderTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024

  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, "#1b1f26")
  gradient.addColorStop(1, "#2b313b")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth = 2

  for (let i = 80; i < canvas.width; i += 80) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvas.height)
    ctx.stroke()
  }

  for (let i = 80; i < canvas.height; i += 80) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(canvas.width, i)
    ctx.stroke()
  }

  ctx.fillStyle = "rgba(255,255,255,0.72)"
  ctx.font = "600 56px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("CYLINDER WALL", canvas.width / 2, canvas.height / 2 - 20)

  ctx.fillStyle = "rgba(255,255,255,0.38)"
  ctx.font = "400 28px sans-serif"
  ctx.fillText("Loading media...", canvas.width / 2, canvas.height / 2 + 40)

  const texture = new THREE.CanvasTexture(canvas)
  applyCylinderUvTransform(texture)
  return texture
}

function createCylinderMediaMaterial(map: THREE.Texture, brightness = 1) {
  const material = new THREE.MeshBasicMaterial({
    map,
    color: new THREE.Color().setScalar(brightness),
    side: THREE.DoubleSide,
    toneMapped: false,
  })

  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #ifdef USE_MAP
        vec2 mediaUv = vMapUv;
        if (!gl_FrontFacing) {
          mediaUv.x = 1.0 - mediaUv.x;
        }
        vec4 sampledDiffuseColor = texture2D(map, mediaUv);
        diffuseColor *= sampledDiffuseColor;
      #endif
      `
    )
  }

  material.needsUpdate = true
  return material
}

function createInvisibleBoxColliderFromMesh(mesh: THREE.Mesh) {
  mesh.updateWorldMatrix(true, false)

  const geometry = mesh.geometry.clone()
  geometry.computeBoundingBox()

  const bbox = geometry.boundingBox
  if (!bbox) {
    geometry.dispose()
    return null
  }

  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  bbox.getSize(size)
  bbox.getCenter(center)

  const collider = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshBasicMaterial({ visible: false })
  )

  collider.name = `${mesh.name}__collider`

  const worldQuaternion = new THREE.Quaternion()
  const worldScale = new THREE.Vector3()
  const worldPosition = new THREE.Vector3()

  mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale)

  collider.quaternion.copy(worldQuaternion)
  collider.scale.copy(worldScale)
  collider.position.copy(
    worldPosition.clone().add(
      center.clone().multiply(worldScale).applyQuaternion(worldQuaternion)
    )
  )

  geometry.dispose()
  return collider
}

export default function GalleryModel({
  exhibitionSlug,
  modelPath,
}: {
  exhibitionSlug?: string
  modelPath?: string
} = {}) {
  const resolvedModelPath = modelPath?.trim() || DEFAULT_MODEL_PATH
  const gltf = useGLTF(resolvedModelPath)
  const params = useParams()
  const slug =
    exhibitionSlug ??
    (typeof params?.slug === "string" ? params.slug : undefined)

  const exhibition =
    (slug ? getStaticExhibitionBySlug(slug) : undefined) ?? exhibitions[0]

  const [surfaces, setSurfaces] = useState<ExhibitionSurfaceSettings>(
    exhibition.surfaces
  )
  const [media, setMedia] = useState<ExhibitionMediaSettings>(exhibition.media)
  const [videoReady, setVideoReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)

  const placeholderTexture = useMemo(() => {
    if (typeof window === "undefined") return null
    return createCylinderPlaceholderTexture()
  }, [])

  useEffect(() => {
    if (!exhibition?.slug) return

    const ref = doc(db, "exhibitionSettings", exhibition.slug)

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setSurfaces(exhibition.surfaces)
        setMedia(exhibition.media)
        return
      }

      const data = snap.data() as Partial<{
        surfaces: Partial<ExhibitionSurfaceSettings>
        media: Partial<ExhibitionMediaSettings>
      }>

      setSurfaces({
        ...exhibition.surfaces,
        ...(data.surfaces ?? {}),
      })

      setMedia({
        ...exhibition.media,
        ...(data.media ?? {}),
      })
    })

    return () => unsub()
  }, [exhibition])

  useEffect(() => {
    const url = media.cylinderWallVideoUrl?.trim()

    setVideoReady(false)

    if (!url) {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.removeAttribute("src")
        videoRef.current.load()
        videoRef.current = null
      }

      if (videoTextureRef.current) {
        videoTextureRef.current.dispose()
        videoTextureRef.current = null
      }

      return
    }

    const video = document.createElement("video")
    video.src = url
    video.crossOrigin = "anonymous"
    video.loop = true
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.preload = "auto"

    video.setAttribute("muted", "")
    video.setAttribute("playsinline", "")
    video.setAttribute("webkit-playsinline", "")

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    applyCylinderUvTransform(texture)

    videoRef.current = video
    videoTextureRef.current = texture

    let disposed = false

    const tryPlay = async () => {
      if (disposed) return
      if (document.visibilityState !== "visible") return

      try {
        await video.play()
        if (!disposed) {
          setVideoReady(true)
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        console.error("CylinderWall video play failed:", error)
      }
    }

    const handleCanPlay = () => {
      void tryPlay()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void tryPlay()
      }
    }

    const handleUserGesture = () => {
      void tryPlay()
    }

    const handleError = () => {
      console.error("CylinderWall video load failed:", url)
      if (!disposed) {
        setVideoReady(false)
      }
    }

    video.addEventListener("loadeddata", handleCanPlay)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pointerdown", handleUserGesture)
    window.addEventListener("touchstart", handleUserGesture, { passive: true })
    window.addEventListener("keydown", handleUserGesture)

    video.load()
    void tryPlay()

    return () => {
      disposed = true

      video.removeEventListener("loadeddata", handleCanPlay)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)

      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pointerdown", handleUserGesture)
      window.removeEventListener("touchstart", handleUserGesture)
      window.removeEventListener("keydown", handleUserGesture)

      video.pause()

      if (videoRef.current === video) {
        videoRef.current = null
      }

      if (videoTextureRef.current === texture) {
        videoTextureRef.current.dispose()
        videoTextureRef.current = null
      }
    }
  }, [media.cylinderWallVideoUrl])

  const model = useMemo(() => {
    const scene = gltf.scene.clone(true)
    const videoTexture = videoTextureRef.current

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      child.castShadow = false
      child.receiveShadow = true

      const meshName = child.name

      const originalMaterial = Array.isArray(child.material)
        ? child.material[0]
        : child.material

      const baseColor =
        originalMaterial && "color" in originalMaterial
          ? (originalMaterial.color as THREE.Color).clone()
          : new THREE.Color("#ffffff")

      if (meshName === "Floor") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.floorColor),
          roughness: surfaces.floorRoughness,
          metalness: surfaces.floorMetalness,
        })
        return
      }

      if (
        meshName === "FloorEdge" ||
        meshName === "CylinderEdge" ||
        meshName === "PosterWallEdge"
      ) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.floorEdgeColor),
          roughness: surfaces.floorEdgeRoughness,
          metalness: surfaces.floorEdgeMetalness,
        })
        return
      }

      if (meshName === "Walls") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.wallColor),
          roughness: surfaces.wallRoughness,
          metalness: surfaces.wallMetalness,
        })
        return
      }

      if (meshName === "PosterWall") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.posterWallColor),
          roughness: surfaces.posterWallRoughness,
          metalness: surfaces.posterWallMetalness,
        })
        return
      }

      if (meshName === "CylinderWall") {
        const cylinderCollider = createInvisibleBoxColliderFromMesh(child)
        if (cylinderCollider) {
          scene.add(cylinderCollider)
        }

        if (videoTexture && videoReady) {
          child.material = createCylinderMediaMaterial(
            videoTexture,
            CYLINDER_VIDEO_BRIGHTNESS
          )
        } else if (placeholderTexture) {
          child.material = createCylinderMediaMaterial(placeholderTexture, 1)
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(surfaces.cylinderColor),
            roughness: surfaces.cylinderRoughness,
            metalness: surfaces.cylinderMetalness,
          })
        }
        return
      }

      if (meshName in CURVE_WALL_DEBUG_COLORS) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#d9d3ca"),
          roughness: 0.96,
          metalness: 0.01,
        })
        return
      }

      if (meshName === "Roof") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.roofColor),
          roughness: surfaces.roofRoughness,
          metalness: surfaces.roofMetalness,
        })
        return
      }

      if (meshName === "WindowsFrame") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.windowFrameColor),
          roughness: surfaces.windowFrameRoughness,
          metalness: surfaces.windowFrameMetalness,
        })
        return
      }

      if (meshName === "Layer") {
        const layerCollider = createInvisibleBoxColliderFromMesh(child)
        if (layerCollider) {
          scene.add(layerCollider)
        }

        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surfaces.layerColor),
          roughness: surfaces.layerRoughness,
          metalness: surfaces.layerMetalness,
        })
        return
      }

      child.material = new THREE.MeshStandardMaterial({
        color: baseColor.multiplyScalar(0.98),
        roughness: 0.84,
        metalness: 0.04,
      })
    })

    const doorGroup = new THREE.Group()

    doorGroup.position.set(0, 1.36, 9.65)
    doorGroup.rotation.x = 0
    doorGroup.rotation.y = Math.PI

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 2.72, 0.08),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2a221d"),
        roughness: 0.72,
        metalness: 0.08,
      })
    )
    door.position.set(0, 0, 0)
    door.receiveShadow = false
    door.castShadow = false
    doorGroup.add(door)

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d7d0c6"),
      roughness: 0.84,
      metalness: 0.03,
    })

    const frameTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.02, 0.12, 0.14),
      frameMaterial
    )
    frameTop.position.set(0, 1.41, -0.02)
    frameTop.receiveShadow = false
    frameTop.castShadow = false
    doorGroup.add(frameTop)

    const frameLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.92, 0.14),
      frameMaterial
    )
    frameLeft.position.set(-0.95, 0, -0.02)
    frameLeft.receiveShadow = false
    frameLeft.castShadow = false
    doorGroup.add(frameLeft)

    const frameRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.92, 0.14),
      frameMaterial
    )
    frameRight.position.set(0.95, 0, -0.02)
    frameRight.receiveShadow = false
    frameRight.castShadow = false
    doorGroup.add(frameRight)

    const lineMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#8d7763"),
      roughness: 0.55,
      metalness: 0.2,
    })

    const panelLine1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 2.3, 0.01),
      lineMaterial
    )
    panelLine1.position.set(-0.27, 0, 0.045)
    panelLine1.castShadow = false
    panelLine1.receiveShadow = false
    doorGroup.add(panelLine1)

    const panelLine2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 2.3, 0.01),
      lineMaterial
    )
    panelLine2.position.set(0.27, 0, 0.045)
    panelLine2.castShadow = false
    panelLine2.receiveShadow = false
    doorGroup.add(panelLine2)

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.22, 0.03),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c7a56d"),
        roughness: 0.3,
        metalness: 0.72,
      })
    )
    handle.position.set(0.6, -0.08, 0.055)
    handle.castShadow = false
    handle.receiveShadow = false
    doorGroup.add(handle)

    scene.add(doorGroup)

    return scene
  }, [gltf.scene, surfaces, videoReady, placeholderTexture])

  return <primitive object={model} />
}

useGLTF.preload(DEFAULT_MODEL_PATH)
