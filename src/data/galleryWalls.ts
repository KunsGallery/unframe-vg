export type BoxCollider = {
  id: string
  min: [number, number, number]
  max: [number, number, number]
}

export type GalleryWall = {
  id: string
  length: number
  height: number
  thickness: number
  position: [number, number, number]
  rotation: [number, number, number]
  artCenterY: number
  artworkOffset: number
  color?: string

  // 인포월처럼 중앙에 비워둘 영역
  reservedCenterGap?: number
  reservedCenterHeight?: number
}

const WALL_CENTER_Y = 1.6
const WALL_HEIGHT = 3.2
const WALL_THICKNESS = 0.16
const ART_CENTER_Y = 1.5
const ARTWORK_OFFSET = 0.095

// 테스트용 보라색
const DEFAULT_WALL_COLOR = "#7e63ff"

export const galleryWalls: GalleryWall[] = [
  // LEFT SIDE
  {
    id: "left_01",
    length: 9.5,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [-7.59, WALL_CENTER_Y, 4.8],
    rotation: [0, -1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "left_02",
    length: 6,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [-10.51, WALL_CENTER_Y, 0.1],
    rotation: [0, 0, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "left_03",
    length: 12,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [-13.6, WALL_CENTER_Y, -6],
    rotation: [0, -1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "left_04",
    length: 6,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [-10.53, WALL_CENTER_Y, -12.1],
    rotation: [0, 3.1416, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "left_05",
    length: 8,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [-7.583, WALL_CENTER_Y, -15.975],
    rotation: [0, -1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },

  // RIGHT SIDE
  {
    id: "right_01",
    length: 9.5,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [7.63, WALL_CENTER_Y, 4.8],
    rotation: [0, 1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "right_02",
    length: 6,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [10.51, WALL_CENTER_Y, 0.105],
    rotation: [0, 0, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "right_03",
    length: 12,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [13.6, WALL_CENTER_Y, -6],
    rotation: [0, 1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "right_04",
    length: 6,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [10.53, WALL_CENTER_Y, -12.09],
    rotation: [0, -3.1416, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },
  {
    id: "right_05",
    length: 8,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [7.584, WALL_CENTER_Y, -15.975],
    rotation: [0, 1.5708, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
  },

  {
    id: "poster_wall",
    length: 1.99,
    height: 2.5,
    thickness: 0.12,
    position: [0, 1.25, 0],
    rotation: [0, 3.1416, 0],
    artCenterY: 1.3,
    artworkOffset: 0.06,
    color: DEFAULT_WALL_COLOR,
},

  // INFO WALL
  {
    id: "info_wall",
    length: 15,
    height: WALL_HEIGHT,
    thickness: WALL_THICKNESS,
    position: [0, WALL_CENTER_Y, 9.73],
    rotation: [0, 0, 0],
    artCenterY: ART_CENTER_Y,
    artworkOffset: ARTWORK_OFFSET,
    color: DEFAULT_WALL_COLOR,
    reservedCenterGap: 2.5,      // 250cm
    reservedCenterHeight: 2.8,   // 280cm
  },
]

function round(value: number) {
  return Number(value.toFixed(4))
}

export function wallToCollider(wall: GalleryWall): BoxCollider {
  const yaw = wall.rotation[1]
  const lengthAlongX = Math.abs(Math.cos(yaw)) > Math.abs(Math.sin(yaw))

  const halfLength = wall.length / 2
  const halfThickness = wall.thickness / 2
  const halfHeight = wall.height / 2

  const halfX = lengthAlongX ? halfLength : halfThickness
  const halfZ = lengthAlongX ? halfThickness : halfLength

  return {
    id: wall.id,
    min: [
      round(wall.position[0] - halfX),
      round(wall.position[1] - halfHeight),
      round(wall.position[2] - halfZ),
    ],
    max: [
      round(wall.position[0] + halfX),
      round(wall.position[1] + halfHeight),
      round(wall.position[2] + halfZ),
    ],
  }
}

export const galleryWallColliders: BoxCollider[] = galleryWalls.map(wallToCollider)