"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import PlayerControls from "./PlayerControls"
import GalleryModel from "./GalleryModel"

export default function GalleryScene() {

  return (
    <Canvas
      camera={{ position: [0, 1.6, 4], fov: 55 }}
      dpr={[1, 1.5]}
    >

      <ambientLight intensity={0.8} />

      <directionalLight
        position={[5,10,5]}
        intensity={1}
      />

      <Suspense fallback={null}>
        <GalleryModel />
      </Suspense>

      <PlayerControls />

    </Canvas>
  )

}