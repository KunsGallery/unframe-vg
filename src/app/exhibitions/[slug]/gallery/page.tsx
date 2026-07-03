import GallerySpaceResolver from "@/components/GallerySpaceResolver"
import { getStaticExhibitionBySlug } from "@/lib/getStaticExhibitionBySlug"
import {
  defaultLightingPreset,
  defaultMediaPreset,
  defaultSurfacePreset,
  type Exhibition,
} from "@/data/exhibitions"

const DEFAULT_SPACE_ID = "unframe-skylight-room-v1"

function createFallbackExhibition(slug: string): Exhibition {
  const normalizedSlug = slug.trim()

  return {
    slug: normalizedSlug || slug,
    title: normalizedSlug || "Untitled Exhibition",
    artist: "",
    period: "",
    description: "",
    summary: "",
    rightTitle: "",
    rightBody: "",
    links: [],
    layoutPreset: "default",
    spaceId: DEFAULT_SPACE_ID,
    lighting: defaultLightingPreset,
    surfaces: defaultSurfacePreset,
    media: defaultMediaPreset,
    isCurrent: false,
    isRecommended: false,
    coverImage: "",
  }
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ExhibitionGalleryPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const spaceIdValue = resolvedSearchParams.spaceId
  const querySpaceId = Array.isArray(spaceIdValue) ? spaceIdValue[0] : spaceIdValue
  const staticExhibition = getStaticExhibitionBySlug(slug)
  const exhibition = staticExhibition ?? createFallbackExhibition(slug)

  if (!staticExhibition) {
    console.warn(
      `[GalleryPage] Unknown exhibition slug "${slug}". Using fallback exhibition data.`
    )
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GallerySpaceResolver
        slug={slug}
        exhibition={exhibition}
        querySpaceId={querySpaceId}
        fallbackSpaceId={exhibition.spaceId || DEFAULT_SPACE_ID}
      />
    </div>
  )
}
