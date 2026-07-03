import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { exhibitions as EXHIBITIONS } from "@/data/exhibitions"
import { DEFAULT_WALL_COLOR_PRESET_ID, WALL_COLOR_PRESETS } from "@/data/wallColorPresets"

export type ExhibitionPresentationAssignment = {
  spaceId?: string
  wallColorPresetId?: string
}

export type ExhibitionPresentationAssignmentMap = Record<
  string,
  ExhibitionPresentationAssignment
>

export type ExhibitionSpaceAssignmentMap = Record<string, string>

export type ExhibitionSpaceAssignmentSaveResult =
  | "firestore"
  | "localStorage"
  | "failed"

const STORAGE_KEY = "unframe-vg:exhibition-space-assignments"

type FirestoreExhibitionPresentationRecord = {
  slug?: unknown
  spaceId?: unknown
  wallColorPresetId?: unknown
}

function isBrowser() {
  return typeof window !== "undefined"
}

function isKnownWallColorPresetId(id?: string) {
  if (!id) return false
  return WALL_COLOR_PRESETS.some((preset) => preset.id === id)
}

function normalizeSpaceId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function normalizeWallColorPresetId(value: unknown) {
  const normalized =
    typeof value === "string" && value.trim() ? value.trim() : undefined

  if (!normalized) return undefined
  return isKnownWallColorPresetId(normalized) ? normalized : undefined
}

function normalizeAssignmentValue(
  value: unknown
): ExhibitionPresentationAssignment | undefined {
  if (typeof value === "string") {
    const spaceId = normalizeSpaceId(value)
    if (!spaceId) return undefined

    return {
      spaceId,
      wallColorPresetId: DEFAULT_WALL_COLOR_PRESET_ID,
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  const item = value as Record<string, unknown>
  const spaceId = normalizeSpaceId(item.spaceId)
  const wallColorPresetId =
    normalizeWallColorPresetId(item.wallColorPresetId) ??
    normalizeWallColorPresetId(item.wallColor) ??
    undefined

  if (!spaceId && !wallColorPresetId) {
    return undefined
  }

  return {
    ...(spaceId ? { spaceId } : {}),
    ...(wallColorPresetId ? { wallColorPresetId } : {}),
  }
}

function hasAssignmentValue(assignment?: ExhibitionPresentationAssignment) {
  return Boolean(assignment?.spaceId || assignment?.wallColorPresetId)
}

function mergeAssignments(
  base?: ExhibitionPresentationAssignment,
  overlay?: ExhibitionPresentationAssignment
): ExhibitionPresentationAssignment {
  const next: ExhibitionPresentationAssignment = {}

  if (base?.spaceId) next.spaceId = base.spaceId
  if (base?.wallColorPresetId) next.wallColorPresetId = base.wallColorPresetId

  if (overlay?.spaceId) next.spaceId = overlay.spaceId
  if (overlay?.wallColorPresetId) next.wallColorPresetId = overlay.wallColorPresetId

  return next
}

function readLocalStorageAssignments(): ExhibitionPresentationAssignmentMap {
  if (!isBrowser()) return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    const next: ExhibitionPresentationAssignmentMap = {}
    let migrated = false

    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof slug !== "string") continue

      const normalizedSlug = slug.trim()
      if (!normalizedSlug) continue

      const normalized = normalizeAssignmentValue(value)
      if (!normalized) continue

      if (typeof value === "string") {
        migrated = true
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const item = value as Record<string, unknown>
        if (item.wallColorPresetId === undefined && item.wallColor === undefined) {
          migrated = true
        }
      }

      next[normalizedSlug] = normalized
    }

    if (migrated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.warn(
          "[exhibitionSpaceAssignments] Failed to migrate localStorage.",
          error
        )
      }
    }

    return next
  } catch (error) {
    console.warn("[exhibitionSpaceAssignments] Failed to read localStorage.", error)
    return {}
  }
}

function writeLocalStorageAssignments(
  assignments: ExhibitionPresentationAssignmentMap
) {
  if (!isBrowser()) return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
    return true
  } catch (error) {
    console.warn("[exhibitionSpaceAssignments] Failed to write localStorage.", error)
    return false
  }
}

async function getDb() {
  try {
    const firebase = await import("@/lib/firebase")
    return firebase.db
  } catch (error) {
    console.warn("[exhibitionSpaceAssignments] Firebase client unavailable.", error)
    return null
  }
}

function normalizeFirestoreAssignment(
  record: FirestoreExhibitionPresentationRecord
): ExhibitionPresentationAssignment | undefined {
  const spaceId = normalizeSpaceId(record.spaceId)
  const wallColorPresetId = normalizeWallColorPresetId(record.wallColorPresetId)

  if (!spaceId && !wallColorPresetId) {
    return undefined
  }

  return {
    ...(spaceId ? { spaceId } : {}),
    ...(wallColorPresetId ? { wallColorPresetId } : {}),
  }
}

