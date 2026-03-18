"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type VirtualGalleryHeaderProps = {
  currentSlug?: string
}

type NavLinkProps = {
  href: string
  label: string
  active: boolean
}

export default function VirtualGalleryHeader({
  currentSlug,
}: VirtualGalleryHeaderProps) {
  const pathname = usePathname()

  const currentHref = currentSlug
    ? `/exhibitions/${currentSlug}`
    : "/exhibitions"

  return (
    <header style={navWrapStyle}>
      <div style={navStyle}>
        <Link href="/" style={brandStyle}>
          Virtual Gallery
        </Link>

        <nav style={navMenuStyle}>
          <NavLink href="/" label="Home" active={pathname === "/"} />
          <NavLink
            href="/exhibitions"
            label="Exhibitions"
            active={pathname === "/exhibitions"}
          />
          <NavLink
            href={currentHref}
            label="Current"
            active={
              pathname === currentHref ||
              pathname === `${currentHref}/gallery`
            }
          />
        </nav>
      </div>
    </header>
  )
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      style={{
        ...navLinkStyle,
        ...(active ? navLinkActiveStyle : {}),
      }}
    >
      {label}
    </Link>
  )
}

const navWrapStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  padding: "16px 20px 0",
}

const navStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 18px",
  borderRadius: 20,
  background: "rgba(255,255,255,0.52)",
  border: "1px solid rgba(255,255,255,0.42)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 30px rgba(20,26,36,0.06)",
  flexWrap: "wrap",
}

const brandStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#12161d",
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "-0.02em",
}

const navMenuStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
}

const navLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#2b3139",
  fontSize: 14,
  fontWeight: 600,
  minHeight: 36,
  padding: "0 12px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 220ms ease",
}

const navLinkActiveStyle: React.CSSProperties = {
  background: "#12161d",
  color: "#f8f5ef",
  boxShadow: "0 10px 24px rgba(18,22,29,0.12)",
}