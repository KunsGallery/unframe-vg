"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { exhibitions as EXHIBITIONS, type Exhibition } from "@/data/exhibitions"
import { SPACE_TEMPLATES } from "@/data/spaceTemplates"
import {
  DEFAULT_WALL_COLOR_PRESET_ID,
  WALL_COLOR_PRESETS,
  getWallColorPresetById,
} from "@/data/wallColorPresets"
import {
  getExhibitionPresentationAssignments,
  saveExhibitionPresentationAssignment,
  type ExhibitionPresentationAssignmentMap,
  type ExhibitionSpaceAssignmentSaveResult,
} from "@/lib/exhibitionSpaceAssignments"

const DEFAULT_SPACE_ID = "unframe-skylight-room-v1"

type RowStatus = {
  state: "idle" | "saving" | "saved" | "error"
  message?: string
}

function getAllowedWallColorPresets(spaceId: string) {
  const template = SPACE_TEMPLATES.find((item) => item.id === spaceId)
  const allowedIds = template?.wallColorPresets?.length
    ? template.wallColorPresets
    : WALL_COLOR_PRESETS.map((preset) => preset.id)

  const next = WALL_COLOR_PRESETS.filter((preset) => allowedIds.includes(preset.id))
  return next.length > 0 ? next : WALL_COLOR_PRESETS
}

function isKnownSpaceId(spaceId?: string) {
  return SPACE_TEMPLATES.some((template) => template.id === spaceId)
}

function getEffectiveAssignment(
  exhibition: Exhibition,
  assignments: ExhibitionPresentationAssignmentMap
) {
  const storedAssignment = assignments[exhibition.slug]
  const candidateSpaceId =
    storedAssignment?.spaceId ?? exhibition.spaceId ?? DEFAULT_SPACE_ID
  const selectedSpaceId = isKnownSpaceId(candidateSpaceId)
    ? candidateSpaceId
    : DEFAULT_SPACE_ID
  const allowedWallColorPresets = getAllowedWallColorPresets(selectedSpaceId)

  const candidateWallColorPresetId =
    storedAssignment?.wallColorPresetId ??
    exhibition.wallColorPresetId ??
    DEFAULT_WALL_COLOR_PRESET_ID

  const resolvedWallColorPresetId = allowedWallColorPresets.some(
    (preset) => preset.id === candidateWallColorPresetId
  )
    ? candidateWallColorPresetId
    : allowedWallColorPresets[0]?.id ?? DEFAULT_WALL_COLOR_PRESET_ID

  return {
    selectedSpaceId,
    selectedWallColorPresetId: resolvedWallColorPresetId,
    allowedWallColorPresets,
    storedAssignment,
  }
}

function getStatusLabel(state: RowStatus["state"], message?: string) {
  if (state === "saving") return "Saving..."
  if (state === "saved") return message ?? "Saved"
  if (state === "error") return message ?? "Save failed"
  return message ?? ""
}

function getSaveMessage(result: ExhibitionSpaceAssignmentSaveResult) {
  if (result === "firestore") return "Saved to Firestore"
  if (result === "localStorage") return "Saved locally"
  return "Save failed"
}

function buildPreviewHref(
  slug: string,
  spaceId: string,
  wallColorPresetId: string
) {
  const params = new URLSearchParams({
    spaceId,
    wallColor: wallColorPresetId,
  })

  return `/exhibitions/${slug}/gallery?${params.toString()}`
}

