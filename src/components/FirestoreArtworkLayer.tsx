"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { exhibitions } from "@/data/exhibitions"
import { getStaticExhibitionBySlug } from "@/lib/getExhibitionBySlug"
import ArtworkRenderer from "./ArtworkRenderer"

type FirestoreArtwork = {
  id: string
  title?: string
  artist?: string
  wallId: string
  exhibitionSlug?: string
  imageUrl: string
  width_cm: number
  height_cm: number
  order?: number
}

function isFirestoreArtwork(value: unknown): value is FirestoreArtwork {
  if (!value || typeof value !== "object") return false

  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.wallId === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.width_cm === "number" &&
    typeof item.height_cm === "number" &&
    (item.exhibitionSlug === undefined || typeof item.exhibitionSlug === "string") &&
    (item.title === undefined || typeof item.title === "string") &&
    (item.artist === undefined || typeof item.artist === "string") &&
    (item.order === undefined || typeof item.order === "number")
  )
}

export default function FirestoreArtworkLayer({
  exhibitionSlug,
}: {
  exhibitionSlug?: string
} = {}) {
  const params = useParams()
  const slug =
    exhibitionSlug ??
    (typeof params?.slug === "string" ? params.slug : undefined)
  const exhibition =
    (slug ? getStaticExhibitionBySlug(slug) : undefined) ?? exhibitions[0]

  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])

  useEffect(() => {
    const q = query(
      collection(db, "artworks"),
      where("exhibitionSlug", "==", exhibition.slug)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const next: FirestoreArtwork[] = snapshot.docs
        .map((docItem) => {
          const data = docItem.data()

          return {
            id: docItem.id,
            title: typeof data.title === "string" ? data.title : undefined,
            artist: typeof data.artist === "string" ? data.artist : undefined,
            wallId: data.wallId,
            exhibitionSlug:
              typeof data.exhibitionSlug === "string"
                ? data.exhibitionSlug
                : undefined,
            imageUrl: data.imageUrl,
            width_cm: data.width_cm,
            height_cm: data.height_cm,
            order: typeof data.order === "number" ? data.order : undefined,
          }
        })
        .filter(isFirestoreArtwork)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      setArtworks(next)
    })

    return () => unsub()
  }, [exhibition.slug])

  if (!artworks.length) return null

  return <ArtworkRenderer artworks={artworks} />
}
