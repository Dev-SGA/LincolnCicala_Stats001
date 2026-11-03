import { CountLine } from "@/components/CountLine";
import { useFormatCount } from "@/components/CountFormat";
import { clipUrl, type MatchStats, type MatchSummary } from "@/lib/stats";

type Tone = "positive" | "negative" | "accent" | "recover" | "warn" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function ClipLabel({ label, href }: { label: string; href?: string }) {
  if (!href) return <span>{label}</span>;
  return (
    <a className="clip-link" href={href} target="_blank" rel="noreferrer">
      {label}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/play-icon.png" alt="" className="play-icon" width={14} height={14} />
    </a>
  );
}

function ExploreBar({
  primary,
  secondary,
  primaryTone,
  secondaryTone,
  label,
}: {
  primary: number;
  secondary: number;
  primaryTone: Tone;
  secondaryTone: Tone;
  label: string;
}) {
  const total = primary + secondary;
  const primaryPct = total > 0 ? (primary / total) * 100 : 0;

  return (
    <div className="stats-bar" role="img" aria-label={label}>
      {total === 0 ? (
        <span className="stats-bar__seg stats-bar__seg--muted" style={{ width: "100%" }} />
      ) : (
        <>
          <span className={`stats-bar__seg stats-bar__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
          <span className={`stats-bar__seg stats-bar__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
        </>
      )}
    </div>
  );
}

function StatsSplit({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  primaryHref,
  secondaryHref,
  showShare = true,
}: {
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: Tone;
  secondaryTone: Tone;
  primaryHref?: string;
  secondaryHref?: string;
  showShare?: boolean;
}) {
  const fmt = useFormatCount();
  const total = primary + secondary;
  const primaryPct = percent(primary, total);
  const secondaryPct = total > 0 ? 100 - primaryPct : 0;
  const figure = (value: number, share: number) => (showShare ? `${fmt(value)} · ${share}%` : fmt(value));

  return (
    <div className="stats-viz">
      <ExploreBar
        primary={primary}
        secondary={secondary}
        primaryTone={primaryTone}
        secondaryTone={secondaryTone}
        label={`${primaryLabel} ${primary}. ${secondaryLabel} ${secondary}.`}
      />
      <ul className="stats-viz__legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <ClipLabel label={primaryLabel} href={primaryHref} />
          <strong>{figure(primary, primaryPct)}</strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <ClipLabel label={secondaryLabel} href={secondaryHref} />
          <strong>{figure(secondary, secondaryPct)}</strong>
        </li>
      </ul>
    </div>
  );
}

function StatsFigure({
  label,
  value,
  unit,
  games,
  rate,
}: {
  label: string;
  value: number;
  unit?: string;
  games?: number;
  rate?: boolean;
}) {
  const fmt = useFormatCount();

  return (
    <div className={`stats-figure${rate ? " stats-figure--rate" : ""}`}>
      <span className="stats-figure__label">{label}</span>
      {games && games > 1 && unit ? (
        <CountLine value={value} unit={unit} />
      ) : (
        <span className="stats-figure__value">{rate ? `${fmt(value)}%` : fmt(value)}</span>
      )}
    </div>
  );
}

function StatsRateTopic({
  title,
  total,
  totalLabel,
  totalUnit,
  games,
  rate,
  rateLabel,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  primaryHref,
  secondaryHref,
  showShare = true,
}: {
  title: string;
  total: number;
  totalLabel: string;
  totalUnit: string;
  games?: number;
  rate: number;
  rateLabel: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: Tone;
  secondaryTone: Tone;
  primaryHref?: string;
  secondaryHref?: string;
  showShare?: boolean;
}) {
  return (
    <section className="stats-topic">
      <h3 className="stats-topic__title">{title}</h3>
      <div className="stats-topic__panel">
        <StatsFigure label={totalLabel} value={total} unit={totalUnit} games={games} />
        <StatsFigure label={rateLabel} value={rate} rate />
        <StatsSplit
          primary={primary}
          secondary={secondary}
          primaryLabel={primaryLabel}
          secondaryLabel={secondaryLabel}
          primaryTone={primaryTone}
          secondaryTone={secondaryTone}
          primaryHref={primaryHref}
          secondaryHref={secondaryHref}
          showShare={showShare}
        />
      </div>
    </section>
  );
}

export function StatsSummaryBoard({
  summary,
  games,
  videos,
}: {
  summary: MatchSummary;
  games?: number;
  videos?: MatchStats["videos"];
}) {
  const offensiveTotal = summary.offensiveWon + summary.offensiveLost;
  const regains = summary.interceptions + summary.recoveries;
  const otherPasses = Math.max(summary.passes - summary.keyPasses, 0);

  return (
    <div className="stats-board-v2">
      <StatsRateTopic
        title="General Passing"
        total={summary.passes}
        totalLabel="Total passes"
        totalUnit="passes"
        games={games}
        rate={percent(summary.accurate, summary.passes)}
        rateLabel="Accurate"
        primary={summary.accurate}
        secondary={summary.inaccurate}
        primaryLabel="Accurate"
        secondaryLabel="Inaccurate"
        primaryTone="positive"
        secondaryTone="negative"
        showShare={false}
      />
      <StatsRateTopic
        title="Offensive Duels"
        total={offensiveTotal}
        totalLabel="Total duels"
        totalUnit="duels"
        games={games}
        rate={percent(summary.offensiveWon, offensiveTotal)}
        rateLabel="Won rate"
        primary={summary.offensiveWon}
        secondary={summary.offensiveLost}
        primaryLabel="Won"
        secondaryLabel="Lost"
        primaryTone="positive"
        secondaryTone="negative"
        primaryHref={clipUrl(videos, "Off. Duels Won", "Off Duels Won", "Offensive duels won")}
        secondaryHref={clipUrl(videos, "Off. Duels Lost", "Off Duels Lost", "Offensive duels lost")}
        showShare={false}
      />
      <section className="stats-topic">
        <h3 className="stats-topic__title">Tackles</h3>
        <div className="stats-topic__panel stats-topic__panel--pair">
          <StatsFigure label="Total tackles" value={regains} unit="tackles" games={games} />
          <StatsSplit
            primary={summary.interceptions}
            secondary={summary.recoveries}
            primaryLabel="Interceptions"
            secondaryLabel="Recoveries"
            primaryTone="accent"
            secondaryTone="recover"
            primaryHref={clipUrl(videos, "Interceptions")}
            secondaryHref={clipUrl(videos, "Recoveries")}
          />
        </div>
      </section>
      <StatsRateTopic
        title="Key Passes"
        total={summary.keyPasses}
        totalLabel="Key passes"
        totalUnit="key passes"
        games={games}
        rate={percent(summary.keyPasses, summary.passes)}
        rateLabel="Of all passes"
        primary={summary.keyPasses}
        secondary={otherPasses}
        primaryLabel="Key passes"
        secondaryLabel="Other passes"
        primaryTone="positive"
        secondaryTone="muted"
        primaryHref={clipUrl(videos, "Key passes", "Passes with shot opportunity")}
        showShare={false}
      />
      <section className="stats-topic">
        <h3 className="stats-topic__title">Goals &amp; Assists</h3>
        <div className="stats-topic__panel stats-topic__panel--duo">
          <StatsFigure label="Goals" value={summary.goals} unit="goals" games={games} />
          <StatsFigure label="Assists" value={summary.assists} unit="assists" games={games} />
        </div>
      </section>
    </div>
  );
}
