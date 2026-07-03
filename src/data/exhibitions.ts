/**
 * Static fallback exhibition seed data.
 * Firestore `exhibitions` is the primary source of truth.
 * Public routes should prefer `getPublicExhibitions` / `getPublicExhibitionBySlug`.
 */
import { infoWallPresets, type InfoWallPresetKey } from "./infoWallPresets"

export type InfoWallLink = {
  id: string
  label: string
  url: string
  iconSrc?: string
}

export type ExhibitionLighting = {
  spotAngleBase: number
  spotAngleSizeFactor: number
  spotAngleMax: number

  spotIntensityBase: number
  spotIntensityAreaFactor: number
  spotIntensityMax: number

  spotDistanceBase: number
  spotDistanceSizeFactor: number
  spotDistanceMax: number

  spotColor: string

  spotWallOffset: number
  spotHeightOffset: number
  spotHeightMax: number

  rectEnabled: boolean

  // 작품+액자 기준 사각 조명 밝기
  rectIntensity: number

  // 색온도(K), 3000 전후 추천
  rectTemperature: number

  // 벽에서 조명을 얼마나 앞으로 띄울지
  rectWallOffset: number

  // 작품 중심보다 얼마나 위에서 비출지
  rectHeightOffset: number

  // 작품/액자보다 좌우로 얼마나 더 넓게 비출지
  rectWidthPadding: number

  // 작품/액자보다 상하로 얼마나 더 넓게 비출지
  rectHeightPadding: number

  // 작품 이미지 자체 밝기
  artworkBrightness: number

  // 매트 밝기
  matteBrightness: number

  // 액자 기본 밝기
  frameBrightness: number

  // 공간 전체 기본 광량
  ambientIntensity: number
  ambientColor: string

  // 공간 상부/하부 분위기 정리용 보조광
  hemisphereIntensity: number
  hemisphereSkyColor: string
  hemisphereGroundColor: string

  // 공간 전체 방향광
  directionalIntensity: number
  directionalColor: string

  // HDR 환경광 세기
  environmentIntensity: number
  environmentBackgroundBlurriness: number

  // 전체 노출, 낮출수록 공간이 눌리고 작품 조명이 살아남
  toneMappingExposure: number

  // 공간 배경/안개 톤
  backgroundColor: string
  fogColor: string
  fogNear: number
  fogFar: number

  // 화면 가장자리 눌러주는 정도
  vignetteOpacity: number

  // 상단 글로우
  topGlowOpacity: number
}

export type ExhibitionSurfaceSettings = {
  floorColor: string
  floorRoughness: number
  floorMetalness: number

  floorEdgeColor: string
  floorEdgeRoughness: number
  floorEdgeMetalness: number

  wallColor: string
  wallRoughness: number
  wallMetalness: number

  posterWallColor: string
  posterWallRoughness: number
  posterWallMetalness: number

  roofColor: string
  roofRoughness: number
  roofMetalness: number

  windowFrameColor: string
  windowFrameRoughness: number
  windowFrameMetalness: number

  cylinderColor: string
  cylinderRoughness: number
  cylinderMetalness: number

  layerColor: string
  layerRoughness: number
  layerMetalness: number
}

export type ExhibitionMediaSettings = {
  cylinderWallVideoUrl: string
  cylinderWallPreviewImageUrl: string
}

export type Exhibition = {
  id?: string
  slug: string
  title: string
  artist: string
  period: string
  description: string
  summary?: string
  rightTitle?: string
  rightBody?: string
  links: InfoWallLink[]
  layoutPreset: InfoWallPresetKey
  spaceId?: string
  wallColorPresetId?: string
  lighting: ExhibitionLighting
  surfaces: ExhibitionSurfaceSettings
  media: ExhibitionMediaSettings
  isCurrent?: boolean
  isRecommended?: boolean
  coverImage?: string
  createdAt?: any
  updatedAt?: any
}

