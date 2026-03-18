"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { exhibitions } from "@/data/exhibitions"
import VirtualGalleryHeader from "@/components/VirtualGalleryHeader"

type HomeTab = "home" | "current" | "recommended" | "archive"

export default function VirtualGalleryHomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>("home")
  const [isEntering, setIsEntering] = useState(true)
  const tabBarRef = useRef<HTMLDivElement | null>(null)

  const currentExhibitions = useMemo(
    () => exhibitions.filter((exhibition) => exhibition.isCurrent),
    []
  )
  const recommendedExhibitions = useMemo(
    () => exhibitions.filter((exhibition) => exhibition.isRecommended),
    []
  )

  const featuredCurrent = currentExhibitions[0] ?? exhibitions[0]
  const featuredRecommended = recommendedExhibitions.slice(0, 3)
  const archiveExhibitions = exhibitions.filter((exhibition) => !exhibition.isCurrent)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsEntering(false)

    const id = window.setTimeout(() => {
      setIsEntering(true)
    }, 40)

    return () => window.clearTimeout(id)
  }, [activeTab])

  const handleTabChange = (tab: HomeTab) => {
    setActiveTab(tab)

    if (!tabBarRef.current) return

    const activeButton = tabBarRef.current.querySelector<HTMLButtonElement>(
      `[data-tab="${tab}"]`
    )

    activeButton?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }

  return (
    <main style={pageStyle}>
      <VirtualGalleryHeader currentSlug={featuredCurrent?.slug} />

      <section style={heroSectionStyle}>
        <div style={heroInnerStyle}>
          <div style={heroLeftStyle}>
            <p style={eyebrowStyle}>KÜN’S VIRTUAL GALLERY</p>
            <h1 style={heroTitleStyle}>
              공간을 넘어,
              <br />
              전시는 계속됩니다.
            </h1>
            <p style={heroBodyStyle}>
              현재 진행 중인 전시부터 디렉터 추천 전시, 아카이브까지.
              버츄얼 갤러리에서 전시를 더 오래, 더 깊게 경험하세요.
            </p>

            <div style={heroButtonRowStyle}>
              {featuredCurrent ? (
                <Link
                  href={`/exhibitions/${featuredCurrent.slug}/gallery`}
                  style={primaryButtonStyle}
                >
                  현재 전시 입장
                </Link>
              ) : null}

              <Link href="/exhibitions" style={secondaryButtonStyle}>
                전체 전시 보기
              </Link>
            </div>
          </div>

          <div style={heroCardStyle}>
            <p style={heroCardEyebrowStyle}>Now Showing</p>
            <h2 style={heroCardTitleStyle}>
              {featuredCurrent?.title ?? "No Exhibition"}
            </h2>
            <p style={heroCardArtistStyle}>{featuredCurrent?.artist ?? "-"}</p>
            <p style={heroCardPeriodStyle}>{featuredCurrent?.period ?? "-"}</p>
            <p style={heroCardBodyStyle}>
              {featuredCurrent?.summary ?? featuredCurrent?.description ?? ""}
            </p>

            {featuredCurrent ? (
              <div style={heroCardButtonRowStyle}>
                <Link
                  href={`/exhibitions/${featuredCurrent.slug}`}
                  style={cardSecondaryButtonStyle}
                >
                  상세 보기
                </Link>
                <Link
                  href={`/exhibitions/${featuredCurrent.slug}/gallery`}
                  style={cardPrimaryButtonStyle}
                >
                  입장하기
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section style={mobileTabShellStyle}>
        <div ref={tabBarRef} style={mobileTabBarStyle}>
          <TabButton
            tab="home"
            label="Home"
            active={activeTab === "home"}
            onClick={() => handleTabChange("home")}
          />
          <TabButton
            tab="current"
            label="Current"
            active={activeTab === "current"}
            onClick={() => handleTabChange("current")}
          />
          <TabButton
            tab="recommended"
            label="Recommended"
            active={activeTab === "recommended"}
            onClick={() => handleTabChange("recommended")}
          />
          <TabButton
            tab="archive"
            label="Archive"
            active={activeTab === "archive"}
            onClick={() => handleTabChange("archive")}
          />
        </div>
      </section>

      <section
        key={activeTab}
        style={{
          ...tabContentWrapStyle,
          opacity: isEntering ? 1 : 0,
          transform: isEntering ? "translateY(0px)" : "translateY(16px)",
        }}
      >
        {activeTab === "home" && (
          <>
            {featuredCurrent ? (
              <section style={sectionStyle}>
                <SectionHeader
                  eyebrow="CURRENT"
                  title="현재 진행 중인 전시"
                  description="지금 바로 입장 가능한 전시입니다."
                />

                <article style={featureCardStyle}>
                  <div style={featureContentStyle}>
                    <p style={featureBadgeStyle}>Current Exhibition</p>
                    <h3 style={featureTitleStyle}>{featuredCurrent.title}</h3>
                    <p style={featureArtistStyle}>{featuredCurrent.artist}</p>
                    <p style={featurePeriodStyle}>{featuredCurrent.period}</p>
                    <p style={featureDescriptionStyle}>
                      {featuredCurrent.description}
                    </p>

                    <div style={heroButtonRowStyle}>
                      <Link
                        href={`/exhibitions/${featuredCurrent.slug}`}
                        style={secondaryButtonStyle}
                      >
                        전시 상세
                      </Link>
                      <Link
                        href={`/exhibitions/${featuredCurrent.slug}/gallery`}
                        style={primaryButtonStyle}
                      >
                        전시장 입장
                      </Link>
                    </div>
                  </div>
                </article>
              </section>
            ) : null}

            {featuredRecommended.length > 0 ? (
              <section style={sectionStyle}>
                <SectionHeader
                  eyebrow="RECOMMENDED"
                  title="디렉터 추천 전시"
                  description="지금 주목해볼 만한 전시를 큐레이션했습니다."
                />

                <div style={gridStyle}>
                  {featuredRecommended.map((exhibition) => (
                    <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                  ))}
                </div>
              </section>
            ) : null}

            <section style={sectionStyle}>
              <SectionHeader
                eyebrow="ARCHIVE"
                title="전시 미리보기"
                description="버츄얼 갤러리에서 공개된 전시를 빠르게 둘러보세요."
              />

              <div style={gridStyle}>
                {exhibitions.slice(0, 3).map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              </div>

              <div style={sectionFooterStyle}>
                <Link href="/exhibitions" style={secondaryButtonStyle}>
                  전체 전시 보러가기
                </Link>
              </div>
            </section>
          </>
        )}

        {activeTab === "current" && (
          <section style={sectionStyle}>
            <SectionHeader
              eyebrow="CURRENT"
              title="현재 진행 중인 전시"
              description="지금 바로 입장 가능한 전시만 모아봤습니다."
            />

            {currentExhibitions.length > 0 ? (
              <div style={gridStyle}>
                {currentExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <EmptyBlock text="현재 진행 중인 전시가 없습니다." />
            )}
          </section>
        )}

        {activeTab === "recommended" && (
          <section style={sectionStyle}>
            <SectionHeader
              eyebrow="RECOMMENDED"
              title="디렉터 추천 전시"
              description="큐레이션 관점에서 주목할 만한 전시들입니다."
            />

            {recommendedExhibitions.length > 0 ? (
              <div style={gridStyle}>
                {recommendedExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <EmptyBlock text="추천 전시가 없습니다." />
            )}
          </section>
        )}

        {activeTab === "archive" && (
          <section style={sectionStyle}>
            <SectionHeader
              eyebrow="ARCHIVE"
              title="아카이브"
              description="버츄얼 갤러리에서 공개된 전시 기록입니다."
            />

            {(archiveExhibitions.length > 0 ? archiveExhibitions : exhibitions).length >
            0 ? (
              <div style={gridStyle}>
                {(archiveExhibitions.length > 0
                  ? archiveExhibitions
                  : exhibitions
                ).map((exhibition) => (
                  <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <EmptyBlock text="아카이브 전시가 없습니다." />
            )}
          </section>
        )}
      </section>
    </main>
  )
}

function TabButton({
  tab,
  label,
  active,
  onClick,
}: {
  tab: HomeTab
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-tab={tab}
      onClick={onClick}
      style={{
        ...mobileTabButtonStyle,
        ...(active ? mobileTabButtonActiveStyle : {}),
      }}
    >
      {label}
    </button>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div style={sectionHeaderStyle}>
      <div>
        <p style={sectionEyebrowStyle}>{eyebrow}</p>
        <h2 style={sectionTitleStyle}>{title}</h2>
      </div>
      <p style={sectionDescriptionStyle}>{description}</p>
    </div>
  )
}

function ExhibitionCard({ exhibition }: { exhibition: (typeof exhibitions)[number] }) {
  return (
    <article style={cardStyle}>
      <div>
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
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div style={emptyBlockStyle}>
      <p style={emptyTextStyle}>{text}</p>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #edf1f6 0%, #e7ecf3 24%, #dde4ed 55%, #d6dde7 100%)",
  color: "#12161d",
  paddingBottom: 80,
}

const heroSectionStyle: React.CSSProperties = {
  padding: "24px 20px 12px",
}

const heroInnerStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1.25fr 0.9fr",
  gap: 18,
}

const heroLeftStyle: React.CSSProperties = {
  padding: "34px 10px 10px 4px",
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(18,22,29,0.46)",
}

const heroTitleStyle: React.CSSProperties = {
  margin: "14px 0 14px",
  fontSize: "clamp(40px, 8vw, 88px)",
  lineHeight: 0.94,
  letterSpacing: "-0.05em",
  fontWeight: 700,
}

const heroBodyStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
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

const heroCardStyle: React.CSSProperties = {
  padding: "28px 24px",
  borderRadius: 28,
  background: "rgba(255,255,255,0.6)",
  border: "1px solid rgba(255,255,255,0.44)",
  boxShadow: "0 24px 80px rgba(20,26,36,0.10)",
  backdropFilter: "blur(12px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}

const heroCardEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(18,22,29,0.42)",
}

const heroCardTitleStyle: React.CSSProperties = {
  margin: "12px 0 10px",
  fontSize: "clamp(30px, 4vw, 46px)",
  lineHeight: 0.98,
  letterSpacing: "-0.05em",
}

const heroCardArtistStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: 17,
  color: "#2b3139",
}

const heroCardPeriodStyle: React.CSSProperties = {
  margin: "0 0 18px",
  fontSize: 13,
  color: "rgba(18,22,29,0.58)",
}

const heroCardBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.8,
  color: "#2f3741",
}

const heroCardButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 24,
}

const mobileTabShellStyle: React.CSSProperties = {
  position: "sticky",
  top: 82,
  zIndex: 25,
  padding: "8px 20px 0",
}

const mobileTabBarStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "flex",
  gap: 10,
  overflowX: "auto",
  padding: "10px 2px 6px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
}

const mobileTabButtonStyle: React.CSSProperties = {
  flex: "0 0 auto",
  appearance: "none",
  border: "1px solid rgba(255,255,255,0.52)",
  background: "rgba(255,255,255,0.54)",
  color: "#2b3139",
  fontSize: 14,
  fontWeight: 600,
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 999,
  cursor: "pointer",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 24px rgba(20,26,36,0.06)",
  transition: "all 260ms ease",
  whiteSpace: "nowrap",
}

const mobileTabButtonActiveStyle: React.CSSProperties = {
  background: "#12161d",
  color: "#f8f5ef",
  border: "1px solid rgba(18,22,29,0.92)",
  boxShadow: "0 12px 30px rgba(18,22,29,0.14)",
  transform: "translateY(-1px)",
}

const tabContentWrapStyle: React.CSSProperties = {
  transition: "opacity 320ms ease, transform 320ms ease",
  willChange: "opacity, transform",
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

const featureCardStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 28,
  background: "rgba(255,255,255,0.58)",
  border: "1px solid rgba(255,255,255,0.42)",
  boxShadow: "0 20px 60px rgba(18,22,29,0.08)",
  backdropFilter: "blur(10px)",
}

const featureContentStyle: React.CSSProperties = {
  maxWidth: 760,
}

const featureBadgeStyle: React.CSSProperties = {
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

const featureTitleStyle: React.CSSProperties = {
  margin: "16px 0 10px",
  fontSize: "clamp(34px, 5vw, 54px)",
  lineHeight: 0.98,
  letterSpacing: "-0.05em",
}

const featureArtistStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
  color: "#2b3139",
}

const featurePeriodStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: 14,
  color: "rgba(18,22,29,0.58)",
}

const featureDescriptionStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.8,
  color: "#2f3741",
  whiteSpace: "pre-wrap",
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

const sectionFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginTop: 24,
}

const emptyBlockStyle: React.CSSProperties = {
  padding: "32px 20px",
  borderRadius: 24,
  background: "rgba(255,255,255,0.56)",
  border: "1px solid rgba(255,255,255,0.42)",
  boxShadow: "0 20px 60px rgba(18,22,29,0.06)",
}

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "rgba(18,22,29,0.62)",
}