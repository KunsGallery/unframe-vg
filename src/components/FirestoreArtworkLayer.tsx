"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
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
}

export default function FirestoreArtworkLayer() {

  const [artworks, setArtworks] = useState<ArtworkDoc[]>([])

  useEffect(() => {

    const q = query(
      collection(db, "artworks"),
      orderBy("order", "asc")
    )

    const unsub = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArtworkDoc[]

      setArtworks(data)

    })

    return () => unsub()

  }, [])

  return (
    <ArtworkRenderer
      artworks={artworks}
      spacing_cm={80}
      centerLine_cm={150}
    />
  )
}