"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect } from "react"
import * as THREE from "three"

export default function GalleryCollider() {

  const { scene } = useGLTF("/models/gallery.glb")

  useEffect(() => {

    scene.traverse((child: any) => {

      if (child.isMesh) {

        child.material = new THREE.MeshBasicMaterial({
          visible: false
        })

        child.geometry.computeBoundingBox()

      }

    })

  }, [scene])

  return <primitive object={scene} />

}