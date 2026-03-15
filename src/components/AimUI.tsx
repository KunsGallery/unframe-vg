"use client"

import { useEffect, useState } from "react"

export default function AimUI() {
  const [touchPoint, setTouchPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      setTouchPoint({ x: t.clientX, y: t.clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      setTouchPoint({ x: t.clientX, y: t.clientY })
    }

    const handleTouchEnd = () => {
      setTouchPoint(null)
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return (
    <>
      {/* desktop / mobile 공통 중앙 조준점 */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          width: 18,
          height: 18,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 2,
            height: 18,
            background: "rgba(255,255,255,0.9)",
            transform: "translateX(-50%)",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: 18,
            height: 2,
            background: "rgba(255,255,255,0.9)",
            transform: "translateY(-50%)",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 6,
            height: 6,
            transform: "translate(-50%, -50%)",
            background: "rgba(255,255,255,1)",
            borderRadius: "50%",
            boxShadow: "0 0 10px rgba(255,255,255,0.6)",
          }}
        />
      </div>

      {/* 모바일 터치 위치 표시 */}
      {touchPoint && (
        <div
          style={{
            position: "fixed",
            left: touchPoint.x,
            top: touchPoint.y,
            width: 34,
            height: 34,
            transform: "translate(-50%, -50%)",
            border: "2px solid rgba(255,255,255,0.9)",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 0 12px rgba(255,255,255,0.25)",
          }}
        />
      )}
    </>
  )
}