"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ArtworkRenderer from "./ArtworkRenderer"

type ArtworkDoc = {
  id: string
  title?: string
  artist?: string
  wallId: string
  width_cm: number
  height_cm: number
  order?: number
  imageUrl: string
  createdAt?: unknown
}

export default function FirestoreArtworkLayer() {
  const [artworks, setArtworks] = useState<ArtworkDoc[]>([])

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("order", "asc"))

    const unsub = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item): item is ArtworkDoc => {
          return Boolean(
            item &&
              typeof item.wallId === "string" &&
              typeof item.imageUrl === "string" &&
              typeof item.width_cm === "number" &&
              typeof item.height_cm === "number"
          )
        })

      setArtworks(next)
    })

    return () => unsub()
  }, [])

  if (!artworks.length) return null

  return (
    <ArtworkRenderer
      artworks={artworks}
      spacing_cm={90}
      centerLine_cm={150}
    />
  )
}
