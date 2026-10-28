"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { CountLine } from "@/components/CountLine";
import { SeasonSummaryCard } from "@/components/SeasonSummaryCard";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND, carryProgressiveRateColor } from "@/lib/brand";
import {
  clipUrl,
  formatCount,
  getFinalThirdBreakdown,
  perGameMatch,
  seasonMatch,
  toGameStats,
  type GameStats,
  type MatchStats,
  type PlayResultBreakdown,
  type StatsReport,
} from "@/lib/stats";

type GameStatsReportProps = {
  report: StatsReport;
};

type BarTone = "accent" | "positive" | "negative" | "muted" | "warn";

const PLAY_TIPS = {
  progressive:
    "Progressive Play — An action that progresses the attack, creates a scoring opportunity, or breaks defensive lines in the final third.",
  neutral:
    "Other — Finding a teammate without a clear opportunity to progress the ball, but with a clear option to maintain possession.",
  lost: "Lost Play — Losing possession or failing to advance through an inaccurate action or immediate pressure.",
} as const;

function PlayTip({ label, tip, href }: { label: string; tip: string; href?: string }) {
  const className = `pass-play-tip legend__label${href ? " pass-play-tip--clip clip-link--hit" : ""}`;
  if (href) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noreferrer"
        data-tip={tip}
        aria-label={`Open video: ${label}. ${tip}`}
      >
        <span className="pass-play-tip__label">
          {label}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/play-icon.png" alt="" className="play-icon" width={14} height={14} />
        </span>
      </a>
    );
  }
  return (
    <button type="button" className={className} data-tip={tip} aria-label={`${label}. ${tip}`}>
      <span className="pass-play-tip__label">{label}</span>
    </button>
  );
}

function ClipAnchor({
  href,
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a
      className={["clip-link", "clip-link--hit", className].filter(Boolean).join(" ")}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? "Open video clip"}
    >
      {children}
    </a>
  );
}

function ClipLegendLabel({ label, href }: { label: string; href?: string }) {
  if (!href) return <span className="legend__label">{label}</span>;
  return (
    <ClipAnchor href={href} className="legend__label" ariaLabel={`Open video: ${label}`}>
      {label}
    </ClipAnchor>
  );
}

