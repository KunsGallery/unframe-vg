"use client"

import * as THREE from "three"
import { Text, Html } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import {
  exhibitions,
  getInfoWallLayoutByPreset,
  type InfoWallLink,
} from "@/data/exhibitions"
import { getExhibitionBySlug } from "@/lib/getExhibitionBySlug"
import { galleryWalls } from "@/data/galleryWalls"

/* =========================
   여기만 미세조정하면 됨
========================= */

const PANEL_OFFSET_X = 0.33
const MAIN_PANEL_CENTER_Y = 1.78
const PANEL_GAP_Y = 0.16
const WALL_FRONT_OFFSET = 0.03
const PANEL_ROT_Y_OFFSET = 0

/* ========================= */

const PANEL_SURFACE_Z = 0.0
const PANEL_INNER_Z = 0.004
const BUTTON_Z = 0.02

const MAIN_PANEL_WIDTH = 2.95
const MAIN_PANEL_HEIGHT = 2.12
const LINK_PANEL_WIDTH = 2.95
const LINK_PANEL_HEIGHT = 0.42

export default function InfoWallUI() {
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : undefined

  const exhibition =
    (slug ? getExhibitionBySlug(slug) : undefined) ?? exhibitions[0]

  const infoWall = galleryWalls.find((wall) => wall.id === "info_wall")

  const [pendingLink, setPendingLink] = useState<InfoWallLink | null>(null)
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef<HTMLElement>(null!)

  useEffect(() => {
    portalRef.current = document.body
    setMounted(true)
  }, [])

  const wallLayout = useMemo(() => {
    if (!infoWall) return null

    const reservedGap = infoWall.reservedCenterGap ?? 2.5
    const frontOffset = infoWall.thickness / 2 + WALL_FRONT_OFFSET

    const wallFrontZ = infoWall.position[2] - frontOffset
    const doorRightEdgeX = reservedGap / 2

    const mainCenterX = doorRightEdgeX + MAIN_PANEL_WIDTH / 2 + PANEL_OFFSET_X
    const mainCenterY = MAIN_PANEL_CENTER_Y
    const linkCenterY =
      mainCenterY - MAIN_PANEL_HEIGHT / 2 - PANEL_GAP_Y - LINK_PANEL_HEIGHT / 2

    return {
      mainCenterX,
      mainCenterY,
      linkCenterY,
      wallFrontZ,
      rotationY: Math.PI + PANEL_ROT_Y_OFFSET,
    }
  }, [infoWall])

  if (!exhibition || !infoWall || !wallLayout) return null

  const content = exhibition
  const layoutData = getInfoWallLayoutByPreset(exhibition.layoutPreset)

  return (
    <>
      <group
        position={[
          wallLayout.mainCenterX,
          wallLayout.mainCenterY,
          wallLayout.wallFrontZ,
        ]}
        rotation={[0, wallLayout.rotationY, 0]}
      >
        <MainInfoPanel content={content} L={layoutData} />
      </group>

      <group
        position={[
          wallLayout.mainCenterX,
          wallLayout.linkCenterY,
          wallLayout.wallFrontZ,
        ]}
        rotation={[0, wallLayout.rotationY, 0]}
      >
        <LinkStripPanel
          content={content}
          L={layoutData.links}
          onOpenLink={setPendingLink}
        />
      </group>

      {mounted && pendingLink && portalRef.current ? (
        <Html fullscreen portal={portalRef}>
          <div style={overlayStyle} onClick={() => setPendingLink(null)}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <p style={modalEyebrowStyle}>Open external link</p>
              <h3 style={modalTitleStyle}>{pendingLink.label}</h3>
              <p style={modalBodyStyle}>
                외부 페이지로 이동할까요?
                <br />
                {pendingLink.url}
              </p>

              <div style={modalButtonRowStyle}>
                <button
                  type="button"
                  onClick={() => setPendingLink(null)}
                  style={secondaryButtonStyle}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      pendingLink.url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                    setPendingLink(null)
                  }}
                  style={primaryButtonStyle}
                >
                  이동
                </button>
              </div>
            </div>
          </div>
        </Html>
      ) : null}
    </>
  )
}

