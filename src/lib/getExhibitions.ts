import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  exhibitions as fallbackExhibitions,
  defaultLightingPreset,
  defaultMediaPreset,
  defaultSurfacePreset,
  type Exhibition,
  type InfoWallLink,
} from "@/data/exhibitions"
import { infoWallPresets, type InfoWallPresetKey } from "@/data/infoWallPresets"

type FirestoreTimestampLike = {
  seconds?: number
  nanoseconds?: number
}

type FirestoreExhibitionRecord = {
  id?: string
  slug?: string
  title?: string
  artist?: string
  period?: string
  description?: string
  summary?: string
  rightTitle?: string
  rightBody?: string
  layoutPreset?: string
  coverImage?: string
  isCurrent?: boolean
  isRecommended?: boolean
  links?: InfoWallLink[]
  createdAt?: FirestoreTimestampLike | number | null
  updatedAt?: FirestoreTimestampLike | number | null
}

function isInfoWallLink(value: unknown): value is InfoWallLink {
  if (!value || typeof value !== "object") return false

  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.url === "string" &&
    (item.iconSrc === undefined || typeof item.iconSrc === "string")
  )
}

function isInfoWallPresetKey(value: unknown): value is InfoWallPresetKey {
  return typeof value === "string" && value in infoWallPresets
}

function readTimestamp(value: unknown) {
  if (!value) return null

  if (typeof value === "number") return value

  if (typeof value === "object") {
    const item = value as FirestoreTimestampLike
    const seconds = typeof item.seconds === "number" ? item.seconds : null
    const nanos = typeof item.nanoseconds === "number" ? item.nanoseconds : 0

    if (seconds !== null) {
      return seconds * 1000 + Math.floor(nanos / 1_000_000)
    }
  }

  return null
}

function getFallbackSeed(slug: string): Exhibition {
  const fallback = fallbackExhibitions.find((item) => item.slug === slug)

  if (fallback) {
    return fallback
  }

  return {
    slug,
    title: "Untitled Exhibition",
    artist: "",
    period: "",
    description: "",
    summary: "",
    rightTitle: "",
    rightBody: "",
    links: [],
    layoutPreset: "default",
    lighting: defaultLightingPreset,
    surfaces: defaultSurfacePreset,
    media: defaultMediaPreset,
    isCurrent: false,
    isRecommended: false,
    coverImage: "",
  }
}

function normalizeExhibition(record: FirestoreExhibitionRecord): Exhibition | null {
  const slug = typeof record.slug === "string" ? record.slug.trim() : ""
  if (!slug) return null

  const seed = getFallbackSeed(slug)
  const fallbackLinks = Array.isArray(seed.links) ? seed.links : []
  const firestoreLinks = Array.isArray(record.links)
    ? record.links.filter(isInfoWallLink)
    : []

  return {
    ...seed,
    id: typeof record.id === "string" ? record.id : seed.id,
    slug,
    title: typeof record.title === "string" && record.title.trim() ? record.title : seed.title,
    artist: typeof record.artist === "string" ? record.artist : seed.artist,
    period: typeof record.period === "string" ? record.period : seed.period,
    description:
      typeof record.description === "string" && record.description.trim()
        ? record.description
        : seed.description,
    summary:
      typeof record.summary === "string"
        ? record.summary
        : seed.summary,
    rightTitle:
      typeof record.rightTitle === "string"
        ? record.rightTitle
        : seed.rightTitle,
    rightBody:
      typeof record.rightBody === "string"
        ? record.rightBody
        : seed.rightBody,
    layoutPreset:
      isInfoWallPresetKey(record.layoutPreset)
        ? record.layoutPreset
        : seed.layoutPreset,
    coverImage:
      typeof record.coverImage === "string"
        ? record.coverImage
        : seed.coverImage,
    isCurrent:
      typeof record.isCurrent === "boolean" ? record.isCurrent : seed.isCurrent,
    isRecommended:
      typeof record.isRecommended === "boolean"
        ? record.isRecommended
        : seed.isRecommended,
    links: firestoreLinks.length > 0 ? firestoreLinks : fallbackLinks,
    createdAt: record.createdAt ?? seed.createdAt,
    updatedAt: record.updatedAt ?? seed.updatedAt,
  }
}

function sortByRecency(a: Exhibition, b: Exhibition) {
  const aTime =
    readTimestamp(a.createdAt) ?? readTimestamp(a.updatedAt) ?? Number.NEGATIVE_INFINITY
  const bTime =
    readTimestamp(b.createdAt) ?? readTimestamp(b.updatedAt) ?? Number.NEGATIVE_INFINITY

  if (aTime !== bTime) {
    return bTime - aTime
  }

  const aFallbackIndex = fallbackExhibitions.findIndex((item) => item.slug === a.slug)
  const bFallbackIndex = fallbackExhibitions.findIndex((item) => item.slug === b.slug)

  return aFallbackIndex - bFallbackIndex
}

export async function getPublicExhibitions(): Promise<Exhibition[]> {
  try {
    const snap = await getDocs(collection(db, "exhibitions"))

    const next = snap.docs
      .map((docItem) =>
        normalizeExhibition({
          id: docItem.id,
          ...(docItem.data() as FirestoreExhibitionRecord),
        })
      )
      .filter((item): item is Exhibition => item !== null)

    if (!next.length) {
      return [...fallbackExhibitions]
    }

    return next.sort(sortByRecency)
  } catch {
    return [...fallbackExhibitions]
  }
}

export async function getPublicExhibitionBySlug(
  slug: string
): Promise<Exhibition | null> {
  const trimmedSlug = slug.trim()
  if (!trimmedSlug) return null

  try {
    const snap = await getDocs(
      query(collection(db, "exhibitions"), where("slug", "==", trimmedSlug), limit(10))
    )

    const next = snap.docs
      .map((docItem) =>
        normalizeExhibition({
          id: docItem.id,
          ...(docItem.data() as FirestoreExhibitionRecord),
        })
      )
      .filter((item): item is Exhibition => item !== null)
      .sort(sortByRecency)

    if (next[0]) {
      return next[0]
    }
  } catch {
    // Fall back to the static seed below.
  }

  return fallbackExhibitions.find((item) => item.slug === trimmedSlug) ?? null
}
