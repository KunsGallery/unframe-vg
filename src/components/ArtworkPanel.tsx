"use client"

import { useEffect, useMemo, useState } from "react"
import { useArtworkStore } from "@/store/useArtworkStore"

export default function ArtworkPanel() {
  const { selected, close } = useArtworkStore()
  const [isLandscape, setIsLandscape] = useState(true)

  const isTouchDevice = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    )
  }, [])

  useEffect(() => {
    function updateOrientation() {
      if (typeof window === "undefined") return
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    updateOrientation()
    window.addEventListener("resize", updateOrientation)
    window.addEventListener("orientationchange", updateOrientation)

    return () => {
      window.removeEventListener("resize", updateOrientation)
      window.removeEventListener("orientationchange", updateOrientation)
    }
  }, [])

  useEffect(() => {
    if (!selected) return

    if (document.pointerLockElement) {
      document.exitPointerLock?.()
    }

    document.body.style.cursor = "default"

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }

    window.addEventListener("keydown", handleKeydown)
    return () => {
      window.removeEventListener("keydown", handleKeydown)
      document.body.style.cursor = "default"
    }
  }, [selected, close])

  if (!selected) return null

  const useMobilePanel = isTouchDevice && isLandscape

  if (useMobilePanel) {
    return (
      <div
        style={mobileOverlayStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={close}
      >
        <aside
          style={mobilePanelStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={mobilePanelHeaderStyle}>
            <div style={{ minWidth: 0 }}>
              <p style={mobileEyebrowStyle}>Artwork</p>
              <h2 style={mobileTitleStyle}>{selected.title || "Untitled"}</h2>
              <p style={mobileArtistStyle}>{selected.artist || "Unknown Artist"}</p>
            </div>

            <button type="button" onClick={close} style={mobileCloseButtonStyle}>
              ✕
            </button>
          </div>

          <div style={mobileImageWrapStyle}>
            <img
              src={selected.imageUrl}
              alt={selected.title || "artwork"}
              style={mobileImageStyle}
            />
          </div>

          <div style={mobileInfoListStyle}>
            <InfoRow
              label="Size"
              value={`${Math.round(selected.width_cm)} × ${Math.round(
                selected.height_cm
              )} cm`}
            />
            <InfoRow label="Medium" value="Digital image preview" />
            <InfoRow label="Context" value="Installed in virtual gallery" />
          </div>

          <p style={mobileBodyTextStyle}>
            작품 정보를 모바일 가로 관람에 맞게 간결하게 정리했습니다. 이후 단계에서는
            작가 노트, 가격, 문의 연결까지 자연스럽게 확장할 수 있습니다.
          </p>

          <div style={mobileButtonRowStyle}>
            <button type="button" onClick={close} style={mobileSecondaryButtonStyle}>
              닫기
            </button>
            <button type="button" style={mobilePrimaryButtonStyle}>
              문의 연결 예정
            </button>
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div
      style={overlayStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={close}
    >
      <div
        style={panelWrapStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={close} style={closeButtonStyle}>
          ✕
        </button>

        <div style={imageAreaStyle}>
          <img
            src={selected.imageUrl}
            alt={selected.title || "artwork"}
            style={imageStyle}
          />
        </div>

        <div style={metaAreaStyle}>
          <p style={eyebrowStyle}>Artwork Details</p>
          <h2 style={titleStyle}>{selected.title || "Untitled"}</h2>
          <p style={artistStyle}>{selected.artist || "Unknown Artist"}</p>

          <div style={dividerStyle} />

          <div style={specGridStyle}>
            <SpecItem
              label="Size"
              value={`${Math.round(selected.width_cm)} × ${Math.round(
                selected.height_cm
              )} cm`}
            />
            <SpecItem label="Medium" value="Digital image preview" />
            <SpecItem label="Context" value="Installed in virtual gallery" />
          </div>

          <p style={bodyTextStyle}>
            작품 이미지를 클릭해 감상하던 흐름을 해치지 않도록, 정보는 절제된 패널 안에서
            정리되도록 구성했습니다. 이후 단계에서는 작가 노트, 가격, 문의 버튼까지 자연스럽게
            연결할 수 있습니다.
          </p>

          <div style={buttonRowStyle}>
            <button type="button" onClick={close} style={secondaryButtonStyle}>
              닫기
            </button>
            <button type="button" style={primaryButtonStyle}>
              문의 연결 예정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={specCardStyle}>
      <span style={specLabelStyle}>{label}</span>
      <strong style={specValueStyle}>{value}</strong>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={mobileInfoRowStyle}>
      <span style={mobileInfoLabelStyle}>{label}</span>
      <span style={mobileInfoValueStyle}>{value}</span>
    </div>
  )
}

const mobileOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(4,6,10,0.24)",
  backdropFilter: "blur(3px)",
}

const mobilePanelStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "min(370px, 52vw)",
  height: "100dvh",
  background:
    "linear-gradient(180deg, rgba(17,20,26,0.98) 0%, rgba(10,12,17,0.98) 100%)",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "-16px 0 44px rgba(0,0,0,0.24)",
  display: "grid",
  alignContent: "start",
  gap: 10,
  padding: "14px 12px 14px",
  overflowY: "auto",
}

const mobilePanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "start",
}

const mobileEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
}

