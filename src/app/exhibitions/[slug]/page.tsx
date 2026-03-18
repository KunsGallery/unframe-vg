import Link from "next/link"
import { notFound } from "next/navigation"
import { getExhibitionBySlug } from "@/lib/getExhibitionBySlug"
import VirtualGalleryHeader from "@/components/VirtualGalleryHeader"

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const exhibition = getExhibitionBySlug(slug)

  if (!exhibition) {
    notFound()
  }

  return (
    <main style={pageStyle}>
      <VirtualGalleryHeader currentSlug={exhibition.slug} />

      <section style={heroStyle}>
        <div style={heroInnerStyle}>
          <p style={eyebrowStyle}>EXHIBITION</p>

          <h1 style={titleStyle}>{exhibition.title}</h1>

          <p style={artistStyle}>{exhibition.artist}</p>

          <p style={periodStyle}>{exhibition.period}</p>

          <p style={descriptionStyle}>{exhibition.description}</p>

          {exhibition.rightTitle || exhibition.rightBody ? (
            <section style={noteSectionStyle}>
              {exhibition.rightTitle ? (
                <h2 style={noteTitleStyle}>{exhibition.rightTitle}</h2>
              ) : null}

              {exhibition.rightBody ? (
                <p style={noteBodyStyle}>{exhibition.rightBody}</p>
              ) : null}
            </section>
          ) : null}

          <div style={buttonRowStyle}>
            <Link
              href={`/exhibitions/${exhibition.slug}/gallery`}
              style={primaryButtonStyle}
            >
              전시장 입장
            </Link>

            <Link href="/exhibitions" style={secondaryButtonStyle}>
              전체 전시 보기
            </Link>
          </div>

          {exhibition.links?.length ? (
            <div style={linkListStyle}>
              {exhibition.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={externalLinkStyle}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #e7ebf0 0%, #d8dde6 34%, #cfd5df 100%)",
  color: "#12161d",
}

const heroStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
}

const heroInnerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 920,
  padding: "40px 28px",
  borderRadius: 28,
  background: "rgba(255,255,255,0.58)",
  border: "1px solid rgba(255,255,255,0.46)",
  boxShadow: "0 24px 80px rgba(22,28,36,0.12)",
  backdropFilter: "blur(14px)",
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(18,22,29,0.48)",
}

const titleStyle: React.CSSProperties = {
  margin: "14px 0 10px",
  fontSize: "clamp(36px, 7vw, 76px)",
  lineHeight: 0.96,
  fontWeight: 700,
  letterSpacing: "-0.04em",
}

const artistStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(18px, 2.6vw, 28px)",
  color: "#2b3139",
}

const periodStyle: React.CSSProperties = {
  margin: "0 0 22px",
  fontSize: 15,
  color: "rgba(18,22,29,0.62)",
}

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
  fontSize: "clamp(15px, 2vw, 18px)",
  lineHeight: 1.8,
  color: "#20262e",
  whiteSpace: "pre-wrap",
}

const noteSectionStyle: React.CSSProperties = {
  marginTop: 32,
  paddingTop: 24,
  borderTop: "1px solid rgba(18,22,29,0.1)",
}

const noteTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 18,
  color: "#12161d",
}

const noteBodyStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
  fontSize: 15,
  lineHeight: 1.8,
  color: "#3a424c",
  whiteSpace: "pre-wrap",
}

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 32,
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 20px",
  borderRadius: 16,
  textDecoration: "none",
  background: "#12161d",
  color: "#f8f5ef",
  fontSize: 15,
  fontWeight: 700,
}

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 20px",
  borderRadius: 16,
  textDecoration: "none",
  background: "rgba(255,255,255,0.58)",
  color: "#12161d",
  fontSize: 15,
  fontWeight: 600,
  border: "1px solid rgba(18,22,29,0.08)",
}

const linkListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
}

const externalLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 999,
  textDecoration: "none",
  background: "rgba(18,22,29,0.06)",
  color: "#1b2129",
  fontSize: 14,
}