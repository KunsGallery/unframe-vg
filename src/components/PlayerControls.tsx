"use client"

import { PointerLockControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"

export default function PlayerControls() {

  const controls = useRef<any>(null)

  const keys = useRef<{[key:string]:boolean}>({})

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

    const speed = 0.05

    if (!controls.current) return

    if (keys.current["KeyW"]) controls.current.moveForward(speed)
    if (keys.current["KeyS"]) controls.current.moveForward(-speed)
    if (keys.current["KeyA"]) controls.current.moveRight(-speed)
    if (keys.current["KeyD"]) controls.current.moveRight(speed)

  })

  return <PointerLockControls ref={controls} />

}