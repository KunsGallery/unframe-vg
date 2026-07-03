export type WallColorPreset = {
  id: string
  label: string
  hex: string
  description?: string
}

export const WALL_COLOR_PRESETS: WallColorPreset[] = [
  {
    id: "ivory",
    label: "Ivory",
    hex: "#F6F4EE",
    description: "Warm UNFRAME ivory wall tone.",
  },
  {
    id: "soft-white",
    label: "Soft White",
    hex: "#FAFAF7",
    description: "Clean white wall tone for minimal exhibitions.",
  },
  {
    id: "warm-gray",
    label: "Warm Gray",
    hex: "#D8D2C7",
    description: "Muted warm gray for calm presentation.",
  },
  {
    id: "deep-blue",
    label: "UNFRAME Blue",
    hex: "#004AAD",
    description: "Brand blue wall tone for experimental previews.",
  },
]

export const DEFAULT_WALL_COLOR_PRESET_ID = "ivory"

export function getWallColorPresetById(id?: string) {
  return WALL_COLOR_PRESETS.find((preset) => preset.id === id) ?? WALL_COLOR_PRESETS[0]
}
