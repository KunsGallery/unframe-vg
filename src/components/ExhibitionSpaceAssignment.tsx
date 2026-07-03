"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { exhibitions as EXHIBITIONS, type Exhibition } from "@/data/exhibitions"
import { SPACE_TEMPLATES, type SpaceTemplate } from "@/data/spaceTemplates"

const STORAGE_KEY = "unframe-vg:exhibition-space-assignments"
const DEFAULT_SPACE_ID = "unframe-skylight-room-v1"

type SpaceAssignments = Record<string, string>

function isKnownSpaceId(spaceId: string) {
  return SPACE_TEMPLATES.some((template) => template.id === spaceId)
}

function getEffectiveSpaceId(
  exhibition: Exhibition,
  assignments: SpaceAssignments
) {
  const selectedSpaceId = assignments[exhibition.slug]
  const fallbackSpaceId = exhibition.spaceId ?? DEFAULT_SPACE_ID
  const candidate = selectedSpaceId ?? fallbackSpaceId ?? DEFAULT_SPACE_ID

  return isKnownSpaceId(candidate) ? candidate : DEFAULT_SPACE_ID
}

function readStoredAssignments(): SpaceAssignments {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    const next: SpaceAssignments = {}

    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof slug === "string" && typeof value === "string" && value.trim()) {
        const normalizedValue = value.trim()
        if (isKnownSpaceId(normalizedValue)) {
          next[slug] = normalizedValue
        }
      }
    }

    return next
  } catch {
    return {}
  }
}

export default function ExhibitionSpaceAssignment() {
  const exhibitions = useMemo(() => [...EXHIBITIONS], [])
  const [assignments, setAssignments] = useState<SpaceAssignments>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredAssignments()
    setAssignments(stored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
  }, [assignments, hydrated])

  function handleChange(slug: string, nextSpaceId: string) {
    setAssignments((current) => ({
      ...current,
      [slug]: nextSpaceId,
    }))
  }

  return (
    <div style={panelStyle}>
      <div style={introStyle}>
        <p style={noticeStyle}>
          This admin draft stores selection overrides in localStorage only.
          Published exhibition storage will be added in a later Firestore step.
        </p>
      </div>

      <div style={tableWrapStyle}>
        <div style={tableStyle}>
          <div style={headerRowStyle}>
            <div style={headerCellStyle}>Exhibition</div>
            <div style={headerCellStyle}>Slug</div>
            <div style={headerCellStyle}>Current spaceId</div>
            <div style={headerCellStyle}>Assign space</div>
            <div style={headerCellStyle}>Preview</div>
          </div>

          {exhibitions.map((exhibition) => {
            const selectedSpaceId = getEffectiveSpaceId(exhibition, assignments)
            const defaultSpaceId = exhibition.spaceId ?? DEFAULT_SPACE_ID
            const previewHref = `/exhibitions/${exhibition.slug}/gallery?spaceId=${selectedSpaceId}`

            return (
              <div key={exhibition.slug} style={rowStyle}>
                <div style={nameCellStyle}>
                  <strong style={titleStyle}>{exhibition.title}</strong>
                  <span style={subtitleStyle}>
                    {hydrated && assignments[exhibition.slug]
                      ? "Local override active"
                      : "Using exhibition default"}
                  </span>
                </div>

                <div style={slugCellStyle}>{exhibition.slug}</div>

                <div style={spaceCellStyle}>{defaultSpaceId}</div>

                <div style={selectCellStyle}>
                  <select
                    aria-label={`Assign space for ${exhibition.slug}`}
                    value={selectedSpaceId}
                    onChange={(event) =>
                      handleChange(exhibition.slug, event.target.value)
                    }
                    style={selectStyle}
                  >
                    {SPACE_TEMPLATES.map((template: SpaceTemplate) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
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
  gap: 8,
}

const noticeStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.6,
  color: "rgba(243,241,236,0.58)",
}

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
}

const tableStyle: React.CSSProperties = {
  minWidth: 920,
}

const headerRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(180px, 1.3fr) minmax(140px, 0.9fr) minmax(180px, 1fr) minmax(220px, 1.1fr) minmax(150px, auto)",
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
  gridTemplateColumns: "minmax(180px, 1.3fr) minmax(140px, 0.9fr) minmax(180px, 1fr) minmax(220px, 1.1fr) minmax(150px, auto)",
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
