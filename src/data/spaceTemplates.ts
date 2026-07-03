export type SpaceTemplate = {
  id: string
  name: string
  description?: string
  modelPath: string
  manifestPath?: string
  thumbnailPath?: string
  defaultLighting: string
  lightingPresets: string[]
  wallColorPresets: string[]
  maxArtworks?: number
}

export const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    id: "unframe-skylight-room-v1",
    name: "UNFRAME Skylight Room",
    description:
      "UNFRAME virtual gallery room with skylight, warm wall tone, and flexible exhibition walls.",
    modelPath: "/models/unframe_skylight_room_v1.glb",
    defaultLighting: "day",
    lightingPresets: ["day", "night"],
    wallColorPresets: ["ivory", "soft-white", "warm-gray", "deep-blue"],
    maxArtworks: 40,
  },
]
