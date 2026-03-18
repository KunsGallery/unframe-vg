"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ArtworkRenderer from "./ArtworkRenderer"

type FirestoreArtwork = {
  id: string
  title?: string
  artist?: string
  wallId: string
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
    (item.title === undefined || typeof item.title === "string") &&
    (item.artist === undefined || typeof item.artist === "string") &&
    (item.order === undefined || typeof item.order === "number")
  )
}

export default function FirestoreArtworkLayer() {
  const [artworks, setArtworks] = useState<FirestoreArtwork[]>([])

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("order", "asc"))

    const unsub = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs
        .map((docItem) => {
          const data = docItem.data()

          return {
            id: docItem.id,
            title: typeof data.title === "string" ? data.title : undefined,
            artist: typeof data.artist === "string" ? data.artist : undefined,
            wallId: data.wallId,
            imageUrl: data.imageUrl,
            width_cm: data.width_cm,
            height_cm: data.height_cm,
            order: typeof data.order === "number" ? data.order : undefined,
          }
        })
        .filter(isFirestoreArtwork)

      setArtworks(next)
    })

    return () => unsub()
  }, [])

  if (!artworks.length) return null

  return <ArtworkRenderer artworks={artworks} />
}