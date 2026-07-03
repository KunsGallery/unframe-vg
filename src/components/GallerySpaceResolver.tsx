"use client"

import { useEffect, useState } from "react"
import GalleryScene from "@/components/GalleryScene"
import {
  getExhibitionSpaceAssignments,
  type ExhibitionSpaceAssignmentMap,
} from "@/lib/exhibitionSpaceAssignments"
import type { Exhibition } from "@/data/exhibitions"

const DEFAULT_SPACE_ID = "unframe-skylight-room-v1"

type Props = {
  slug: string
  exhibition: Exhibition
  querySpaceId?: string
  fallbackSpaceId: string
}

function normalizeSpaceId(spaceId?: string) {
  const trimmed = spaceId?.trim()
  return trimmed || undefined
}

function resolveAssignedSpaceId(
  slug: string,
  assignments: ExhibitionSpaceAssignmentMap
) {
  const assignedSpaceId = assignments[slug]?.trim()
  return assignedSpaceId || undefined
}

export default function GallerySpaceResolver({
  slug,
  exhibition,
  querySpaceId,
  fallbackSpaceId,
}: Props) {
  const normalizedQuerySpaceId = normalizeSpaceId(querySpaceId)
  const normalizedFallbackSpaceId =
    normalizeSpaceId(fallbackSpaceId) ?? DEFAULT_SPACE_ID

  const [resolvedSpaceId, setResolvedSpaceId] = useState(
    normalizedQuerySpaceId ?? normalizedFallbackSpaceId
  )

  useEffect(() => {
    setResolvedSpaceId(normalizedQuerySpaceId ?? normalizedFallbackSpaceId)
  }, [normalizedQuerySpaceId, normalizedFallbackSpaceId, slug])

  useEffect(() => {
    if (normalizedQuerySpaceId) return

    let active = true

    async function loadAssignments() {
      try {
        const assignments = await getExhibitionSpaceAssignments()
        if (!active) return

        const savedSpaceId = resolveAssignedSpaceId(slug, assignments)
        if (savedSpaceId) {
          setResolvedSpaceId(savedSpaceId)
        }
      } catch (error) {
        console.warn(
          "[GallerySpaceResolver] Failed to resolve saved exhibition space assignment.",
          error
        )
      }
    }

    void loadAssignments()

    return () => {
      active = false
    }
  }, [slug, normalizedQuerySpaceId])

  return (
    <GalleryScene
      exhibitionSlug={slug}
      exhibition={exhibition}
      spaceId={resolvedSpaceId}
    />
  )
}
