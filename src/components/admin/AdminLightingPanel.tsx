"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  defaultLightingSettings,
  defaultSurfaceSettings,
} from "@/lib/defaultExhibitionSettings"
import { type ExhibitionLighting, type ExhibitionSurfaceSettings } from "@/data/exhibitions"

type LightingForm = ExhibitionLighting
type SurfaceForm = ExhibitionSurfaceSettings

const lightingFieldLabelMap: Partial<Record<keyof ExhibitionLighting, string>> = {
  rectIntensity: "작품 조명 밝기",
  rectTemperature: "작품 조명 색온도",
  rectWallOffset: "조명 벽 거리",
  rectHeightOffset: "조명 높이",
  rectWidthPadding: "좌우 여유",
  rectHeightPadding: "상하 여유",
  artworkBrightness: "작품 밝기",
  matteBrightness: "매트 밝기",
  frameBrightness: "액자 밝기",
  ambientIntensity: "기본 광량",
  hemisphereIntensity: "공간 보조광",
  directionalIntensity: "방향광",
  environmentIntensity: "환경광",
  toneMappingExposure: "전체 노출",
  vignetteOpacity: "비네팅",
  ambientColor: "기본광 색",
  backgroundColor: "배경색",
}

const surfaceFieldLabelMap: Partial<Record<keyof ExhibitionSurfaceSettings, string>> = {
  wallColor: "벽 색상",
  floorColor: "바닥 색상",
  roofColor: "천장 색상",
}

const heroLightingKeys: Array<
  | "rectIntensity"
  | "rectTemperature"
  | "rectWallOffset"
  | "rectHeightOffset"
  | "rectWidthPadding"
  | "rectHeightPadding"
  | "artworkBrightness"
  | "matteBrightness"
  | "frameBrightness"
  | "ambientIntensity"
  | "hemisphereIntensity"
  | "directionalIntensity"
  | "environmentIntensity"
  | "toneMappingExposure"
  | "vignetteOpacity"
> = [
  "rectIntensity",
  "rectTemperature",
  "rectWallOffset",
  "rectHeightOffset",
  "rectWidthPadding",
  "rectHeightPadding",
  "artworkBrightness",
  "matteBrightness",
  "frameBrightness",
  "ambientIntensity",
  "hemisphereIntensity",
  "directionalIntensity",
  "environmentIntensity",
  "toneMappingExposure",
  "vignetteOpacity",
]

const heroHelpText: Partial<Record<keyof ExhibitionLighting, string>> = {
  rectIntensity: "작품 조명 밝기",
  rectTemperature: "조명 색감, 3000K 전후 추천",
  rectWallOffset: "벽에서 조명 위치를 얼마나 띄울지",
  rectHeightOffset: "작품 중심보다 얼마나 위에서 비출지",
  rectWidthPadding: "작품 좌우 여유",
  rectHeightPadding: "작품 상하 여유",
  artworkBrightness: "작품 이미지 자체 밝기",
  matteBrightness: "매트 밝기",
  frameBrightness: "액자 기본 밝기",
  ambientIntensity: "공간 전체 기본 밝기",
  hemisphereIntensity: "천장/바닥 분위기 보조광",
  directionalIntensity: "전시장 전체 방향광",
  environmentIntensity: "환경광 반사량",
  toneMappingExposure: "전체 노출값",
  vignetteOpacity: "가장자리 눌러주는 정도",
}

const surfaceHeroKeys: Array<"wallColor" | "floorColor" | "roofColor"> = [
  "wallColor",
  "floorColor",
  "roofColor",
]

type AdminLightingPanelProps = {
  selectedSlug: string
  selectedTitle?: string
}

