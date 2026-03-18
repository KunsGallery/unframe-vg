import Link from "next/link"
import { exhibitions } from "@/data/exhibitions"
import VirtualGalleryHeader from "@/components/VirtualGalleryHeader"

export default function ExhibitionsPage() {
  const currentExhibitions = exhibitions.filter((exhibition) => exhibition.isCurrent)
  const recommendedExhibitions = exhibitions.filter(
    (exhibition) => exhibition.isRecommended
  )
  const archiveExhibitions = exhibitions.filter(
    (exhibition) => !exhibition.isCurrent
  )

  const featuredCurrent = currentExhibitions[0] ?? exhibitions[0]

  return (
    <main style={pageStyle}>
      <VirtualGalleryHeader currentSlug={featuredCurrent?.slug} />

      <section style={heroStyle}>
        <div style={heroInnerStyle}>
          <p style={eyebrowStyle}>VIRTUAL GALLERY</p>
          <h1 style={heroTitleStyle}>Exhibitions</h1>
          <p style={heroBodyStyle}>
            현재 진행 중인 전시부터 디렉터 추천 전시, 아카이브까지
            한눈에 살펴볼 수 있는 버츄얼 갤러리 전시 리스트입니다.
          </p>

          <div style={heroButtonRowStyle}>
            <Link href="/" style={secondaryButtonStyle}>
              메인으로
            </Link>
            {currentExhibitions[0] ? (
              <Link
                href={`/exhibitions/${currentExhibitions[0].slug}/gallery`}
                style={primaryButtonStyle}
              >
                현재 전시 입장
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {currentExhibitions.length > 0 ? (
        <SectionBlock
          title="현재 진행 중인 전시"
          description="지금 바로 입장 가능한 전시입니다."
          items={currentExhibitions}
        />
      ) : null}

      {recommendedExhibitions.length > 0 ? (
        <SectionBlock
          title="디렉터 추천 전시"
          description="지금 주목해볼 만한 전시를 큐레이션했습니다."
          items={recommendedExhibitions}
        />
      ) : null}

      <SectionBlock
        title="전체 전시"
        description="버츄얼 갤러리에서 공개된 전체 전시 목록입니다."
        items={archiveExhibitions.length ? archiveExhibitions : exhibitions}
      />
    </main>
  )
}

function SectionBlock({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: typeof exhibitions
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <p style={sectionEyebrowStyle}>SECTION</p>
          <h2 style={sectionTitleStyle}>{title}</h2>
        </div>
        <p style={sectionDescriptionStyle}>{description}</p>
      </div>

      <div style={gridStyle}>
        {items.map((exhibition) => (
          <article key={exhibition.slug} style={cardStyle}>
            <div style={cardTopStyle}>
              <div style={badgeRowStyle}>
                {exhibition.isCurrent ? (
                  <span style={currentBadgeStyle}>Current</span>
                ) : null}
                {exhibition.isRecommended ? (
                  <span style={recommendedBadgeStyle}>Recommended</span>
                ) : null}
              </div>

              <h3 style={cardTitleStyle}>{exhibition.title}</h3>
              <p style={cardArtistStyle}>{exhibition.artist}</p>
              <p style={cardPeriodStyle}>{exhibition.period}</p>
              <p style={cardSummaryStyle}>
                {exhibition.summary || exhibition.description}
              </p>
            </div>

            <div style={cardButtonRowStyle}>
              <Link
                href={`/exhibitions/${exhibition.slug}`}
                style={cardSecondaryButtonStyle}
              >
                상세 보기
              </Link>
              <Link
                href={`/exhibitions/${exhibition.slug}/gallery`}
                style={cardPrimaryButtonStyle}
              >
                입장하기
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #edf1f6 0%, #dfe5ee 34%, #d6dde7 100%)",
  color: "#12161d",
  paddingBottom: 80,
}

const heroStyle: React.CSSProperties = {
  padding: "72px 20px 32px",
}

const heroInnerStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "36px 28px",
  borderRadius: 28,
  background: "rgba(255,255,255,0.56)",
  border: "1px solid rgba(255,255,255,0.42)",
  boxShadow: "0 24px 80px rgba(20,26,36,0.10)",
  backdropFilter: "blur(12px)",
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(18,22,29,0.46)",
}

const heroTitleStyle: React.CSSProperties = {
  margin: "14px 0 12px",
  fontSize: "clamp(38px, 7vw, 76px)",
  lineHeight: 0.95,
  letterSpacing: "-0.04em",
  fontWeight: 700,
}

const heroBodyStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 760,
  fontSize: "clamp(15px, 2vw, 18px)",
  lineHeight: 1.8,
  color: "#28303a",
}

const heroButtonRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 28,
}

const sectionStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "36px 20px 0",
}

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 16,
  marginBottom: 18,
  flexWrap: "wrap",
}

const sectionEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(18,22,29,0.42)",
}

const sectionTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(24px, 3vw, 34px)",
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
}

const sectionDescriptionStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 420,
  fontSize: 14,
  lineHeight: 1.7,
  color: "rgba(18,22,29,0.66)",
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: 300,
  padding: 22,
  borderRadius: 24,
  background: "rgba(255,255,255,0.62)",
  border: "1px solid rgba(255,255,255,0.44)",
  boxShadow: "0 20px 60px rgba(18,22,29,0.08)",
  backdropFilter: "blur(10px)",
}

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
}

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 14,
}

const currentBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "0 10px",
  borderRadius: 999,
  background: "#12161d",
  color: "#f8f5ef",
  fontSize: 12,
  fontWeight: 700,
}

const recommendedBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "0 10px",
  borderRadius: 999,
  background: "rgba(18,22,29,0.08)",
  color: "#12161d",
  fontSize: 12,
  fontWeight: 700,
}

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
}

const cardArtistStyle: React.CSSProperties = {
  margin: "10px 0 6px",
  fontSize: 16,
  color: "#2b3139",
}

const cardPeriodStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "rgba(18,22,29,0.58)",
}

const cardSummaryStyle: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: 14,
  lineHeight: 1.8,
  color: "#2f3741",
}

const cardButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 22,
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

const cardPrimaryButtonStyle: React.CSSProperties = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 46,
  borderRadius: 14,
  textDecoration: "none",
  background: "#12161d",
  color: "#f8f5ef",
  fontSize: 14,
  fontWeight: 700,
}

const cardSecondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 46,
  borderRadius: 14,
  textDecoration: "none",
  background: "rgba(18,22,29,0.06)",
  color: "#12161d",
  fontSize: 14,
  fontWeight: 600,
}