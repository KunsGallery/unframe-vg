"use client"

import { useEffect, useRef } from "react"

export default function MobileJoystick({ onMove }: any) {

  const joystickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    import("nipplejs").then((nipplejs) => {

      const manager = nipplejs.default.create({
        zone: joystickRef.current!,
        mode: "static",
        position: { left: "80px", bottom: "80px" },
        color: "white"
      })

      manager.on("move", (evt: any, data: any) => {

        const angle = data.angle.radian
        const force = data.force

        const x = Math.cos(angle) * force
        const z = Math.sin(angle) * force

        onMove({ x, z })

      })

      manager.on("end", () => {

        onMove({ x:0, z:0 })

      })

    })

  }, [])

  return (
    <div
      ref={joystickRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "200px",
        height: "200px",
        zIndex: 10
      }}
    />
  )

}