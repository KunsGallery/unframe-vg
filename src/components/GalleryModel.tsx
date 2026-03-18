"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { useGLTF, useTexture } from "@react-three/drei"

export default function GalleryModel() {
  const gltf = useGLTF("/models/gallery.glb")
  const wallTexture = useTexture("/textures/wall.jpg")

  const model = useMemo(() => {
    const scene = gltf.scene.clone(true)

    wallTexture.colorSpace = THREE.SRGBColorSpace
    wallTexture.wrapS = THREE.RepeatWrapping
    wallTexture.wrapT = THREE.RepeatWrapping
    wallTexture.repeat.set(5, 3)
    wallTexture.needsUpdate = true

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      child.castShadow = false
      child.receiveShadow = true

      const meshName = child.name.toLowerCase()

      const originalMaterial = Array.isArray(child.material)
        ? child.material[0]
        : child.material

      const baseColor =
        originalMaterial && "color" in originalMaterial
          ? (originalMaterial.color as THREE.Color).clone()
          : new THREE.Color("#ffffff")

      if (meshName === "floor") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#8e877f"),
          roughness: 0.9,
          metalness: 0.03,
        })
        return
      }

      if (meshName === "wall" || meshName === "walls") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#efeae1"),
          map: wallTexture,
          roughness: 0.96,
          metalness: 0.01,
        })
        return
      }

      if (meshName === "layer") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#ddd6ca"),
          roughness: 0.94,
          metalness: 0.02,
        })
        return
      }

      if (meshName === "cylinder") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#d8d1c5"),
          roughness: 0.88,
          metalness: 0.04,
        })
        return
      }

      if (meshName === "windows") {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#ffffff"),
          roughness: 0.01,
          metalness: 0,
          transmission: 1,
          transparent: true,
          opacity: 0.01,
          ior: 1.02,
          thickness: 0.002,
          envMapIntensity: 0.2,
        })
        return
      }

      child.material = new THREE.MeshStandardMaterial({
        color: baseColor.multiplyScalar(0.98),
        roughness: 0.82,
        metalness: 0.04,
      })
    })

    const doorGroup = new THREE.Group()

    // 여기 숫자만 바꾸면 문 전체가 같이 회전합니다
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
  }, [gltf.scene, wallTexture])

  return <primitive object={model} />
}

useGLTF.preload("/models/gallery.glb")