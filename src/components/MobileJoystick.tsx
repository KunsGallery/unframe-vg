"use client"

import { useEffect, useRef } from "react"

export default function MobileJoystick({ onMove }: any) {

  const joystickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!joystickRef.current) return

    let manager: any

    import("nipplejs").then((nipplejs) => {

      manager = nipplejs.default.create({
        zone: joystickRef.current!,
        mode: "static",
        position: { left: "80px", bottom: "80px" },
        color: "white"
      })

      manager.on("move", (_: any, data: any) => {

        const angle = data.angle.radian
        const force = data.force

        onMove({
          x: Math.cos(angle) * force,
          z: Math.sin(angle) * force
        })

      })

      manager.on("end", () => {

        onMove({ x: 0, z: 0 })

      })

    })

    return () => {
      if (manager) manager.destroy()
    }

  }, [])

  return (
    <div
      ref={joystickRef}
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: 160,
        height: 160
      }}
    />
  )

}