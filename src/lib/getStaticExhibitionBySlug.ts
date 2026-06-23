import { exhibitions } from "@/data/exhibitions"
export { getPublicExhibitionBySlug, getPublicExhibitions } from "./getExhibitions"

export function getStaticExhibitionBySlug(slug: string) {
  return exhibitions.find((e) => e.slug === slug) ?? null
}
