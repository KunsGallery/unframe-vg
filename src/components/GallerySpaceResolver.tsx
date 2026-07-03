"use client"

import { useEffect, useState } from "react"
import GalleryScene from "@/components/GalleryScene"
import {
  getExhibitionPresentationAssignments,
  type ExhibitionPresentationAssignmentMap,
} from "@/lib/exhibitionSpaceAssignments"
import type { Exhibition } from "@/data/exhibitions"
import { DEFAULT_WALL_COLOR_PRESET_ID } from "@/data/wallColorPresets"

const DEFAULT_SPACE_ID = "unframe-skylight-room-v1"

type Props = {
  slug: string
  exhibition: Exhibition
  querySpaceId?: string
  queryWallColorPresetId?: string
  fallbackSpaceId: string
  fallbackWallColorPresetId: string
}

function normalizeValue(value?: string) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function resolveAssignment(
  slug: string,
  assignments: ExhibitionPresentationAssignmentMap
) {
  return assignments[slug]
}

export default function GallerySpaceResolver({
  slug,
  exhibition,
  querySpaceId,
  queryWallColorPresetId,
  fallbackSpaceId,
  fallbackWallColorPresetId,
}: Props) {
  const normalizedQuerySpaceId = normalizeValue(querySpaceId)
  const normalizedQueryWallColorPresetId = normalizeValue(queryWallColorPresetId)
  const normalizedFallbackSpaceId =
    normalizeValue(fallbackSpaceId) ?? DEFAULT_SPACE_ID
  const normalizedFallbackWallColorPresetId =
    normalizeValue(fallbackWallColorPresetId) ??
    DEFAULT_WALL_COLOR_PRESET_ID

  const [resolvedSpaceId, setResolvedSpaceId] = useState(
    normalizedQuerySpaceId ?? normalizedFallbackSpaceId
  )
  const [resolvedWallColorPresetId, setResolvedWallColorPresetId] = useState(
    normalizedQueryWallColorPresetId ?? normalizedFallbackWallColorPresetId
  )

  useEffect(() => {
    setResolvedSpaceId(normalizedQuerySpaceId ?? normalizedFallbackSpaceId)
    setResolvedWallColorPresetId(
      normalizedQueryWallColorPresetId ?? normalizedFallbackWallColorPresetId
    )
  }, [
    normalizedQuerySpaceId,
    normalizedQueryWallColorPresetId,
    normalizedFallbackSpaceId,
    normalizedFallbackWallColorPresetId,
    slug,
  ])

  useEffect(() => {
    if (normalizedQuerySpaceId && normalizedQueryWallColorPresetId) return

    let active = true

    async function loadAssignments() {
      try {
        const assignments = await getExhibitionPresentationAssignments()
        if (!active) return

        const savedAssignment = resolveAssignment(slug, assignments)

        if (!normalizedQuerySpaceId && savedAssignment?.spaceId) {
          setResolvedSpaceId(savedAssignment.spaceId)
        }

        if (!normalizedQueryWallColorPresetId && savedAssignment?.wallColorPresetId) {
          setResolvedWallColorPresetId(savedAssignment.wallColorPresetId)
        }
      } catch (error) {
        console.warn(
          "[GallerySpaceResolver] Failed to resolve saved exhibition presentation assignment.",
          error
        )
      }
    }

    void loadAssignments()

    return () => {
      active = false
    }
  }, [slug, normalizedQuerySpaceId, normalizedQueryWallColorPresetId])

  return (
    <GalleryScene
      exhibitionSlug={slug}
      exhibition={exhibition}
      spaceId={resolvedSpaceId}
      wallColorPresetId={resolvedWallColorPresetId}
    />
  )
}