const mobileTitleStyle: React.CSSProperties = {
  margin: "5px 0 3px",
  fontSize: 20,
  lineHeight: 1.04,
  color: "#f7f3ed",
  wordBreak: "break-word",
}

const mobileArtistStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "rgba(255,255,255,0.7)",
}

const mobileCloseButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5f7fb",
  fontSize: 15,
  cursor: "pointer",
  flexShrink: 0,
}

const mobileImageWrapStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  overflow: "hidden",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 8,
}

const mobileImageStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: "28dvh",
  objectFit: "contain",
  display: "block",
  borderRadius: 12,
}

const mobileInfoListStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
}

const mobileInfoRowStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "10px 10px 11px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  minHeight: 72,
}

const mobileInfoLabelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
}

const mobileInfoValueStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.4,
  color: "#f7f3ed",
  wordBreak: "break-word",
}

const mobileBodyTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.65,
  color: "rgba(255,255,255,0.62)",
}

const mobileButtonRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 2,
}

const mobileSecondaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  fontSize: 13,
  cursor: "pointer",
}

const mobilePrimaryButtonStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #f5f1ea 0%, #ddd0bd 100%)",
  color: "#12161d",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(5,8,12,0.62)",
  backdropFilter: "blur(16px)",
  display: "grid",
  placeItems: "center",
  padding: 24,
  cursor: "default",
}

const panelWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "min(1120px, 100%)",
  minHeight: "min(720px, calc(100vh - 48px))",
  display: "grid",
  gridTemplateColumns: "1.08fr 0.92fr",
  background:
    "linear-gradient(180deg, rgba(18,20,26,0.98) 0%, rgba(11,14,19,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 30,
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
}

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 18,
  right: 18,
  width: 42,
  height: 42,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5f7fb",
  fontSize: 16,
  cursor: "pointer",
  zIndex: 2,
}

const imageAreaStyle: React.CSSProperties = {
  minHeight: 0,
  background:
    "radial-gradient(circle at top, rgba(255,248,236,0.08) 0%, rgba(255,248,236,0.02) 24%, rgba(0,0,0,0) 52%), #11151c",
  display: "grid",
  placeItems: "center",
  padding: 32,
}

const imageStyle: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "calc(100vh - 140px)",
  objectFit: "contain",
  display: "block",
  borderRadius: 18,
  boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
}

const metaAreaStyle: React.CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: 16,
  padding: "40px 34px 34px",
  background:
    "linear-gradient(180deg, rgba(16,18,24,0.92) 0%, rgba(10,12,17,0.96) 100%)",
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.44)",
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.06,
  color: "#f7f3ed",
}

const artistStyle: React.CSSProperties = {
  margin: "-6px 0 0",
  fontSize: 18,
  color: "rgba(255,255,255,0.72)",
}

const dividerStyle: React.CSSProperties = {
  width: "100%",
  height: 1,
  background: "rgba(255,255,255,0.08)",
  margin: "4px 0 2px",
}

const specGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
}

const specCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  minHeight: 88,
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
}

const specLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
}

const specValueStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.45,
  color: "#f7f3ed",
}

const bodyTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.62)",
}

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 8,
}

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 48,
  padding: "0 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  cursor: "pointer",
  fontSize: 14,
}

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 48,
  padding: "0 18px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #f5f1ea 0%, #ddd0bd 100%)",
  color: "#12161d",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
}