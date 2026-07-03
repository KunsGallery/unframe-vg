import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { exhibitions as EXHIBITIONS } from "@/data/exhibitions"

export type ExhibitionSpaceAssignmentMap = Record<string, string>

export type ExhibitionSpaceAssignmentSaveResult =
  | "firestore"
  | "localStorage"
  | "failed"

const STORAGE_KEY = "unframe-vg:exhibition-space-assignments"

type FirestoreExhibitionSpaceRecord = {
  slug?: unknown
  spaceId?: unknown
}

function isBrowser() {
  return typeof window !== "undefined"
}

function readLocalStorageAssignments(): ExhibitionSpaceAssignmentMap {
  if (!isBrowser()) return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    const next: ExhibitionSpaceAssignmentMap = {}
    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof slug !== "string" || typeof value !== "string") continue

      const normalizedSlug = slug.trim()
      const normalizedSpaceId = value.trim()
      if (!normalizedSlug || !normalizedSpaceId) continue

      next[normalizedSlug] = normalizedSpaceId
    }

    return next
  } catch (error) {
    console.warn("[exhibitionSpaceAssignments] Failed to read localStorage.", error)
    return {}
  }
}

function writeLocalStorageAssignments(assignments: ExhibitionSpaceAssignmentMap) {
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

export async function getExhibitionSpaceAssignments(): Promise<ExhibitionSpaceAssignmentMap> {
  const localAssignments = readLocalStorageAssignments()
  const db = await getDb()

  if (!db) {
    return localAssignments
  }

  try {
    const snap = await getDocs(collection(db, "exhibitions"))
    const firestoreAssignments: ExhibitionSpaceAssignmentMap = {}

    snap.docs.forEach((docItem) => {
      const data = docItem.data() as FirestoreExhibitionSpaceRecord
      const slug =
        typeof data.slug === "string" && data.slug.trim()
          ? data.slug.trim()
          : docItem.id.trim()
      const spaceId =
        typeof data.spaceId === "string" && data.spaceId.trim()
          ? data.spaceId.trim()
          : ""

      if (slug && spaceId) {
        firestoreAssignments[slug] = spaceId
      }
    })

    return {
      ...localAssignments,
      ...firestoreAssignments,
    }
  } catch (error) {
    console.warn(
      "[exhibitionSpaceAssignments] Failed to load Firestore assignments.",
      error
    )
    return localAssignments
  }
}

export async function saveExhibitionSpaceAssignment(
  slug: string,
  spaceId: string
): Promise<ExhibitionSpaceAssignmentSaveResult> {
  const normalizedSlug = slug.trim()
  const normalizedSpaceId = spaceId.trim()

  if (!normalizedSlug || !normalizedSpaceId) {
    console.warn(
      "[exhibitionSpaceAssignments] Refusing to save empty slug or spaceId."
    )
    return "failed"
  }

  const localAssignments = readLocalStorageAssignments()
  const localSaved = writeLocalStorageAssignments({
    ...localAssignments,
    [normalizedSlug]: normalizedSpaceId,
  })

  const db = await getDb()
  if (!db) {
    return localSaved ? "localStorage" : "failed"
  }

  const title =
    EXHIBITIONS.find((item) => item.slug === normalizedSlug)?.title ??
    normalizedSlug

  try {
    await setDoc(
      doc(db, "exhibitions", normalizedSlug),
      {
        slug: normalizedSlug,
        title,
        spaceId: normalizedSpaceId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return "firestore"
  } catch (error) {
    console.warn(
      "[exhibitionSpaceAssignments] Failed to save Firestore assignment.",
      error
    )
    return localSaved ? "localStorage" : "failed"
  }
}
