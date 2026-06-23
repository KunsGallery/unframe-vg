import { exhibitions } from "@/data/exhibitions"
export { getPublicExhibitionBySlug, getPublicExhibitions } from "./getExhibitions"

export function getExhibitionBySlug(slug: string) {
  return exhibitions.find((e) => e.slug === slug)
}
