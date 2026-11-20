"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { CountLine } from "@/components/CountLine";
import { CountDecimalsProvider, useFormatCount } from "@/components/CountFormat";
import { OutcomeCard } from "@/components/OutcomeCard";
import { StatsSummaryBoard } from "@/components/StatsSummaryBoard";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { ProgressView } from "@/components/ProgressView";
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
  unit,
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
  unit: string;
  major?: boolean;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <OutcomeCard
      className={major ? "metric-card--major" : "metric-card--compact"}
      title={title}
      total={primary + secondary}
      unit={unit}
      meterLabel={title}
      rows={[
        { key: "primary", tone: primaryTone, label: <ClipLegendLabel label={primaryLabel} href={primaryHref} />, value: primary, href: primaryHref },
        { key: "secondary", tone: secondaryTone, label: <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />, value: secondary, href: secondaryHref },
      ]}
    />
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
  games?: number;
}) {
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;
  const progressiveHref = clipUrl(videos, "Progressive plays Final third", "Progressive plays final third");
  const lostHref = clipUrl(videos, "Lost plays final third", "Lost plays Final third");

  return (
    <OutcomeCard
      title={title}
      total={total}
      unit="actions"
      rate={{ value: percent(breakdown.positive, total), label: "progressive" }}
      meterLabel="Progressive, lost and other plays"
      rows={[
        {
          key: "progressive",
          tone: "pass-progressive",
          label: <PlayTip label="Progressive plays" tip={PLAY_TIPS.progressive} href={progressiveHref} />,
          value: breakdown.positive,
          href: progressiveHref,
        },
        {
          key: "lost",
          tone: "pass-lost",
          label: <PlayTip label="Lost plays" tip={PLAY_TIPS.lost} href={lostHref} />,
          value: breakdown.lost,
          href: lostHref,
        },
        { key: "other", tone: "pass-neutral", label: <PlayTip label="Other" tip={PLAY_TIPS.neutral} />, value: breakdown.neutral },
      ]}
    />
  );
}

function KeyPassesCard({
  keyPasses,
  totalPasses,
  titleHref,
}: {
  keyPasses: number;
  totalPasses: number;
  titleHref?: string;
  games?: number;
}) {
  const otherPasses = Math.max(totalPasses - keyPasses, 0);

  return (
    <OutcomeCard
      title={<ClipMetricTitle label="Key passes" href={titleHref} />}
      total={keyPasses}
      unit="key passes"
      rate={{ value: percent(keyPasses, totalPasses), label: "of passes" }}
      meterLabel="Key passes and other passes"
      rows={[
        { key: "key", tone: "pass-progressive", label: <ClipLegendLabel label="Key passes" href={titleHref} />, value: keyPasses, href: titleHref },
        { key: "other", tone: "pass-neutral", label: <ClipLegendLabel label="Other passes" />, value: otherPasses },
      ]}
    />
  );
}

function PositiveCarryStat({
  label,
  positive,
  total,
  titleHref,
}: {
  label: string;
  positive: number;
  total: number;
  pctTone?: "transition" | "possession";
  titleHref?: string;
  games?: number;
}) {
  return (
    <OutcomeCard
      title={<ClipMetricTitle label={label} href={titleHref} />}
      total={total}
      unit="carries"
      rate={{ value: percent(positive, total), label: "progressive play" }}
      meterLabel={`${label} carries`}
      rows={[
        {
          key: "progressive",
          tone: "pass-progressive",
          label: <ClipLegendLabel label="Progressive play" href={titleHref} />,
          value: positive,
          href: titleHref,
        },
        { key: "other", tone: "pass-neutral", label: <ClipLegendLabel label="Other carries" />, value: Math.max(total - positive, 0) },
      ]}
    />
  );
}

