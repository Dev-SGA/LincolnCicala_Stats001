"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND, carryProgressiveRateColor } from "@/lib/brand";
import type { GameStats, PlayResultBreakdown } from "@/lib/stats";
import { getFinalThirdBreakdown } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted" | "warn";

const PLAY_TIPS = {
  positive:
    "Positive Play — An action that progresses the attack, creates a scoring opportunity, or breaks defensive lines in the final third.",
  neutral:
    "Neutral Play — An action that maintains possession or position without a clear opportunity to threaten the goal.",
  lost: "Lost Play — Losing possession or failing to advance through an inaccurate action or immediate pressure.",
} as const;

function PlayTip({ label, tip }: { label: string; tip: string }) {
  return (
    <button type="button" className="pass-play-tip legend__label" data-tip={tip} aria-label={`${label}. ${tip}`}>
      <span className="pass-play-tip__label">{label}</span>
    </button>
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
          <span className="legend__label">{primaryLabel}</span>
          <strong>
            {primary} · {percent(primary, total)}%
          </strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>
            {secondary} · {percent(secondary, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function ActionResultsMeter({ title, breakdown }: { title: string; breakdown: PlayResultBreakdown }) {
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
        aria-label={`Positive: ${breakdown.positive}. Neutral: ${breakdown.neutral}. Lost: ${breakdown.lost}.`}
      >
        <span className="meter__seg meter__seg--pass-progressive" style={{ width: `${positivePct}%` }} />
        <span className="meter__seg meter__seg--pass-neutral" style={{ width: `${neutralPct}%` }} />
        <span className="meter__seg meter__seg--pass-lost" style={{ width: `${lostPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className="legend__dot legend__dot--pass-progressive" />
          <PlayTip label="Positive plays" tip={PLAY_TIPS.positive} />
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
          <PlayTip label="Lost plays" tip={PLAY_TIPS.lost} />
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
}: {
  label: string;
  positive: number;
  total: number;
  pctTone: "transition" | "possession";
}) {
  const pctLabel = `${percent(positive, total)}% progressive plays`;

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{label}</h3>
      <span className="metric-card__value">{positive}</span>
      <span
        className="metric-card__pct metric-card__pct--carry-rate"
        style={{ color: carryProgressiveRateColor(pctTone) }}
      >
        {pctLabel}
      </span>
      <p className="metric-card__caption">
        {positive} of {total} carries
      </p>
    </div>
  );
}

function CountStat({
  label,
  value,
  caption,
  highlight,
}: {
  label: string;
  value: number;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div className={`metric-card metric-card--compact${highlight ? " metric-card--highlight" : ""}`}>
      <h3 className="metric-card__title">{label}</h3>
      <span className="metric-card__value">{value}</span>
      <p className="metric-card__caption">{caption}</p>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, carries, finalThirdActions, meta } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);

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
                <h3 className="metric-card__title">Total carries</h3>
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
            />,
            <PositiveCarryStat
              key="possession"
              label="In possession"
              positive={carries.possessionPositive}
              total={carries.inPossession}
              pctTone="possession"
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
          <ActionResultsMeter title="Outcome breakdown" breakdown={finalThirdBreakdown} />
          <MetricFlow
            items={[
              <CountStat key="shots" label="Shots" value={finalThirdActions.shots} caption="Shots taken" highlight />,
              <CountStat
                key="pass-shot"
                label="Pass with shot opportunity"
                value={finalThirdActions.passWithShotOpportunity}
                caption="Passes leading to a shot chance"
                highlight
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
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo}>
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
