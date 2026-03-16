"use client"

import { useEffect } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ModelInspector() {

  const { scene } = useGLTF("/models/gallery.glb")

  useEffect(()=>{

    console.log("===== MODEL STRUCTURE =====")

    scene.traverse((obj)=>{

      if(obj instanceof THREE.Mesh){

        const pos = obj.getWorldPosition(new THREE.Vector3())

        console.log({
          name: obj.name,
          position: [pos.x, pos.y, pos.z],
          rotation: [
            obj.rotation.x,
            obj.rotation.y,
            obj.rotation.z
          ]
        })

      }

    })

  },[scene])

  return null
}