export default function ExhibitionSpaceAssignment() {
  const [assignments, setAssignments] = useState<ExhibitionPresentationAssignmentMap>(
    {}
  )
  const [rowStatuses, setRowStatuses] = useState<Record<string, RowStatus>>({})
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const saveTokensRef = useRef<Record<string, number>>({})

  useEffect(() => {
    let mounted = true

    async function loadAssignments() {
      setIsLoadingAssignments(true)

      try {
        const nextAssignments = await getExhibitionPresentationAssignments()
        if (!mounted) return
        setAssignments(nextAssignments)
      } catch (error) {
        console.warn(
          "[ExhibitionSpaceAssignment] Failed to load assignments.",
          error
        )
      } finally {
        if (mounted) {
          setIsLoadingAssignments(false)
        }
      }
    }

    void loadAssignments()

    return () => {
      mounted = false
    }
  }, [])

  async function persistAssignment(
    slug: string,
    nextAssignment: {
      spaceId: string
      wallColorPresetId: string
    }
  ) {
    const token = (saveTokensRef.current[slug] ?? 0) + 1
    saveTokensRef.current[slug] = token

    setAssignments((current) => ({
      ...current,
      [slug]: nextAssignment,
    }))
    setRowStatuses((current) => ({
      ...current,
      [slug]: { state: "saving" },
    }))

    const result = await saveExhibitionPresentationAssignment(slug, nextAssignment)
    if (saveTokensRef.current[slug] !== token) return

    if (result === "failed") {
      setRowStatuses((current) => ({
        ...current,
        [slug]: {
          state: "error",
          message: "Save failed. Draft fallback may be unavailable.",
        },
      }))
      return
    }

    setRowStatuses((current) => ({
      ...current,
      [slug]: {
        state: "saved",
        message: getSaveMessage(result),
      },
    }))
  }

  function handleSpaceChange(exhibition: Exhibition, nextSpaceId: string) {
    const current = getEffectiveAssignment(exhibition, assignments)
    const nextAllowedWallColors = getAllowedWallColorPresets(nextSpaceId)
    const nextWallColorPresetId = nextAllowedWallColors.some(
      (preset) => preset.id === current.selectedWallColorPresetId
    )
      ? current.selectedWallColorPresetId
      : nextAllowedWallColors[0]?.id ?? DEFAULT_WALL_COLOR_PRESET_ID

    void persistAssignment(exhibition.slug, {
      spaceId: nextSpaceId,
      wallColorPresetId: nextWallColorPresetId,
    })
  }

  function handleWallColorChange(exhibition: Exhibition, nextWallColorPresetId: string) {
    const current = getEffectiveAssignment(exhibition, assignments)

    void persistAssignment(exhibition.slug, {
      spaceId: current.selectedSpaceId,
      wallColorPresetId: nextWallColorPresetId,
    })
  }

  return (
    <div style={panelStyle}>
      <div style={introStyle}>
        <p style={noticeStyle}>
          Space and wall color choices are saved for this admin draft. Firestore
          sync is used when available, with local fallback.
        </p>
        <p style={subNoticeStyle}>
          {isLoadingAssignments
            ? "Loading saved assignments..."
            : "Saved assignments loaded."}
        </p>
      </div>

      <div style={tableWrapStyle}>
        <div style={tableStyle}>
          <div style={headerRowStyle}>
            <div style={headerCellStyle}>Exhibition</div>
            <div style={headerCellStyle}>Slug</div>
            <div style={headerCellStyle}>Current spaceId</div>
            <div style={headerCellStyle}>Assign space</div>
            <div style={headerCellStyle}>Wall color</div>
            <div style={headerCellStyle}>Preview</div>
          </div>

          {EXHIBITIONS.map((exhibition) => {
            const current = getEffectiveAssignment(exhibition, assignments)
            const currentWallColor = getWallColorPresetById(
              current.selectedWallColorPresetId
            )
            const previewHref = buildPreviewHref(
              exhibition.slug,
              current.selectedSpaceId,
              current.selectedWallColorPresetId
            )
            const rowStatus = rowStatuses[exhibition.slug]
            const statusText = getStatusLabel(
              rowStatus?.state ?? "idle",
              rowStatus?.message
            )

            return (
              <div key={exhibition.slug} style={rowStyle}>
                <div style={nameCellStyle}>
                  <strong style={titleStyle}>{exhibition.title}</strong>
                  <span style={subtitleStyle}>
                    {statusText || "Using exhibition default"}
                  </span>
                </div>

                <div style={slugCellStyle}>{exhibition.slug}</div>

                <div style={spaceCellStyle}>{current.selectedSpaceId}</div>

                <div style={selectCellStyle}>
                  <select
                    aria-label={`Assign space for ${exhibition.slug}`}
                    value={current.selectedSpaceId}
                    onChange={(event) => handleSpaceChange(exhibition, event.target.value)}
                    style={selectStyle}
                  >
                    {SPACE_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={wallCellStyle}>
                  <div style={wallSwatchRowStyle}>
                    <span
                      aria-hidden="true"
                      style={{
                        ...wallSwatchStyle,
                        backgroundColor: currentWallColor.hex,
                      }}
                    />
                    <div style={wallLabelStackStyle}>
                      <span style={wallPresetLabelStyle}>
                        {currentWallColor.label}
                      </span>
                      <span style={wallPresetDescStyle}>
                        {currentWallColor.description ?? "Selected wall color preset."}
                      </span>
                    </div>
                  </div>

                  <select
                    aria-label={`Assign wall color for ${exhibition.slug}`}
                    value={current.selectedWallColorPresetId}
                    onChange={(event) =>
                      handleWallColorChange(exhibition, event.target.value)
                    }
                    style={selectStyle}
                  >
                    {current.allowedWallColorPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={previewCellStyle}>
                  <Link href={previewHref} style={previewLinkStyle}>
                    Preview Gallery
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
}

const introStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
}

const noticeStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.6,
  color: "rgba(243,241,236,0.58)",
}

const subNoticeStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(243,241,236,0.42)",
}

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}

const tableStyle: React.CSSProperties = {
  minWidth: 1180,
}

const headerRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(180px, 1.3fr) minmax(140px, 0.9fr) minmax(180px, 1fr) minmax(220px, 1.1fr) minmax(240px, 1.2fr) minmax(150px, auto)",
  gap: 12,
  padding: "14px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}

const headerCellStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.48)",
}

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(180px, 1.3fr) minmax(140px, 0.9fr) minmax(180px, 1fr) minmax(220px, 1.1fr) minmax(240px, 1.2fr) minmax(150px, auto)",
  gap: 12,
  alignItems: "center",
  padding: "16px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
}

const nameCellStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
}

const titleStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.35,
  color: "#f3f1ec",
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.52)",
}

const slugCellStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(243,241,236,0.8)",
  wordBreak: "break-word",
}

const spaceCellStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(243,241,236,0.82)",
  wordBreak: "break-word",
}

const selectCellStyle: React.CSSProperties = {
  minWidth: 0,
}

const wallCellStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  minWidth: 0,
}

const wallSwatchRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
}

const wallSwatchStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: 14,
  height: 14,
  marginTop: 3,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 0 0 1px rgba(0,0,0,0.18) inset",
}

const wallLabelStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
}

const wallPresetLabelStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.35,
  color: "#f3f1ec",
}

const wallPresetDescStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.4,
  color: "rgba(243,241,236,0.5)",
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#f3f1ec",
  padding: "0 12px",
  fontSize: 13,
  outline: "none",
}

const previewCellStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
}

const previewLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 999,
  background: "#f3f1ec",
  color: "#121316",
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
}