export default function AdminLightingPanel({
  selectedSlug,
  selectedTitle,
}: AdminLightingPanelProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("전시 설정을 불러오는 중...")
  const [lightingForm, setLightingForm] = useState<LightingForm>(
    defaultLightingSettings
  )
  const [surfaceForm, setSurfaceForm] = useState<SurfaceForm>(
    defaultSurfaceSettings
  )
  const [showMore, setShowMore] = useState(false)
  const activeSlug = selectedSlug

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      if (!activeSlug) return

      try {
        setLoading(true)
        setStatus("전시 설정을 불러오는 중...")

        const ref = doc(db, "exhibitionSettings", activeSlug)
        const snap = await getDoc(ref)

        if (cancelled) return

        if (snap.exists()) {
          const data = snap.data() as Partial<{
            lighting: Partial<ExhibitionLighting>
            surfaces: Partial<ExhibitionSurfaceSettings>
          }>

          setLightingForm({
            ...defaultLightingSettings,
            ...(data.lighting ?? {}),
          })

          setSurfaceForm({
            ...defaultSurfaceSettings,
            ...(data.surfaces ?? {}),
          })

          setStatus("저장된 전시 설정을 불러왔습니다.")
        } else {
          setLightingForm(defaultLightingSettings)
          setSurfaceForm(defaultSurfaceSettings)
          setStatus("기본 전시 설정을 불러왔습니다.")
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setLightingForm(defaultLightingSettings)
          setSurfaceForm(defaultSurfaceSettings)
          setStatus("설정 불러오기 중 오류가 발생했습니다.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSettings()

    return () => {
      cancelled = true
    }
  }, [activeSlug])

  function updateLightingNumber<K extends keyof LightingForm>(key: K, value: string) {
    const next = Number(value)
    setLightingForm((prev) => ({
      ...prev,
      [key]: Number.isFinite(next) ? next : 0,
    }))
  }

  async function handleSave() {
    if (!activeSlug) {
      setStatus("전시가 선택되지 않았습니다.")
      return
    }

    try {
      setLoading(true)
      setStatus("전시 설정 저장 중...")

      await setDoc(
        doc(db, "exhibitionSettings", activeSlug),
        {
          slug: activeSlug,
          lighting: lightingForm,
          surfaces: surfaceForm,
          updatedAt: Date.now(),
        },
        { merge: true }
      )

      setStatus("전시 설정을 저장했습니다.")
    } catch (error) {
      console.error(error)
      setStatus("전시 설정 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  function handleResetToDefault() {
    setLightingForm(defaultLightingSettings)
    setSurfaceForm(defaultSurfaceSettings)
    setStatus("기본 전시 설정으로 되돌렸습니다. 저장하면 반영됩니다.")
  }

  return (
    <section style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>Exhibition Lighting</p>
          <h2 style={titleStyle}>조명 / 공간 톤</h2>
          <p style={descStyle}>
            자주 만질 값만 먼저 보이게 정리했습니다.
          </p>
          <p style={selectedHintStyle}>
            현재 편집 중: {selectedTitle ?? activeSlug}
          </p>
        </div>

        <div style={statusBoxStyle}>{status}</div>
      </div>

      <div style={topRowStyle}>
        <div style={activeExhibitionCardStyle}>
          <span style={labelStyle}>편집 대상</span>
          <strong style={activeExhibitionValueStyle}>
            {selectedTitle ?? activeSlug}
          </strong>
        </div>

        <label style={toggleFieldStyle}>
          <span style={labelStyle}>사각 작품 조명</span>
          <input
            type="checkbox"
            checked={lightingForm.rectEnabled}
            onChange={(e) =>
              setLightingForm((prev) => ({
                ...prev,
                rectEnabled: e.target.checked,
              }))
            }
            disabled={loading}
          />
        </label>
      </div>

      <div style={heroGridStyle}>
        {heroLightingKeys.map((key) => (
          <label key={key} style={cardFieldStyle}>
            <span style={labelStyle}>{lightingFieldLabelMap[key] ?? key}</span>
            <input
              type="number"
              step="0.01"
              value={String(lightingForm[key])}
              onChange={(e) => updateLightingNumber(key, e.target.value)}
              style={inputStyle}
              disabled={loading}
            />
            <span style={helpTextStyle}>
              {heroHelpText[key] ?? ""}
            </span>
          </label>
        ))}

        <label style={cardFieldStyle}>
          <span style={labelStyle}>
            {lightingFieldLabelMap.ambientColor ?? "ambientColor"}
          </span>
          <input
            type="color"
            value={lightingForm.ambientColor}
            onChange={(e) =>
              setLightingForm((prev) => ({
                ...prev,
                ambientColor: e.target.value,
              }))
            }
            style={colorInputStyle}
            disabled={loading}
          />
        </label>

        <label style={cardFieldStyle}>
          <span style={labelStyle}>
            {lightingFieldLabelMap.backgroundColor ?? "backgroundColor"}
          </span>
          <input
            type="color"
            value={lightingForm.backgroundColor}
            onChange={(e) =>
              setLightingForm((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
                fogColor: e.target.value,
              }))
            }
            style={colorInputStyle}
            disabled={loading}
          />
        </label>

        {surfaceHeroKeys.map((key) => (
          <label key={key} style={cardFieldStyle}>
            <span style={labelStyle}>{surfaceFieldLabelMap[key] ?? key}</span>
            <input
              type="color"
              value={surfaceForm[key]}
              onChange={(e) =>
                setSurfaceForm((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              style={colorInputStyle}
              disabled={loading}
            />
          </label>
        ))}
      </div>

      <div style={buttonRowStyle}>
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          style={secondaryButtonStyle}
        >
          {showMore ? "고급값 접기" : "고급값 열기"}
        </button>

        <button
          type="button"
          onClick={handleResetToDefault}
          style={secondaryButtonStyle}
          disabled={loading}
        >
          기본값 불러오기
        </button>

        <button
          type="button"
          onClick={handleSave}
          style={primaryButtonStyle}
          disabled={loading}
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>

      {showMore ? (
        <div style={moreBoxStyle}>
          <p style={moreTitleStyle}>고급 색상</p>

          <div style={heroGridStyle}>
            <label style={cardFieldStyle}>
              <span style={labelStyle}>spotColor</span>
              <input
                type="color"
                value={lightingForm.spotColor}
                onChange={(e) =>
                  setLightingForm((prev) => ({
                    ...prev,
                    spotColor: e.target.value,
                  }))
                }
                style={colorInputStyle}
                disabled={loading}
              />
            </label>

            <label style={cardFieldStyle}>
              <span style={labelStyle}>hemisphereSkyColor</span>
              <input
                type="color"
                value={lightingForm.hemisphereSkyColor}
                onChange={(e) =>
                  setLightingForm((prev) => ({
                    ...prev,
                    hemisphereSkyColor: e.target.value,
                  }))
                }
                style={colorInputStyle}
                disabled={loading}
              />
            </label>

            <label style={cardFieldStyle}>
              <span style={labelStyle}>hemisphereGroundColor</span>
              <input
                type="color"
                value={lightingForm.hemisphereGroundColor}
                onChange={(e) =>
                  setLightingForm((prev) => ({
                    ...prev,
                    hemisphereGroundColor: e.target.value,
                  }))
                }
                style={colorInputStyle}
                disabled={loading}
              />
            </label>

            <label style={cardFieldStyle}>
              <span style={labelStyle}>directionalColor</span>
              <input
                type="color"
                value={lightingForm.directionalColor}
                onChange={(e) =>
                  setLightingForm((prev) => ({
                    ...prev,
                    directionalColor: e.target.value,
                  }))
                }
                style={colorInputStyle}
                disabled={loading}
              />
            </label>
          </div>
        </div>
      ) : null}
    </section>
  )
}

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  marginTop: 24,
}

const panelHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 16,
  alignItems: "start",
  marginBottom: 20,
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const titleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: 28,
  lineHeight: 1.05,
}

const descStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.66)",
  fontSize: 14,
  lineHeight: 1.6,
}

const selectedHintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "rgba(255,255,255,0.54)",
  fontSize: 12,
  lineHeight: 1.45,
}

const statusBoxStyle: React.CSSProperties = {
  minHeight: 56,
  borderRadius: 16,
  padding: "14px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.76)",
  fontSize: 13,
  lineHeight: 1.5,
}

const topRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(260px, 340px) 220px",
  gap: 16,
  alignItems: "end",
  marginBottom: 18,
}

const heroGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
}

const cardFieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
}

const toggleFieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  alignSelf: "end",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "10px 14px",
}

const activeExhibitionCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "10px 14px",
}

const activeExhibitionValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#f5f7fb",
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
}

const helpTextStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.45,
  color: "rgba(255,255,255,0.46)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
}

const colorInputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  padding: 6,
  cursor: "pointer",
}

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 20,
}

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 46,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #f5f1ea 0%, #ddd0bd 100%)",
  color: "#12161d",
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
}

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  padding: "0 16px",
  fontSize: 14,
  cursor: "pointer",
}

const moreBoxStyle: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,0.08)",
}

const moreTitleStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 16,
  color: "#f5f7fb",
}
