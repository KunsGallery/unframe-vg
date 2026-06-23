import { notFound } from "next/navigation"
import GalleryScene from "@/components/GalleryScene"
import { getPublicExhibitionBySlug } from "@/lib/getExhibitions"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ExhibitionGalleryPage({ params }: Props) {
  const { slug } = await params
  const exhibition = await getPublicExhibitionBySlug(slug)

  if (!exhibition) {
    notFound()
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GalleryScene exhibitionSlug={slug} exhibition={exhibition} />
    </div>
  )
}
