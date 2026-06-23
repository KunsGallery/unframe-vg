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

  // 임시 디버그용 벽, 충돌 제외
  disableCollider?: boolean
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
    reservedCenterGap: 2.5, // 250cm
    reservedCenterHeight: 2.8, // 280cm
  },

  // =========================================================
  // CURVE WALLS - TEMP DEBUG PLANES
  // 포스터월 주변 임시 배치, 찾기 쉽게 좌/우 6면씩 정렬
  // 나중에 실제 곡면 위치로 옮길 예정
  // =========================================================

  // LEFT CURVE DEBUG
  {
    id: "curve_left_01",
    length: 1.9411,
    height: 4.9386,
    thickness: 0.04,
    position: [-7.3722, 2.5693, -20.9192],
    rotation: [0, -1.7017, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_left_02",
    length: 1.8089,
    height: 4.9386,
    thickness: 0.04,
    position: [-6.8698, 2.5693, -22.7942],
    rotation: [0, 1.1781 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_left_03",
    length: 1.5533,
    height: 4.9386,
    thickness: 0.04,
    position: [-5.8992, 2.5693, -24.4753],
    rotation: [0, -2.2253, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_left_04",
    length: 1.5533,
    height: 4.9386,
    thickness: 0.04,
    position: [-4.5267, 2.5693, -25.8479],
    rotation: [0, -2.4871, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_left_05",
    length: 1.8089,
    height: 4.9386,
    thickness: 0.04,
    position: [-2.8456, 2.5693, -26.8184],
    rotation: [0, -2.7489, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_left_06",
    length: 1.9411,
    height: 4.9386,
    thickness: 0.04,
    position: [-0.9706, 2.5693, -27.3208],
    rotation: [0, 0.1309 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },

  {
    id: "curve_right_01",
    length: 1.9421,
    height: 4.9386,
    thickness: 0.04,
    position: [7.3722, 2.5693, -20.9187],
    rotation: [0, 1.7016, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_right_02",
    length: 1.8089,
    height: 4.9386,
    thickness: 0.04,
    position: [6.8698, 2.5693, -22.7942],
    rotation: [0, -1.1781 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_right_03",
    length: 1.5533,
    height: 4.9386,
    thickness: 0.04,
    position: [5.8992, 2.5693, -24.4753],
    rotation: [0, -0.9163 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_right_04",
    length: 1.5533,
    height: 4.9386,
    thickness: 0.04,
    position: [4.5267, 2.5693, -25.8479],
    rotation: [0, 2.4871, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_right_05",
    length: 1.8089,
    height: 4.9386,
    thickness: 0.04,
    position: [2.8456, 2.5693, -26.8184],
    rotation: [0, -0.3927 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
  {
    id: "curve_right_06",
    length: 1.9411,
    height: 4.9386,
    thickness: 0.04,
    position: [0.9706, 2.5693, -27.3208],
    rotation: [0, -0.1309 + Math.PI, 0],
    artCenterY: 1.5,
    artworkOffset: 0.08,
  },
]

function round(value: number) {
  return Number(value.toFixed(4))
}

export function wallToCollider(
  wall: GalleryWall,
  options?: {
    extraLength?: number
    extraThickness?: number
    extraHeight?: number
  }
): BoxCollider {
  const yaw = wall.rotation[1]

  const extraLength = options?.extraLength ?? 0
  const extraThickness = options?.extraThickness ?? 0
  const extraHeight = options?.extraHeight ?? 0

  const halfLength = (wall.length + extraLength) / 2
  const halfThickness = (wall.thickness + extraThickness) / 2
  const halfHeight = (wall.height + extraHeight) / 2

  // 회전된 벽의 AABB extents
  const halfX =
    Math.abs(Math.cos(yaw)) * halfLength +
    Math.abs(Math.sin(yaw)) * halfThickness

  const halfZ =
    Math.abs(Math.sin(yaw)) * halfLength +
    Math.abs(Math.cos(yaw)) * halfThickness

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

const baseWallColliders: BoxCollider[] = galleryWalls
  .filter((wall) => !wall.disableCollider)
  .map((wall) => wallToCollider(wall))

const curveWallCollisionColliders: BoxCollider[] = galleryWalls
  .filter((wall) => wall.id.startsWith("curve_"))
  .map((wall) =>
    wallToCollider(wall, {
      // 곡면벽 사이 미세한 틈 메우기용
      extraLength: 0.18,
      extraThickness: 0.2,
      extraHeight: 0.12,
    })
  )
  .map((collider) => ({
    ...collider,
    id: `${collider.id}__collision`,
  }))

export const galleryWallColliders: BoxCollider[] = [
  ...baseWallColliders,
  ...curveWallCollisionColliders,
]