"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND, carryProgressiveRateColor } from "@/lib/brand";
import { clipUrl, getFinalThirdBreakdown, type GameStats, type PlayResultBreakdown } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted" | "warn";

const PLAY_TIPS = {
  progressive:
    "Progressive Play — An action that progresses the attack, creates a scoring opportunity, or breaks defensive lines in the final third.",
  neutral:
    "Neutral Play — An action that maintains possession or position without a clear opportunity to threaten the goal.",
  lost: "Lost Play — Losing possession or failing to advance through an inaccurate action or immediate pressure.",
} as const;

function PlayTip({ label, tip, href }: { label: string; tip: string; href?: string }) {
  const className = `pass-play-tip legend__label${href ? " pass-play-tip--clip" : ""}`;
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer" data-tip={tip} aria-label={`${label}. ${tip}`}>
        <span className="pass-play-tip__label">{label}</span>
      </a>
    );
  }
  return (
    <button type="button" className={className} data-tip={tip} aria-label={`${label}. ${tip}`}>
      <span className="pass-play-tip__label">{label}</span>
    </button>
  );
}

function ClipLegendLabel({ label, href }: { label: string; href?: string }) {
  if (!href) return <span className="legend__label">{label}</span>;
  return (
    <a className="legend__label clip-link" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function ClipMetricTitle({ label, href }: { label: string; href?: string }) {
  if (!href) return <h3 className="metric-card__title">{label}</h3>;
  return (
    <h3 className="metric-card__title">
      <a className="clip-link" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    </h3>
  );
}

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
  major,
  primaryHref,
  secondaryHref,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
  major?: boolean;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className={`metric-card${major ? " metric-card--major" : " metric-card--compact"}`}>
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <ClipLegendLabel label={primaryLabel} href={primaryHref} />
          <strong>
            {primary} · {percent(primary, total)}%
          </strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />
          <strong>
            {secondary} · {percent(secondary, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function ActionResultsMeter({
  title,
  breakdown,
  videos,
}: {
  title: string;
  breakdown: PlayResultBreakdown;
  videos?: GameStats["videos"];
}) {
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;
  const positivePct = percent(breakdown.positive, total);
  const neutralPct = percent(breakdown.neutral, total);
  const lostPct = percent(breakdown.lost, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{total} actions</p>
      <div
        className="meter"
        role="img"
        aria-label={`Progressive: ${breakdown.positive}. Neutral: ${breakdown.neutral}. Lost: ${breakdown.lost}.`}
      >
        <span className="meter__seg meter__seg--pass-progressive" style={{ width: `${positivePct}%` }} />
        <span className="meter__seg meter__seg--pass-neutral" style={{ width: `${neutralPct}%` }} />
        <span className="meter__seg meter__seg--pass-lost" style={{ width: `${lostPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className="legend__dot legend__dot--pass-progressive" />
          <PlayTip
            label="Progressive plays"
            tip={PLAY_TIPS.progressive}
            href={clipUrl(videos, "Progressive plays Final third", "Progressive plays final third")}
          />
          <strong>
            {breakdown.positive} · {positivePct}%
          </strong>
        </li>
        <li>
          <span className="legend__dot legend__dot--pass-neutral" />
          <PlayTip label="Neutral plays" tip={PLAY_TIPS.neutral} />
          <strong>
            {breakdown.neutral} · {neutralPct}%
          </strong>
        </li>
        <li>
          <span className="legend__dot legend__dot--pass-lost" />
          <PlayTip
            label="Lost plays"
            tip={PLAY_TIPS.lost}
            href={clipUrl(videos, "Lost plays final third", "Lost plays Final third")}
          />
          <strong>
            {breakdown.lost} · {lostPct}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function PositiveCarryStat({
  label,
  positive,
  total,
  pctTone,
  titleHref,
}: {
  label: string;
  positive: number;
  total: number;
  pctTone: "transition" | "possession";
  titleHref?: string;
}) {
  const pctLabel = `${percent(positive, total)}% progressive play`;

  return (
    <div className="metric-card">
      <ClipMetricTitle label={label} href={titleHref} />
      <div className="carry-result">
        <div className="carry-result__figure">
          <span className="metric-card__value">{total}</span>
          <span className="carry-result__label">Total</span>
        </div>
        <div className="carry-result__figure">
          <span className="metric-card__value" style={{ color: carryProgressiveRateColor(pctTone) }}>
            {positive}
          </span>
          <span className="carry-result__label">Progressive play</span>
        </div>
      </div>
      <span
        className="metric-card__pct metric-card__pct--carry-rate"
        style={{ color: carryProgressiveRateColor(pctTone) }}
      >
        {pctLabel}
      </span>
    </div>
  );
}

function CountStat({
  label,
  value,
  caption,
  highlight,
  titleHref,
}: {
  label: string;
  value: number;
  caption: string;
  highlight?: boolean;
  titleHref?: string;
}) {
  return (
    <div className={`metric-card metric-card--compact${highlight ? " metric-card--highlight" : ""}`}>
      <ClipMetricTitle label={label} href={titleHref} />
      <span className="metric-card__value">{value}</span>
      <p className="metric-card__caption">{caption}</p>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, carries, finalThirdActions, meta, videos } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
  const carriesClip = clipUrl(videos, "Carries");
  const transitionClip = clipUrl(videos, "Progressive plays in transition", "In transition");
  const possessionClip = clipUrl(videos, "Progressive play in possession", "In possession");
  const shotsClip = clipUrl(videos, "Shots");
  const passShotClip = clipUrl(videos, "Passes with shot opportunity", "Pass with shot opportunity");

  const topics: Topic[] = [
    {
      id: "carries",
      title: "Carries",
      phase: "carrying",
      content: (
        <>
          <MetricFlow
            className="metric-flow--pressure"
            items={[
              <div key="total" className="metric-card metric-card--hero metric-card--compact">
                <ClipMetricTitle label="Total carries" href={carriesClip} />
                <span className="metric-card__value">{carries.total}</span>
                <p className="metric-card__caption">Carries tracked in the match</p>
              </div>,
              <SplitMeter
                key="split"
                title="Phase context"
                headline={`${carries.inTransition} in transition · ${carries.inPossession} in possession`}
                primary={carries.inTransition}
                secondary={carries.inPossession}
                primaryLabel="In transition"
                secondaryLabel="In possession"
                primaryTone="warn"
                secondaryTone="accent"
                major
                primaryHref={transitionClip}
                secondaryHref={possessionClip}
              />,
            ]}
          />
        </>
      ),
    },
    {
      id: "carries-results",
      title: "Carries Results",
      phase: "carrying",
      content: (
        <MetricFlow
          items={[
            <PositiveCarryStat
              key="transition"
              label="In transition"
              positive={carries.transitionPositive}
              total={carries.inTransition}
              pctTone="transition"
              titleHref={transitionClip}
            />,
            <PositiveCarryStat
              key="possession"
              label="In possession"
              positive={carries.possessionPositive}
              total={carries.inPossession}
              pctTone="possession"
              titleHref={possessionClip}
            />,
          ]}
        />
      ),
    },
    {
      id: "final-third",
      title: "Final Third Actions",
      phase: "final-third",
      content: (
        <>
          <div className="metric-card metric-card--hero metric-card--compact">
            <h3 className="metric-card__title">Total final third actions</h3>
            <span className="metric-card__value">{finalThirdActions.total}</span>
            <p className="metric-card__caption">Actions in the final third</p>
          </div>
          <ActionResultsMeter title="Outcome breakdown" breakdown={finalThirdBreakdown} videos={videos} />
          <MetricFlow
            items={[
              <CountStat
                key="shots"
                label="Shots"
                value={finalThirdActions.shots}
                caption="Shots taken"
                highlight
                titleHref={shotsClip}
              />,
              <CountStat
                key="pass-shot"
                label="Pass with shot opportunity"
                value={finalThirdActions.passWithShotOpportunity}
                caption="Passes leading to a shot chance"
                highlight
                titleHref={passShotClip}
              />,
            ]}
          />
        </>
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialCarriesVideoLink={carries.videoLink}
      initialFinalThirdActionsVideoLink={finalThirdActions.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} clubLogo={player.clubLogo} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <TopicsBoard topics={topics} />
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
