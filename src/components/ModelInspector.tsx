"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

const TARGET_NAMES = new Set([
  "CurveWall_L_01",
  "CurveWall_L_02",
  "CurveWall_L_03",
  "CurveWall_L_04",
  "CurveWall_L_05",
  "CurveWall_L_06",
  "CurveWall_R_01",
  "CurveWall_R_02",
  "CurveWall_R_03",
  "CurveWall_R_04",
  "CurveWall_R_05",
  "CurveWall_R_06",
])

function round(n: number) {
  return Number(n.toFixed(4))
}

function getWorldBoundingInfo(mesh: THREE.Mesh) {
  const geometry = mesh.geometry.clone()
  geometry.applyMatrix4(mesh.matrixWorld)
  geometry.computeBoundingBox()

  const box = geometry.boundingBox
  if (!box) return null

  const center = new THREE.Vector3()
  box.getCenter(center)

  const size = new THREE.Vector3()
  box.getSize(size)

  return { center, size, geometry }
}

function getPlaneYawFromGeometry(geometry: THREE.BufferGeometry) {
  const pos = geometry.attributes.position
  if (!pos || pos.count < 3) return 0

  const a = new THREE.Vector3(pos.getX(0), pos.getY(0), pos.getZ(0))
  const b = new THREE.Vector3(pos.getX(1), pos.getY(1), pos.getZ(1))
  const c = new THREE.Vector3(pos.getX(2), pos.getY(2), pos.getZ(2))

  const ab = new THREE.Vector3().subVectors(b, a)
  const ac = new THREE.Vector3().subVectors(c, a)

  const normal = new THREE.Vector3().crossVectors(ab, ac).normalize()

  // 수직 벽 기준 yaw 추정
  const yaw = Math.atan2(normal.x, normal.z)
  return yaw
}

export default function ModelInspector() {
  const { scene } = useThree()

  useEffect(() => {
    const rows: Array<{
      name: string
      center: [number, number, number]
      size: [number, number, number]
      yaw: number
      suggested: {
        id: string
        length: number
        height: number
        thickness: number
        position: [number, number, number]
        rotation: [number, number, number]
        artCenterY: number
        artworkOffset: number
        color: string
        disableCollider: boolean
      }
    }> = []

    scene.updateMatrixWorld(true)

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (!TARGET_NAMES.has(child.name)) return

      const info = getWorldBoundingInfo(child)
      if (!info) return

      const { center, size, geometry } = info
      const yaw = getPlaneYawFromGeometry(geometry)

      const length = Math.max(size.x, size.z)
      const height = size.y

      rows.push({
        name: child.name,
        center: [round(center.x), round(center.y), round(center.z)],
        size: [round(size.x), round(size.y), round(size.z)],
        yaw: round(yaw),
        suggested: {
          id: child.name
            .replace("CurveWall_L_", "curve_left_")
            .replace("CurveWall_R_", "curve_right_")
            .toLowerCase(),
          length: round(length),
          height: round(height),
          thickness: 0.04,
          position: [round(center.x), round(center.y), round(center.z)],
          rotation: [0, round(yaw), 0],
          artCenterY: round(center.y - 0.1),
          artworkOffset: 0.03,
          color: "#7e63ff",
          disableCollider: true,
        },
      })
    })

    rows.sort((a, b) => a.name.localeCompare(b.name))

    console.log("===== CURVE WALL AUTO DATA =====")
    console.table(
      rows.map((row) => ({
        name: row.name,
        center: row.center.join(", "),
        size: row.size.join(", "),
        yaw: row.yaw,
      }))
    )

    console.log(
      JSON.stringify(rows.map((row) => row.suggested), null, 2)
    )
  }, [scene])

  return null
}