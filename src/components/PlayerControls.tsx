"use client"

import { PointerLockControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useArtworkStore } from "@/store/useArtworkStore"
import { galleryWallColliders } from "@/data/galleryWalls"

export const mobileDirection = { x: 0, z: 0 }
export const mobileLook = { x: 0, y: 0 }

const PLAYER_RADIUS = 0.24
const PLAYER_HEIGHT = 1.6

function collidesAt(position: THREE.Vector3) {
  const playerMinX = position.x - PLAYER_RADIUS
  const playerMaxX = position.x + PLAYER_RADIUS
  const playerMinZ = position.z - PLAYER_RADIUS
  const playerMaxZ = position.z + PLAYER_RADIUS
  const playerMinY = position.y - PLAYER_HEIGHT
  const playerMaxY = position.y + 0.2

  return galleryWallColliders.some((box) => {
    const [minX, minY, minZ] = box.min
    const [maxX, maxY, maxZ] = box.max

    const overlapX = playerMaxX > minX && playerMinX < maxX
    const overlapY = playerMaxY > minY && playerMinY < maxY
    const overlapZ = playerMaxZ > minZ && playerMinZ < maxZ

    return overlapX && overlapY && overlapZ
  })
}

export default function PlayerControls() {
  const controls = useRef<any>(null)
  const keys = useRef<{ [key: string]: boolean }>({})
  const selected = useArtworkStore((state) => state.selected)
  const { camera } = useThree()

  const isTouchDevice = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    )
  }, [])

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useEffect(() => {
    yawRef.current = camera.rotation.y
    pitchRef.current = camera.rotation.x
    camera.rotation.order = "YXZ"
  }, [camera])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
    }

    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)

    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  useFrame(() => {
    if (selected) return

    const speed = 0.05

    let moveForward = 0
    let moveRight = 0

    if (keys.current["KeyI"]) moveForward += speed
    if (keys.current["KeyK"]) moveForward -= speed
    if (keys.current["KeyL"]) moveRight += speed
    if (keys.current["KeyJ"]) moveRight -= speed

    if (mobileDirection.z !== 0) moveForward += mobileDirection.z * speed
    if (mobileDirection.x !== 0) moveRight += mobileDirection.x * speed

    if (isTouchDevice) {
      const lookSensitivity = 0.0032

      if (mobileLook.x !== 0 || mobileLook.y !== 0) {
        yawRef.current -= mobileLook.x * lookSensitivity
        pitchRef.current -= mobileLook.y * lookSensitivity

        const maxPitch = Math.PI / 2.3
        const minPitch = -Math.PI / 2.3

        if (pitchRef.current > maxPitch) pitchRef.current = maxPitch
        if (pitchRef.current < minPitch) pitchRef.current = minPitch

        camera.rotation.order = "YXZ"
        camera.rotation.y = yawRef.current
        camera.rotation.x = pitchRef.current

        mobileLook.x = 0
        mobileLook.y = 0
      }
    }

    if (moveForward === 0 && moveRight === 0) return

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const current = camera.position.clone()
    const moveVector = forward.multiplyScalar(moveForward).add(right.multiplyScalar(moveRight))

    const tryX = current.clone()
    tryX.x += moveVector.x

    const tryZ = current.clone()
    tryZ.z += moveVector.z

    if (!collidesAt(tryX)) {
      camera.position.x = tryX.x
    }

    if (!collidesAt(tryZ)) {
      camera.position.z = tryZ.z
    }
  })

  if (selected) return null
  if (isTouchDevice) return null

  return <PointerLockControls ref={controls} />
}