function MainInfoPanel({ content, L }: any) {
  return (
    <group>
      <mesh position={[0, 0, PANEL_SURFACE_Z]} renderOrder={2}>
        <planeGeometry args={[MAIN_PANEL_WIDTH, MAIN_PANEL_HEIGHT]} />
        <meshStandardMaterial
          color="#f4efe7"
          roughness={0.96}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, PANEL_INNER_Z]} renderOrder={3}>
        <planeGeometry
          args={[MAIN_PANEL_WIDTH - 0.08, MAIN_PANEL_HEIGHT - 0.08]}
        />
        <meshStandardMaterial
          color="#fbf7f0"
          roughness={0.98}
          metalness={0.01}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={L.title.position}
        anchorX="left"
        anchorY="top"
        fontSize={L.title.fontSize}
        color="#111111"
        maxWidth={L.title.maxWidth}
        lineHeight={L.title.lineHeight}
      >
        {content.title}
      </Text>

      <Text
        position={L.artist.position}
        anchorX="left"
        anchorY="top"
        fontSize={L.artist.fontSize}
        color="#434343"
        maxWidth={L.artist.maxWidth}
        lineHeight={L.artist.lineHeight}
      >
        {content.artist}
      </Text>

      <Text
        position={L.period.position}
        anchorX="left"
        anchorY="top"
        fontSize={L.period.fontSize}
        color="#686868"
        maxWidth={L.period.maxWidth}
        lineHeight={L.period.lineHeight}
      >
        {content.period}
      </Text>

      <mesh position={L.divider.position} renderOrder={3}>
        <planeGeometry args={[L.divider.width, L.divider.height]} />
        <meshBasicMaterial color="#d2c6b6" side={THREE.DoubleSide} />
      </mesh>

      <Text
        position={L.description.position}
        anchorX="left"
        anchorY="top"
        fontSize={L.description.fontSize}
        color="#2b2b2b"
        maxWidth={L.description.maxWidth}
        lineHeight={L.description.lineHeight}
      >
        {content.description}
      </Text>

      {content.rightTitle ? (
        <>
          <Text
            position={L.rightTitle.position}
            anchorX="left"
            anchorY="top"
            fontSize={L.rightTitle.fontSize}
            color="#111111"
            maxWidth={L.rightTitle.maxWidth}
            lineHeight={L.rightTitle.lineHeight}
          >
            {content.rightTitle}
          </Text>

          <Text
            position={L.rightBody.position}
            anchorX="left"
            anchorY="top"
            fontSize={L.rightBody.fontSize}
            color="#575757"
            maxWidth={L.rightBody.maxWidth}
            lineHeight={L.rightBody.lineHeight}
          >
            {content.rightBody}
          </Text>
        </>
      ) : null}
    </group>
  )
}

function LinkStripPanel({
  content,
  L,
  onOpenLink,
}: {
  content: any
  L: any
  onOpenLink: (link: InfoWallLink) => void
}) {
  return (
    <group>
      <mesh position={[0, 0, PANEL_SURFACE_Z]} renderOrder={2}>
        <planeGeometry args={[LINK_PANEL_WIDTH, LINK_PANEL_HEIGHT]} />
        <meshStandardMaterial
          color="#141922"
          roughness={0.93}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, PANEL_INNER_Z]} renderOrder={3}>
        <planeGeometry
          args={[LINK_PANEL_WIDTH - 0.08, LINK_PANEL_HEIGHT - 0.08]}
        />
        <meshStandardMaterial
          color="#11161d"
          roughness={0.96}
          metalness={0.01}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={L.label.position}
        anchorX="left"
        anchorY="middle"
        fontSize={L.label.fontSize}
        color="#d9d4ce"
        maxWidth={L.label.maxWidth}
      >
        Links
      </Text>

      <group position={L.container.position}>
        {content.links.map((link: InfoWallLink, index: number) => (
          <LinkButton3D
            key={link.id}
            x={index * L.button.gap}
            link={link}
            L={L}
            onOpenLink={onOpenLink}
          />
        ))}
      </group>
    </group>
  )
}

function LinkButton3D({
  x,
  link,
  L,
  onOpenLink,
}: {
  x: number
  link: InfoWallLink
  L: any
  onOpenLink: (link: InfoWallLink) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={[x, 0, 0]} scale={hovered ? 1.06 : 1}>
      <mesh
        position={[L.button.size[0] / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        onClick={(e) => {
          e.stopPropagation()
          onOpenLink(link)
        }}
        renderOrder={4}
      >
        <planeGeometry args={L.button.size} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : "#f4efe7"}
          roughness={0.92}
          metalness={0.02}
          emissive={hovered ? "#c9b28e" : "#000000"}
          emissiveIntensity={hovered ? 0.12 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[L.text.offsetX, 0, BUTTON_Z]}
        anchorX="left"
        anchorY="middle"
        fontSize={L.text.fontSize}
        color="#171717"
        maxWidth={L.text.maxWidth}
      >
        {link.label}
      </Text>
    </group>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(4,6,10,0.42)",
  backdropFilter: "blur(8px)",
  zIndex: 2147483647,
}

const modalStyle: React.CSSProperties = {
  width: "min(420px, calc(100vw - 32px))",
  borderRadius: 24,
  padding: "22px 20px 18px",
  background:
    "linear-gradient(180deg, rgba(19,22,29,0.98) 0%, rgba(10,13,19,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
  color: "#f7f7fb",
}

const modalEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
}

const modalTitleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: 24,
  lineHeight: 1.08,
}

const modalBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.72)",
  wordBreak: "break-all",
}

const modalButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 18,
}

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5f7fb",
  fontSize: 14,
  cursor: "pointer",
}

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 46,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #f5f1ea 0%, #ddd0bd 100%)",
  color: "#12161d",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
}