function mergeAssignmentMaps(
  base: ExhibitionPresentationAssignmentMap,
  overlay: ExhibitionPresentationAssignmentMap
) {
  const next: ExhibitionPresentationAssignmentMap = { ...base }

  for (const [slug, value] of Object.entries(overlay)) {
    next[slug] = mergeAssignments(base[slug], value)
  }

  return next
}

export async function getExhibitionPresentationAssignments(): Promise<ExhibitionPresentationAssignmentMap> {
  const localAssignments = readLocalStorageAssignments()
  const db = await getDb()

  if (!db) {
    return localAssignments
  }

  try {
    const snap = await getDocs(collection(db, "exhibitions"))
    const firestoreAssignments: ExhibitionPresentationAssignmentMap = {}

    snap.docs.forEach((docItem) => {
      const data = docItem.data() as FirestoreExhibitionPresentationRecord
      const slug =
        typeof data.slug === "string" && data.slug.trim()
          ? data.slug.trim()
          : docItem.id.trim()
      const assignment = normalizeFirestoreAssignment(data)

      if (slug && assignment) {
        firestoreAssignments[slug] = assignment
      }
    })

    return mergeAssignmentMaps(localAssignments, firestoreAssignments)
  } catch (error) {
    console.warn(
      "[exhibitionSpaceAssignments] Failed to load Firestore assignments.",
      error
    )
    return localAssignments
  }
}

export async function saveExhibitionPresentationAssignment(
  slug: string,
  assignment: ExhibitionPresentationAssignment
): Promise<ExhibitionSpaceAssignmentSaveResult> {
  const normalizedSlug = slug.trim()
  if (!normalizedSlug) {
    console.warn(
      "[exhibitionSpaceAssignments] Refusing to save an empty exhibition slug."
    )
    return "failed"
  }

  const normalizedAssignment: ExhibitionPresentationAssignment = {
    ...(normalizeSpaceId(assignment.spaceId)
      ? { spaceId: normalizeSpaceId(assignment.spaceId) }
      : {}),
    ...(normalizeWallColorPresetId(assignment.wallColorPresetId)
      ? { wallColorPresetId: normalizeWallColorPresetId(assignment.wallColorPresetId) }
      : {}),
  }

  if (!hasAssignmentValue(normalizedAssignment)) {
    console.warn(
      "[exhibitionSpaceAssignments] Refusing to save an empty presentation assignment."
    )
    return "failed"
  }

  const localAssignments = readLocalStorageAssignments()
  const mergedLocalAssignment = mergeAssignments(
    localAssignments[normalizedSlug],
    normalizedAssignment
  )

  if (
    mergedLocalAssignment.spaceId &&
    !mergedLocalAssignment.wallColorPresetId
  ) {
    mergedLocalAssignment.wallColorPresetId = DEFAULT_WALL_COLOR_PRESET_ID
  }

  if (!mergedLocalAssignment.spaceId) {
    mergedLocalAssignment.spaceId =
      EXHIBITIONS.find((item) => item.slug === normalizedSlug)?.spaceId
  }

  if (
    mergedLocalAssignment.spaceId &&
    !mergedLocalAssignment.wallColorPresetId
  ) {
    mergedLocalAssignment.wallColorPresetId = DEFAULT_WALL_COLOR_PRESET_ID
  }

  const localSaved = writeLocalStorageAssignments({
    ...localAssignments,
    [normalizedSlug]: mergedLocalAssignment,
  })

  const db = await getDb()
  if (!db) {
    return localSaved ? "localStorage" : "failed"
  }

  const title =
    EXHIBITIONS.find((item) => item.slug === normalizedSlug)?.title ??
    normalizedSlug

  try {
    const payload: Record<string, unknown> = {
      slug: normalizedSlug,
      title,
      updatedAt: serverTimestamp(),
    }

    if (mergedLocalAssignment.spaceId) {
      payload.spaceId = mergedLocalAssignment.spaceId
    }

    if (mergedLocalAssignment.wallColorPresetId) {
      payload.wallColorPresetId = mergedLocalAssignment.wallColorPresetId
    }

    await setDoc(doc(db, "exhibitions", normalizedSlug), payload, {
      merge: true,
    })

    return "firestore"
  } catch (error) {
    console.warn(
      "[exhibitionSpaceAssignments] Failed to save Firestore assignment.",
      error
    )
    return localSaved ? "localStorage" : "failed"
  }
}

export async function getExhibitionSpaceAssignments(): Promise<ExhibitionSpaceAssignmentMap> {
  const assignments = await getExhibitionPresentationAssignments()
  return Object.fromEntries(
    Object.entries(assignments)
      .map(([slug, assignment]) => [slug, assignment.spaceId ?? ""])
      .filter(([, spaceId]) => typeof spaceId === "string" && spaceId.trim())
  )
}

export async function saveExhibitionSpaceAssignment(
  slug: string,
  spaceId: string
): Promise<ExhibitionSpaceAssignmentSaveResult> {
  return saveExhibitionPresentationAssignment(slug, { spaceId })
}