function ShotsBreakdownCard({
  shots,
  titleHref,
}: {
  shots: GameStats["finalThirdActions"];
  titleHref?: string;
  games?: number;
}) {
  const onTarget = shots.shotsOnTarget ?? 0;
  const offTarget = shots.shotsOffTarget ?? Math.max(shots.shots - onTarget, 0);
  const insideBox = shots.shotsInsideBox ?? 0;
  const outsideBox = shots.shotsOutsideBox ?? Math.max(shots.shots - insideBox, 0);
  const accuracyTotal = onTarget + offTarget;
  const locationTotal = insideBox + outsideBox;

  return (
    <div className="split-layout">
      <OutcomeCard
        title={<ClipMetricTitle label="Shots" href={titleHref} />}
        total={accuracyTotal}
        unit="shots"
        rate={{ value: percent(onTarget, accuracyTotal), label: "on target" }}
        meterLabel="Shot accuracy"
        rows={[
          { key: "on", tone: "pass-progressive", label: <ClipLegendLabel label="On target" href={titleHref} />, value: onTarget, href: titleHref },
          { key: "off", tone: "pass-lost", label: <ClipLegendLabel label="Off target" href={titleHref} />, value: offTarget, href: titleHref },
        ]}
      />
      {shots.shotsInsideBox != null ? (
        <OutcomeCard
          title="Shot location"
          total={locationTotal}
          unit="shots"
          rate={{ value: percent(insideBox, locationTotal), label: "inside the box" }}
          meterLabel="Shot location"
          rows={[
            { key: "inside", tone: "accent", label: <ClipLegendLabel label="Inside the box" href={titleHref} />, value: insideBox, href: titleHref },
            { key: "outside", tone: "muted", label: <ClipLegendLabel label="Outside the box" href={titleHref} />, value: outsideBox, href: titleHref },
          ]}
        />
      ) : null}
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
  const fmt = (value: number) => formatCount(value, stats.meta.perGame);
  const { carries, finalThirdActions, videos, meta, summary } = stats;
  const games = meta.games;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
  const carriesClip = clipUrl(videos, "Carries");
  const transitionClip = clipUrl(videos, "Progressive plays in transition", "In transition");
  const possessionClip = clipUrl(videos, "Progressive play in possession", "In possession");
  const shotsClip = clipUrl(videos, "Shots");
  const keyPassesClip = clipUrl(videos, "Key passes", "Passes with shot opportunity", "Pass with shot opportunity");
  const hasShotDetail = finalThirdActions.shotsOnTarget != null;

  const topics: Topic[] = [];

  if (summary) {
    topics.push({
      id: "stats",
      title: "Stats",
      phase: "stats",
      content: <StatsSummaryBoard summary={summary} shots={finalThirdActions.shots} games={games} videos={videos} />,
    });
  }

  const carriesOverview = (
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
          unit="carries"
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
  );

  const carriesResults = (
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
  );

  topics.push(
    summary
      ? {
          id: "carries",
          title: "Carries",
          phase: "carrying",
          content: (
            <>
              {carriesOverview}
              {carriesResults}
            </>
          ),
        }
      : {
          id: "carries",
          title: "Carries",
          phase: "carrying",
          content: <>{carriesOverview}</>,
        },
  );

  if (!summary) {
    topics.push({
      id: "carries-results",
      title: "Carries Results",
      phase: "carrying",
      content: carriesResults,
    });
  }

  topics.push(
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
          {summary ? (
            <KeyPassesCard
              keyPasses={summary.keyPasses}
              totalPasses={summary.passes}
              titleHref={keyPassesClip}
              games={games}
            />
          ) : null}
          {hasShotDetail ? (
            <ShotsBreakdownCard shots={finalThirdActions} titleHref={shotsClip} games={games} />
          ) : (
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
          )}
        </>
      ),
    },
  );

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const [tab, setTab] = useState<"match" | "progress">("match");
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
              {tab === "progress" ? null : stats.match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stats.match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {tab === "progress" ? "Progress across matches" : stats.match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} clubLogo={player.clubLogo} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <div className="match-nav__pills view-tabs" role="tablist" aria-label="Report view">
                {(
                  [
                    { id: "match", label: "Match" },
                    { id: "progress", label: "Progress" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.id}
                    className={`match-nav__pill${tab === item.id ? " is-active" : ""}`}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {tab === "progress" ? (
                <ProgressView matches={matches} />
              ) : (
                <>
                  <MatchSwitcher matches={options} activeId={activeMatch.id} onChange={setMatchId}>
                    {isSeason ? <SeasonModeToggle mode={seasonMode} onChange={setSeasonMode} /> : null}
                  </MatchSwitcher>
                  <CountDecimalsProvider value={Boolean(stats.meta.perGame)}>
                    <TopicsBoard topics={topics} />
                  </CountDecimalsProvider>
                </>
              )}
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
