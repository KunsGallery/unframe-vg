"use client"

import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"

export default function GalleryCollider() {

  const { scene } = useGLTF("/models/gallery.glb")

  const colliders = useMemo(() => {

    const meshes: any[] = []

    scene.traverse((child: any) => {

      if (!child.isMesh) return

      if (
        child.parent?.name === "Wall" ||
        child.parent?.name === "Walls" ||
        child.parent?.name === "Cylinder"
      ) {
        meshes.push(child)
      }

    })

    return meshes

  }, [scene])

  return <primitive object={scene} visible={false} />

}