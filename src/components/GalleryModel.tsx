"use client"

import { useGLTF } from "@react-three/drei"

export default function GalleryModel() {

  const { scene } = useGLTF("/models/gallery.glb")

  return (
    <primitive object={scene} />
  )
}

useGLTF.preload("/models/gallery.glb")