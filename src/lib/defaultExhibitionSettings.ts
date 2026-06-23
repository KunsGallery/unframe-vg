import type {
  ExhibitionLighting,
  ExhibitionSurfaceSettings,
} from "@/data/exhibitions"

export const defaultLightingSettings: ExhibitionLighting = {
  spotAngleBase: 0.24,
  spotAngleSizeFactor: 0.08,
  spotAngleMax: 0.42,

  spotIntensityBase: 5,
  spotIntensityAreaFactor: 2.2,
  spotIntensityMax: 9.5,

  spotDistanceBase: 4.8,
  spotDistanceSizeFactor: 1.4,
  spotDistanceMax: 7.2,

  spotColor: "#fff1dc",

  spotWallOffset: 0.95,
  spotHeightOffset: 1.75,
  spotHeightMax: 3.45,

  rectEnabled: true,
  rectIntensity: 10,
  rectTemperature: 3000,
  rectWallOffset: 0.82,
  rectHeightOffset: 0.72,
  rectWidthPadding: 0.14,
  rectHeightPadding: 0.12,

  artworkBrightness: 1.1,
  matteBrightness: 1.02,
  frameBrightness: 1,

  ambientIntensity: 0.1,
  ambientColor: "#f4efe7",

  hemisphereIntensity: 0.18,
  hemisphereSkyColor: "#d8dee6",
  hemisphereGroundColor: "#5d564f",

  directionalIntensity: 0.12,
  directionalColor: "#eee7dd",

  environmentIntensity: 0.1,
  environmentBackgroundBlurriness: 0.08,

  toneMappingExposure: 0.74,

  backgroundColor: "#b6bec8",
  fogColor: "#b6bec8",
  fogNear: 18,
  fogFar: 44,

  vignetteOpacity: 0.28,
  topGlowOpacity: 0.02,
}

export const defaultSurfaceSettings: ExhibitionSurfaceSettings = {
  floorColor: "#8f8478",
  floorRoughness: 0.96,
  floorMetalness: 0.01,

  floorEdgeColor: "#7c7268",
  floorEdgeRoughness: 0.95,
  floorEdgeMetalness: 0.01,

  wallColor: "#e7e0d7",
  wallRoughness: 0.97,
  wallMetalness: 0.01,

  posterWallColor: "#e7e0d7",
  posterWallRoughness: 0.97,
  posterWallMetalness: 0.01,

  roofColor: "#d8d0c6",
  roofRoughness: 0.95,
  roofMetalness: 0.01,

  windowFrameColor: "#b8afa4",
  windowFrameRoughness: 0.9,
  windowFrameMetalness: 0.03,

  cylinderColor: "#dcd4ca",
  cylinderRoughness: 0.93,
  cylinderMetalness: 0.02,

  layerColor: "#cfc6bb",
  layerRoughness: 0.95,
  layerMetalness: 0.01,
}
