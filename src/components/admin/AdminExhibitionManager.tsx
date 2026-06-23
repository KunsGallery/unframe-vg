"use client"

type ExhibitionDoc = {
  id: string
  slug: string
  title: string
  artist: string
  period: string
  description: string
  summary?: string
  rightTitle?: string
  rightBody?: string
  layoutPreset?: string
  coverImage?: string
  isCurrent?: boolean
  isRecommended?: boolean
}

type Props = {
  exhibitions: ExhibitionDoc[]
  selectedExhibitionId: string
  onSelectExhibition: (id: string) => void
  onCreateExhibition: () => Promise<void>
  onUpdateExhibition: (
    id: string,
    payload: Partial<ExhibitionDoc>
  ) => Promise<void>
  onDeleteExhibition: (id: string) => Promise<void>
}

export default function AdminExhibitionManager({
  exhibitions,
  selectedExhibitionId,
  onSelectExhibition,
  onCreateExhibition,
  onUpdateExhibition,
  onDeleteExhibition,
}: Props) {
  const selected =
    exhibitions.find((item) => item.id === selectedExhibitionId) ?? exhibitions[0]

  if (!selected) {
    return (
      <section style={panelStyle}>
        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>Exhibitions</p>
            <h2 style={titleStyle}>전시 관리</h2>
          </div>

          <button type="button" onClick={() => void onCreateExhibition()} style={primaryButtonStyle}>
            새 전시 추가
          </button>
        </div>

        <div style={emptyStyle}>전시가 없습니다. 새 전시를 추가하세요.</div>
      </section>
    )
  }

  return (
    <section style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Exhibitions</p>
          <h2 style={titleStyle}>전시 관리</h2>
        </div>

        <div style={headerButtonRowStyle}>
          <button type="button" onClick={() => void onCreateExhibition()} style={secondaryButtonStyle}>
            새 전시 추가
          </button>
          <button
            type="button"
            onClick={() => void onDeleteExhibition(selected.id)}
            style={dangerButtonStyle}
          >
            현재 전시 삭제
          </button>
        </div>
      </div>

      <div style={layoutStyle}>
        <div style={listPaneStyle}>
          {exhibitions.map((item) => {
            const active = item.id === selectedExhibitionId

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectExhibition(item.id)}
                style={{
                  ...listItemStyle,
                  ...(active ? listItemActiveStyle : null),
                }}
              >
                <span style={listItemTitleStyle}>{item.title || "Untitled Exhibition"}</span>
                <span style={listItemMetaStyle}>{item.slug}</span>
              </button>
            )
          })}
        </div>

        <div style={formPaneStyle}>
          <div style={gridStyle}>
            <Field
              label="전시 제목"
              value={selected.title}
              onChange={(value) => void onUpdateExhibition(selected.id, { title: value })}
            />
            <Field
              label="슬러그"
              value={selected.slug}
              onChange={(value) => void onUpdateExhibition(selected.id, { slug: value })}
            />
            <Field
              label="작가명"
              value={selected.artist}
              onChange={(value) => void onUpdateExhibition(selected.id, { artist: value })}
            />
            <Field
              label="기간"
              value={selected.period}
              onChange={(value) => void onUpdateExhibition(selected.id, { period: value })}
            />
            <Field
              label="커버 이미지 URL"
              value={selected.coverImage ?? ""}
              onChange={(value) => void onUpdateExhibition(selected.id, { coverImage: value })}
            />
            <Field
              label="레이아웃 프리셋"
              value={selected.layoutPreset ?? "default"}
              onChange={(value) => void onUpdateExhibition(selected.id, { layoutPreset: value })}
            />
          </div>

          <TextAreaField
            label="설명"
            value={selected.description}
            onChange={(value) => void onUpdateExhibition(selected.id, { description: value })}
          />

          <TextAreaField
            label="요약"
            value={selected.summary ?? ""}
            onChange={(value) => void onUpdateExhibition(selected.id, { summary: value })}
          />

          <div style={gridStyle}>
            <Field
              label="Info Wall 우측 제목"
              value={selected.rightTitle ?? ""}
              onChange={(value) => void onUpdateExhibition(selected.id, { rightTitle: value })}
            />
          </div>

          <TextAreaField
            label="Info Wall 우측 본문"
            value={selected.rightBody ?? ""}
            onChange={(value) => void onUpdateExhibition(selected.id, { rightBody: value })}
          />

          <div style={toggleRowStyle}>
            <ToggleCard
              label="현재 전시"
              checked={!!selected.isCurrent}
              onChange={(checked) => void onUpdateExhibition(selected.id, { isCurrent: checked })}
            />
            <ToggleCard
              label="추천 전시"
              checked={!!selected.isRecommended}
              onChange={(checked) =>
                void onUpdateExhibition(selected.id, { isRecommended: checked })
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={textareaStyle}
      />
    </label>
  )
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label style={toggleCardStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

const panelStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(243,241,236,0.42)",
}

const titleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 28,
  lineHeight: 1.05,
  color: "#f3f1ec",
}

const headerButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
}

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 14,
  padding: "0 14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.08)",
  color: "#f3f1ec",
  cursor: "pointer",
}

const secondaryButtonStyle = primaryButtonStyle

const dangerButtonStyle: React.CSSProperties = {
  minHeight: 42,
  borderRadius: 14,
  padding: "0 14px",
  border: "1px solid rgba(255,120,120,0.2)",
  background: "rgba(255,80,80,0.12)",
  color: "#ffd9d9",
  cursor: "pointer",
}

const layoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0,1fr)",
  gap: 18,
}

const listPaneStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  alignContent: "start",
}

const listItemStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  textAlign: "left",
  padding: "14px 14px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f3f1ec",
  cursor: "pointer",
}

const listItemActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.16)",
}

const listItemTitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#f3f1ec",
}

const listItemMetaStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(243,241,236,0.46)",
}

const formPaneStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  borderRadius: 22,
  padding: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
}

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(243,241,236,0.56)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
  color: "#f3f1ec",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
  color: "#f3f1ec",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  resize: "vertical",
}

const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
}

const toggleCardStyle: React.CSSProperties = {
  minHeight: 54,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.045)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
}

const emptyStyle: React.CSSProperties = {
  minHeight: 180,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  placeItems: "center",
  color: "rgba(243,241,236,0.46)",
}