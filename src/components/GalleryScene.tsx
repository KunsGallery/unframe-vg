"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"

import GalleryModel from "./GalleryModel"
import PlayerControls, { mobileDirection } from "./PlayerControls"
import MobileJoystick from "./MobileJoystick"
import WallDebug from "@/components/WallDebug"
import ArtworkPanel from "@/components/ArtworkPanel"
import AimUI from "@/components/AimUI"
import WallEditor from "@/components/WallEditor"
import ModelInspector from "@/components/ModelInspector"
import FirestoreArtworkLayer from "@/components/FirestoreArtworkLayer"

export default function GalleryScene() {

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.6, 4], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias:true }}
      >

        <ambientLight intensity={0.8} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
        />

        <Suspense fallback={null}>
          <GalleryModel />

          {/* 벽 디버그 */}
          {typeof window !== "undefined" &&
           new URLSearchParams(window.location.search).get("edit") === "1" && (
            <WallDebug />
          )}

        </Suspense>

        <PlayerControls />
        <ModelInspector />
        <FirestoreArtworkLayer />

      </Canvas>

      <MobileJoystick
        onMove={(dir: any) => {
          mobileDirection.x = dir.x
          mobileDirection.z = dir.z
        }}
      />
      <AimUI />
      <WallEditor />

      <ArtworkPanel />

    </>
  )

}