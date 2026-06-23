import { exhibitions } from "@/data/exhibitions"
export { getPublicExhibitionBySlug, getPublicExhibitions } from "./getExhibitions"

export function getStaticExhibitionBySlug(slug: string) {
  return exhibitions.find((e) => e.slug === slug) ?? null
}

/**
 * @deprecated Firestore-first 조회는 getPublicExhibitionBySlug를 사용하세요.
 * This helper is static fallback seed only.
 */
export function getExhibitionBySlug(slug: string) {
  return getStaticExhibitionBySlug(slug)
}