function ClipMetricTitle({ label, href }: { label: string; href?: string }) {
  if (!href) return <h3 className="metric-card__title">{label}</h3>;
  return (
    <h3 className="metric-card__title">
      <ClipAnchor href={href} ariaLabel={`Open video: ${label}`}>
        {label}
      </ClipAnchor>
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
            {formatCount(primary)} · {percent(primary, total)}%
          </strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />
          <strong>
            {formatCount(secondary)} · {percent(secondary, total)}%
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
  games,
}: {
  title: string;
  breakdown: PlayResultBreakdown;
  videos?: GameStats["videos"];
  games?: number;
}) {
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;
  const positivePct = percent(breakdown.positive, total);
  const neutralPct = percent(breakdown.neutral, total);
  const lostPct = percent(breakdown.lost, total);
  const progressiveHref = clipUrl(videos, "Progressive plays Final third", "Progressive plays final third");
  const lostHref = clipUrl(videos, "Lost plays final third", "Lost plays Final third");

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <CountLine value={total} unit="actions" className="metric-card__headline" />
      <div
        className="meter"
        role="img"
        aria-label={`Progressive: ${breakdown.positive}. Lost: ${breakdown.lost}. Other: ${breakdown.neutral}.`}
      >
        <span className="meter__seg meter__seg--pass-progressive" style={{ width: `${positivePct}%` }} />
        <span className="meter__seg meter__seg--pass-lost" style={{ width: `${lostPct}%` }} />
        <span className="meter__seg meter__seg--pass-neutral" style={{ width: `${neutralPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className="legend__dot legend__dot--pass-progressive" />
          <PlayTip label="Progressive plays" tip={PLAY_TIPS.progressive} href={progressiveHref} />
          <ClipAnchor href={progressiveHref} className="legend__clip-stat" ariaLabel="Open video: Progressive plays">
            {formatCount(breakdown.positive)} · {positivePct}%
          </ClipAnchor>
        </li>
        <li>
          <span className="legend__dot legend__dot--pass-lost" />
          <PlayTip label="Lost plays" tip={PLAY_TIPS.lost} href={lostHref} />
          <ClipAnchor href={lostHref} className="legend__clip-stat" ariaLabel="Open video: Lost plays">
            {formatCount(breakdown.lost)} · {lostPct}%
          </ClipAnchor>
        </li>
        <li>
          <span className="legend__dot legend__dot--pass-neutral" />
          <PlayTip label="Other" tip={PLAY_TIPS.neutral} />
          <strong>
            {formatCount(breakdown.neutral)} · {neutralPct}%
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
  games,
}: {
  label: string;
  positive: number;
  total: number;
  pctTone: "transition" | "possession";
  titleHref?: string;
  games?: number;
}) {
  const pctLabel = `${percent(positive, total)}% progressive play`;

  return (
    <div className="metric-card">
      <ClipMetricTitle label={label} href={titleHref} />
      <div className="carry-result">
        <div className="carry-result__figure">
          <span className="metric-card__value">{formatCount(total)}</span>
          <span className="carry-result__label">Total</span>
        </div>
        {titleHref ? (
          <ClipAnchor href={titleHref} className="carry-result__figure carry-result__figure--clip" ariaLabel={`Open video: ${label} progressive play`}>
            <span className="metric-card__value" style={{ color: carryProgressiveRateColor(pctTone) }}>
              {formatCount(positive)}
            </span>
            <span className="carry-result__label carry-result__label--clip">Progressive play</span>
          </ClipAnchor>
        ) : (
          <div className="carry-result__figure">
            <span className="metric-card__value" style={{ color: carryProgressiveRateColor(pctTone) }}>
              {formatCount(positive)}
            </span>
            <span className="carry-result__label">Progressive play</span>
          </div>
        )}
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
  unit,
  caption,
  highlight,
  titleHref,
  games,
  perGame,
}: {
  label: string;
  value: number;
  unit?: string;
  caption: string;
  highlight?: boolean;
  titleHref?: string;
  games?: number;
  perGame?: boolean;
}) {
  const seasonCaption =
    games && games > 1 ? `${caption} · ${perGame ? `average per game across ${games} matches` : `${games} matches combined`}` : caption;

  return (
    <div className={`metric-card metric-card--compact${highlight ? " metric-card--highlight" : ""}`}>
      <ClipMetricTitle label={label} href={titleHref} />
      {games && games > 1 ? (
        <CountLine value={value} unit={unit ?? ""} className="metric-card__count-line" />
      ) : (
        <ClipAnchor href={titleHref} className="metric-card__value clip-link--value" ariaLabel={`Open video: ${label}`}>
          {value}
        </ClipAnchor>
      )}
      <p className="metric-card__caption">{seasonCaption}</p>
    </div>
  );
}

type SeasonMode = "total" | "perGame";

function SeasonModeToggle({ mode, onChange }: { mode: SeasonMode; onChange: (mode: SeasonMode) => void }) {
  const items: { id: SeasonMode; label: string }[] = [
    { id: "total", label: "Total" },
    { id: "perGame", label: "Per game" },
  ];

  return (
    <div className="match-nav__pills season-mode" role="group" aria-label="Season numbers">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`match-nav__pill${item.id === mode ? " is-active" : ""}`}
          aria-pressed={item.id === mode}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MatchSwitcher({
  matches,
  activeId,
  onChange,
  children,
}: {
  matches: MatchStats[];
  activeId: string;
  onChange: (id: string) => void;
  children?: React.ReactNode;
}) {
  const index = matches.findIndex((match) => match.id === activeId);

  return (
    <div className="match-nav">
      <div className="match-nav__session" role="group" aria-label="Matches">
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index - 1].id)}
          disabled={index <= 0}
          aria-label="Previous match"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="match-nav__pills">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`match-nav__pill${match.id === activeId ? " is-active" : ""}`}
              aria-pressed={match.id === activeId}
              onClick={() => onChange(match.id)}
            >
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--pill" />
              ) : null}
              {match.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index + 1].id)}
          disabled={index < 0 || index === matches.length - 1}
          aria-label="Next match"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function buildTopics(stats: GameStats, isSeason: boolean): Topic[] {
  const { carries, finalThirdActions, videos, meta } = stats;
  const games = meta.games;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
  const carriesClip = clipUrl(videos, "Carries");
  const transitionClip = clipUrl(videos, "Progressive plays in transition", "In transition");
  const possessionClip = clipUrl(videos, "Progressive play in possession", "In possession");
  const shotsClip = clipUrl(videos, "Shots");
  const keyPassesClip = clipUrl(videos, "Key passes", "Passes with shot opportunity", "Pass with shot opportunity");

  const topics: Topic[] = [];

  if (isSeason && games && games > 1) {
    topics.push({
      id: "season",
      title: "Season",
      phase: "stats",
      content: <SeasonSummaryCard stats={stats} games={games} />,
    });
  }

  topics.push(
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
                {games && games > 1 ? (
                  <CountLine value={carries.total} unit="carries" size="hero" className="metric-card__count-line" />
                ) : (
                  <ClipAnchor href={carriesClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Total carries">
                    {carries.total}
                  </ClipAnchor>
                )}
                <p className="metric-card__caption">
                  {games && games > 1 ? (meta.perGame ? `Average carries per game across ${games} matches` : `Carries tracked across ${games} matches`) : "Carries tracked in the match"}
                </p>
              </div>,
              <SplitMeter
                key="split"
                title="Phase context"
                headline={`${formatCount(carries.inTransition)} in transition · ${formatCount(carries.inPossession)} in possession`}
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
              games={games}
            />,
            <PositiveCarryStat
              key="possession"
              label="In possession"
              positive={carries.possessionPositive}
              total={carries.inPossession}
              pctTone="possession"
              titleHref={possessionClip}
              games={games}
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
            {games && games > 1 ? (
              <CountLine value={finalThirdActions.total} unit="actions" size="hero" className="metric-card__count-line" />
            ) : (
              <span className="metric-card__value">{finalThirdActions.total}</span>
            )}
            <p className="metric-card__caption">Actions in the final third</p>
          </div>
          <ActionResultsMeter title="Outcome breakdown" breakdown={finalThirdBreakdown} videos={videos} games={games} />
          <MetricFlow
            items={[
              <CountStat
                key="shots"
                label="Shots"
                value={finalThirdActions.shots}
                unit="shots"
                caption="Shots taken"
                highlight
                titleHref={shotsClip}
                games={games}
                perGame={meta.perGame}
              />,
              <CountStat
                key="key-passes"
                label="Key passes"
                value={finalThirdActions.passWithShotOpportunity}
                unit="passes"
                caption="Key passes in the final third"
                highlight
                titleHref={keyPassesClip}
                games={games}
                perGame={meta.perGame}
              />,
            ]}
          />
        </>
      ),
    },
  );

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const [seasonMode, setSeasonMode] = useState<SeasonMode>("total");
  const options = useMemo(() => {
    const season = seasonMatch(matches);
    return [...matches, seasonMode === "perGame" ? perGameMatch(season) : season];
  }, [matches, seasonMode]);
  const initialMatchId = matches[0]?.id ?? "";
  const [matchId, setMatchId] = useState(initialMatchId);
  const activeMatch = options.find((match) => match.id === matchId) ?? options[0];
  const stats = useMemo(() => (activeMatch ? toGameStats(report, activeMatch) : null), [report, activeMatch]);
  const isSeason = activeMatch?.id === "season";
  const topics = useMemo(() => (stats ? buildTopics(stats, isSeason) : []), [stats, isSeason]);

  if (!stats || !activeMatch) {
    return null;
  }

  return (
    <VideoLinksProvider
      key={activeMatch.id}
      initialCarriesVideoLink={activeMatch.carries.videoLink}
      initialFinalThirdActionsVideoLink={activeMatch.finalThirdActions.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {stats.match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stats.match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {stats.match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} clubLogo={player.clubLogo} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <MatchSwitcher matches={options} activeId={activeMatch.id} onChange={setMatchId}>
                {isSeason ? <SeasonModeToggle mode={seasonMode} onChange={setSeasonMode} /> : null}
              </MatchSwitcher>
              <TopicsBoard topics={topics} />
            </div>
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
