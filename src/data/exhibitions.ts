import { infoWallPresets, type InfoWallPresetKey } from "./infoWallPresets"

export type InfoWallLink = {
  id: string
  label: string
  url: string
  iconSrc?: string
}

export type Exhibition = {
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
  isCurrent?: boolean
  isRecommended?: boolean
  coverImage?: string
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
      {
        id: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
      },
      {
        id: "website",
        label: "Website",
        url: "https://example.com",
      },
    ],
    layoutPreset: "default",
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
      {
        id: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
      },
      {
        id: "website",
        label: "Website",
        url: "https://example.com",
      },
    ],
    layoutPreset: "split",
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
      {
        id: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
      },
      {
        id: "website",
        label: "Website",
        url: "https://example.com",
      },
      {
        id: "press",
        label: "Press",
        url: "https://example.com/press",
      },
    ],
    layoutPreset: "compact",
    coverImage: "/images/exhibitions/mind-spectrum-compact.jpg",
  },
]

export function getInfoWallLayoutByPreset(preset: InfoWallPresetKey) {
  return infoWallPresets[preset]
}