export const defaultLightingPreset: ExhibitionLighting = {
  spotAngleBase: 0.24,
  spotAngleSizeFactor: 0.08,
  spotAngleMax: 0.42,

  spotIntensityBase: 5.0,
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
  frameBrightness: 1.0,

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

export const defaultSurfacePreset: ExhibitionSurfaceSettings = {
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

export const defaultMediaPreset: ExhibitionMediaSettings = {
  cylinderWallVideoUrl: "",
  cylinderWallPreviewImageUrl: "",
}

export const exhibitions: Exhibition[] = [
  {
    slug: "mind-spectrum",
    title: "Mind Spectrum",
    artist: "Kim Hwan",
    period: "2026.03.01 – 03.10",
    description:
      "빛과 색의 파장을 통해 내면의 감각과 무의식을 탐구하는 작업.",
    summary:
      "빛과 색의 파장을 통해 내면의 감각과 무의식을 탐구하는 전시.",
    rightTitle: "About",
    rightBody:
      "이 작업은 감각과 무의식의 경계를 탐색하며, 관람자에게 내면의 파장을 경험하게 한다.",
    links: [
      { id: "instagram", label: "Instagram", url: "https://instagram.com" },
      { id: "website", label: "Website", url: "https://example.com" },
    ],
    layoutPreset: "default",
    spaceId: "unframe-skylight-room-v1",
    wallColorPresetId: "ivory",
    lighting: defaultLightingPreset,
    surfaces: defaultSurfacePreset,
    media: defaultMediaPreset,
    isCurrent: true,
    isRecommended: true,
    coverImage: "/images/exhibitions/mind-spectrum.jpg",
  },
  {
    slug: "mind-spectrum-split",
    title: "Mind Spectrum Split",
    artist: "Kim Hwan",
    period: "2026.03.11 – 03.20",
    description:
      "좌우 분할형 인포월 레이아웃 테스트 전시입니다. 왼쪽에는 핵심 정보, 오른쪽에는 부가 텍스트가 배치됩니다.",
    summary:
      "좌우 분할형 인포월 레이아웃으로 구성된 전시 테스트 버전.",
    rightTitle: "Curatorial Note",
    rightBody:
      "작품은 감각의 파장을 매개로 관람자의 내면과 연결된다. 이 레이아웃은 정보의 밀도를 분리해 보다 정돈된 읽기 경험을 만든다.",
    links: [
      { id: "instagram", label: "Instagram", url: "https://instagram.com" },
      { id: "website", label: "Website", url: "https://example.com" },
    ],
    layoutPreset: "split",
    spaceId: "unframe-skylight-room-v1",
    wallColorPresetId: "ivory",
    lighting: {
      ...defaultLightingPreset,
      rectIntensity: 9.2,
      rectTemperature: 2950,
      artworkBrightness: 1.08,
    },
    surfaces: defaultSurfacePreset,
    media: defaultMediaPreset,
    isRecommended: true,
    coverImage: "/images/exhibitions/mind-spectrum-split.jpg",
  },
  {
    slug: "mind-spectrum-compact",
    title: "Mind Spectrum Compact",
    artist: "Kim Hwan",
    period: "2026.03.21 – 03.30",
    description:
      "설명과 부가 텍스트를 더 촘촘하게 배치한 compact preset 테스트 전시입니다.",
    summary:
      "보다 밀도 있게 정보를 정리한 compact preset 테스트 전시.",
    rightTitle: "Note",
    rightBody:
      "한 화면 안에 정보를 보다 밀도 있게 정리해 모바일과 짧은 체류 시간에서도 빠르게 읽히는 구성을 목표로 한다.",
    links: [
      { id: "instagram", label: "Instagram", url: "https://instagram.com" },
      { id: "website", label: "Website", url: "https://example.com" },
      { id: "press", label: "Press", url: "https://example.com/press" },
    ],
    layoutPreset: "compact",
    spaceId: "unframe-skylight-room-v1",
    wallColorPresetId: "ivory",
    lighting: {
      ...defaultLightingPreset,
      rectIntensity: 10.8,
      rectTemperature: 3200,
      environmentIntensity: 0.08,
      toneMappingExposure: 0.72,
      artworkBrightness: 1.12,
    },
    surfaces: defaultSurfacePreset,
    media: defaultMediaPreset,
    coverImage: "/images/exhibitions/mind-spectrum-compact.jpg",
  },
]

export function getInfoWallLayoutByPreset(preset: InfoWallPresetKey) {
  return infoWallPresets[preset]
}
