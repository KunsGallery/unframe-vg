"use client"

import { useEffect, useRef, useState } from "react"
import { mobileLook } from "./PlayerControls"

export default function MobileLookJoystick() {
  const baseRef = useRef<HTMLDivElement | null>(null)
  const touchIdRef = useRef<number | null>(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const [stick, setStick] = useState({ x: 0, y: 0, active: false })

  useEffect(() => {
    function reset() {
      touchIdRef.current = null
      mobileLook.x = 0
      mobileLook.y = 0
      setStick({ x: 0, y: 0, active: false })
    }

    function handleTouchMove(e: TouchEvent) {
      if (touchIdRef.current === null) return

      const touch = Array.from(e.touches).find(
        (t) => t.identifier === touchIdRef.current
      )
      if (!touch) return

      const dx = touch.clientX - centerRef.current.x
      const dy = touch.clientY - centerRef.current.y

      const max = 42
      const dist = Math.hypot(dx, dy) || 1
      const clamped = Math.min(dist, max)
      const x = (dx / dist) * clamped
      const y = (dy / dist) * clamped

      setStick({ x, y, active: true })

      mobileLook.x = x / max
      mobileLook.y = y / max

      e.preventDefault()
    }

    function handleTouchEnd(e: TouchEvent) {
      if (touchIdRef.current === null) return

      const stillActive = Array.from(e.touches).some(
        (t) => t.identifier === touchIdRef.current
      )

      if (!stillActive) {
        reset()
      }
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
    window.addEventListener("touchcancel", handleTouchEnd)

    return () => {
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [])

  return (
    <div
      ref={baseRef}
      onTouchStart={(e) => {
        if (touchIdRef.current !== null) return
        const touch = e.changedTouches[0]
        if (!touch) return

        const rect = baseRef.current?.getBoundingClientRect()
        if (!rect) return

        touchIdRef.current = touch.identifier
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }

        setStick({ x: 0, y: 0, active: true })
        mobileLook.x = 0
        mobileLook.y = 0
      }}
      style={baseStyle}
    >
      <div style={ringStyle} />
      <div
        style={{
          ...thumbStyle,
          transform: `translate(${stick.x}px, ${stick.y}px)`,
          opacity: stick.active ? 1 : 0.92,
        }}
      />
    </div>
  )
}

const baseStyle: React.CSSProperties = {
  position: "fixed",
  right: 24,
  bottom: 28,
  width: 110,
  height: 110,
  borderRadius: "50%",
  zIndex: 30,
  touchAction: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
}

const ringStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
}

const thumbStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: 48,
  height: 48,
  marginLeft: -24,
  marginTop: -24,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.16)",
}