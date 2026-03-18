import { galleryWalls } from "@/data/galleryWalls"

export type AdminWallMeta = {
  id: string
  label: string
  side: "left" | "right" | "info"
  length: number
}

const LABEL_MAP: Record<string, string> = {
  left_01: "Left Wall 01",
  left_02: "Left Wall 02",
  left_03: "Left Wall 03",
  left_04: "Left Wall 04",
  left_05: "Left Wall 05",
  right_01: "Right Wall 01",
  right_02: "Right Wall 02",
  right_03: "Right Wall 03",
  right_04: "Right Wall 04",
  right_05: "Right Wall 05",
  info_wall: "Info Wall",
}

export const ADMIN_WALLS: AdminWallMeta[] = galleryWalls.map((wall) => ({
  id: wall.id,
  label: LABEL_MAP[wall.id] ?? wall.id,
  side: wall.id.startsWith("left_")
    ? "left"
    : wall.id.startsWith("right_")
    ? "right"
    : "info",
  length: wall.length,
}))

export const WALL_LABEL_MAP = ADMIN_WALLS.reduce<Record<string, string>>(
  (acc, wall) => {
    acc[wall.id] = wall.label
    return acc
  },
  {}
)

export const WALL_GROUPS = [
  {
    key: "left",
    title: "Left Side",
    walls: ADMIN_WALLS.filter((wall) => wall.side === "left"),
  },
  {
    key: "right",
    title: "Right Side",
    walls: ADMIN_WALLS.filter((wall) => wall.side === "right"),
  },
  {
    key: "info",
    title: "Info Wall",
    walls: ADMIN_WALLS.filter((wall) => wall.side === "info"),
  },
]