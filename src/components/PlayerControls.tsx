"use client"

import { PointerLockControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"

export const mobileDirection = { x: 0, z: 0 }

export default function PlayerControls() {

  const controls = useRef<any>(null)

  const keys = useRef<{ [key: string]: boolean }>({})

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

    if (!controls.current) return

    const speed = 0.05

    // desktop controls
    if (keys.current["KeyI"]) controls.current.moveForward(speed)
    if (keys.current["KeyK"]) controls.current.moveForward(-speed)
    if (keys.current["KeyJ"]) controls.current.moveRight(-speed)
    if (keys.current["KeyL"]) controls.current.moveRight(speed)

    // mobile joystick controls
    if (mobileDirection.z !== 0) {
      controls.current.moveForward(mobileDirection.z * speed)
    }

    if (mobileDirection.x !== 0) {
      controls.current.moveRight(mobileDirection.x * speed)
    }

  })

  return <PointerLockControls ref={controls} />

}