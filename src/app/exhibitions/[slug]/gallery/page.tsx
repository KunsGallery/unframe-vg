import { notFound } from "next/navigation"
import GalleryScene from "@/components/GalleryScene"
import { getPublicExhibitionBySlug } from "@/lib/getExhibitions"

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
  const exhibition = await getPublicExhibitionBySlug(slug)
  const spaceIdValue = resolvedSearchParams.spaceId
  const spaceId = Array.isArray(spaceIdValue) ? spaceIdValue[0] : spaceIdValue

  if (!exhibition) {
    notFound()
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GalleryScene
        exhibitionSlug={slug}
        exhibition={exhibition}
        spaceId={spaceId}
      />
    </div>
  )
}
