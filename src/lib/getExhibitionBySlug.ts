import { exhibitions } from "@/data/exhibitions"

export function getExhibitionBySlug(slug: string) {
  return exhibitions.find((e) => e.slug === slug)
}