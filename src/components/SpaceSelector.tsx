"use client"

import Link from "next/link"
import { SPACE_TEMPLATES, type SpaceTemplate } from "@/data/spaceTemplates"

function formatCount(value: number | undefined) {
  return typeof value === "number" ? String(value) : "—"
}

function TemplateCard({ template }: { template: SpaceTemplate }) {
  const href = `/exhibitions/demo/gallery?spaceId=${template.id}`

  return (
    <article style={cardStyle}>
      <div style={cardTopStyle}>
        <div style={titleBlockStyle}>
          <p style={nameStyle}>{template.name}</p>
          <p style={descriptionStyle}>{template.description ?? "No description available."}</p>
        </div>

        <Link href={href} style={previewLinkStyle}>
          Preview Space
        </Link>
      </div>

      <dl style={metaGridStyle}>
        <div style={metaItemStyle}>
          <dt style={metaLabelStyle}>Max Artworks</dt>
          <dd style={metaValueStyle}>{formatCount(template.maxArtworks)}</dd>
        </div>
        <div style={metaItemStyle}>
          <dt style={metaLabelStyle}>Lighting Presets</dt>
          <dd style={pillWrapStyle}>
            {template.lightingPresets.map((preset) => (
              <span key={preset} style={pillStyle}>
                {preset}
              </span>
            ))}
          </dd>
        </div>
        <div style={metaItemStyle}>
          <dt style={metaLabelStyle}>Wall Color Presets</dt>
          <dd style={pillWrapStyle}>
            {template.wallColorPresets.map((preset) => (
              <span key={preset} style={pillStyle}>
                {preset}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default function SpaceSelector() {
  return (
    <div style={gridStyle}>
      {SPACE_TEMPLATES.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
}

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  padding: 18,
}

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
}

const titleBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  minWidth: 0,
}

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.1,
}

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(243,241,236,0.62)",
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

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  margin: 0,
}

const metaItemStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const metaLabelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.46)",
}

const metaValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#f3f1ec",
}

const pillWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "0 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: 12,
  color: "rgba(243,241,236,0.82)",
}
