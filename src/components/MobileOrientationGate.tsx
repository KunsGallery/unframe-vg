"use client"

import { useEffect, useMemo, useState } from "react"

export default function MobileOrientationGate() {
  const [isPortrait, setIsPortrait] = useState(false)

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
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    updateOrientation()
    window.addEventListener("resize", updateOrientation)
    window.addEventListener("orientationchange", updateOrientation)

    return () => {
      window.removeEventListener("resize", updateOrientation)
      window.removeEventListener("orientationchange", updateOrientation)
    }
  }, [])

  if (!isTouchDevice || !isPortrait) return null

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={iconWrapStyle}>
          <div style={phoneStyle}>
            <div style={screenStyle} />
          </div>
          <div style={rotateArrowStyle}>↻</div>
        </div>

        <p style={eyebrowStyle}>Landscape Recommended</p>
        <h2 style={titleStyle}>가로 화면으로 돌려주세요</h2>
        <p style={descStyle}>
          이 버츄얼 갤러리는 가로 모드에서 가장 안정적으로 감상할 수 있도록
          설계되어 있습니다.
        </p>

        <div style={tipBoxStyle}>
          <span style={tipTitleStyle}>Tip</span>
          <span style={tipTextStyle}>
            iPhone Safari에서는 상단/하단 UI가 보일 수 있습니다. 더 깔끔하게 보려면
            홈 화면에 추가한 뒤 실행하는 방식을 추천합니다.
          </span>
        </div>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 999999,
  display: "grid",
  placeItems: "center",
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(41,52,74,0.36) 0%, rgba(7,10,15,0.88) 34%, rgba(4,6,10,0.96) 100%)",
  backdropFilter: "blur(16px)",
}

const cardStyle: React.CSSProperties = {
  width: "min(440px, 100%)",
  borderRadius: 28,
  padding: "28px 22px 22px",
  background:
    "linear-gradient(180deg, rgba(19,22,29,0.96) 0%, rgba(10,13,19,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.38)",
  color: "#f5f7fb",
  textAlign: "center",
}

const iconWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  marginBottom: 18,
}

const phoneStyle: React.CSSProperties = {
  width: 38,
  height: 66,
  borderRadius: 10,
  border: "2px solid rgba(255,255,255,0.78)",
  display: "grid",
  placeItems: "center",
  transform: "rotate(-90deg)",
  opacity: 0.95,
}

const screenStyle: React.CSSProperties = {
  width: 26,
  height: 48,
  borderRadius: 5,
  background: "rgba(255,255,255,0.18)",
}

const rotateArrowStyle: React.CSSProperties = {
  fontSize: 28,
  color: "#f2e5d0",
  transform: "translateY(-1px)",
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.46)",
}

const titleStyle: React.CSSProperties = {
  margin: "8px 0 10px",
  fontSize: 28,
  lineHeight: 1.08,
}

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.68)",
}

const tipBoxStyle: React.CSSProperties = {
  marginTop: 18,
  padding: "14px 14px 15px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "grid",
  gap: 6,
  textAlign: "left",
}

const tipTitleStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
}

const tipTextStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.7)",
}