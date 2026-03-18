"use client"

import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { Suspense, useMemo } from "react"
import * as THREE from "three"

import GalleryModel from "./GalleryModel"
import PlayerControls, { mobileDirection } from "./PlayerControls"
import MobileJoystick from "./MobileJoystick"
import MobileLookPad from "./MobileLookPad"
import WallDebug from "@/components/WallDebug"
import ArtworkPanel from "@/components/ArtworkPanel"
import AimUI from "@/components/AimUI"
import ModelInspector from "@/components/ModelInspector"
import FirestoreArtworkLayer from "@/components/FirestoreArtworkLayer"

export default function GalleryScene() {
  const isTouchDevice = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    )
  }, [])

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.6, 4], fov: 50, near: 0.1, far: 120 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.02
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap

          scene.background = new THREE.Color("#d8dde6")
          scene.fog = new THREE.Fog("#d8dde6", 26, 62)
        }}
        style={{ touchAction: "none" }}
      >
        <color attach="background" args={["#d8dde6"]} />
        <fog attach="fog" args={["#d8dde6", 26, 62]} />

        <Suspense fallback={null}>
          <Environment
            files="/textures/sky/Cloudymorning4k.hdr"
            background
            backgroundBlurriness={0.02}
            environmentIntensity={0.7}
          />

          <ambientLight intensity={0.62} color="#fffaf2" />
          <hemisphereLight intensity={0.92} color="#f6f9ff" groundColor="#8f867d" />

          <directionalLight
            position={[7, 14, 6]}
            intensity={1.1}
            color="#fff8ef"
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

          <directionalLight position={[-8, 8, -10]} intensity={0.45} color="#eef4ff" />

          <pointLight position={[-7.5, 3.4, -7.5]} intensity={8} distance={22} decay={2} color="#fff7ed" />
          <pointLight position={[-7.5, 3.4, -18]} intensity={8} distance={22} decay={2} color="#fff7ed" />
          <pointLight position={[-1.5, 3.2, -10]} intensity={5} distance={18} decay={2} color="#f3f7ff" />

          <GalleryModel />

          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("edit") === "1" && <WallDebug />}
        </Suspense>

        <PlayerControls />
        <ModelInspector />
        <FirestoreArtworkLayer />
      </Canvas>

      <div style={vignetteStyle} />
      <div style={topGlowStyle} />

      <MobileJoystick
        onMove={(dir: any) => {
          mobileDirection.x = dir.x
          mobileDirection.z = dir.z
        }}
      />

      {isTouchDevice ? <MobileLookPad /> : null}

      <AimUI />
      <ArtworkPanel />
    </>
  )
}

const vignetteStyle: React.CSSProperties = {
  pointerEvents: "none",
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.08) 78%, rgba(0,0,0,0.18) 100%)",
  zIndex: 1,
}

const topGlowStyle: React.CSSProperties = {
  pointerEvents: "none",
  position: "fixed",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(255,250,240,0.08) 0%, rgba(255,250,240,0.03) 18%, rgba(0,0,0,0) 38%)",
  zIndex: 1,
}