"use client"

import { useEffect, useRef } from "react"
import { mobileLook } from "./PlayerControls"

export default function MobileLookPad() {
  const draggingRef = useRef(false)
  const lastRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return
      if (!e.touches[0]) return

      const touch = e.touches[0]
      const dx = touch.clientX - lastRef.current.x
      const dy = touch.clientY - lastRef.current.y

      lastRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      }

      mobileLook.x = dx
      mobileLook.y = dy
      e.preventDefault()
    }

    function onTouchEnd() {
      draggingRef.current = false
      mobileLook.x = 0
      mobileLook.y = 0
    }

    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd)
    window.addEventListener("touchcancel", onTouchEnd)

    return () => {
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [])

  return (
    <div
      onTouchStart={(e) => {
        const touch = e.touches[0]
        if (!touch) return

        draggingRef.current = true
        lastRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        }

        mobileLook.x = 0
        mobileLook.y = 0
      }}
      onTouchMove={(e) => {
        e.preventDefault()
      }}
      onTouchEnd={() => {
        draggingRef.current = false
        mobileLook.x = 0
        mobileLook.y = 0
      }}
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: "55vw",
        height: "100dvh",
        zIndex: 20,
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        background: "transparent",
      }}
    />
  )
}