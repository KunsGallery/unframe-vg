"use client"

import * as THREE from "three"
import { Text } from "@react-three/drei"
import { galleryWalls } from "@/data/galleryWalls"

const CURVE_IDS = new Set([
  "curve_left_01",
  "curve_left_02",
  "curve_left_03",
  "curve_left_04",
  "curve_left_05",
  "curve_left_06",
  "curve_right_01",
  "curve_right_02",
  "curve_right_03",
  "curve_right_04",
  "curve_right_05",
  "curve_right_06",
])

export default function GalleryWalls() {
  const curveWalls = galleryWalls.filter((wall) => CURVE_IDS.has(wall.id))

  return null;
}