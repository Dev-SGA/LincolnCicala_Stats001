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

function RateRing({ value, tone }: { value: number; tone: Tone }) {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(value, 100)) / 100) * circumference;
  return (
    <svg viewBox="0 0 64 64" className={`rate-ring rate-ring--${tone}`} aria-hidden="true">
      <circle cx={32} cy={32} r={radius} className="rate-ring__track" />
      <circle
        cx={32}
        cy={32}
        r={radius}
        className="rate-ring__fill"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}

function StatsFigure({
  label,
  value,
  unit,
  games,
  href,
}: {
  label: string;
  value: number;
  unit?: string;
  games?: number;
  href?: string;
}) {
  const fmt = useFormatCount();

  return (
    <div className="stats-figure">
      <span className="stats-figure__label">
        <ClipLabel label={label} href={href} />
      </span>
      {games && games > 1 && unit ? (
        <CountLine value={value} unit={unit} />
      ) : (
        <span className="stats-figure__value">{fmt(value)}</span>
      )}
    </div>
  );
}

function RateFigure({ label, rate, tone, caption }: { label: string; rate: number; tone: Tone; caption?: string }) {
  return (
    <div className={`stats-figure stats-figure--rate stats-figure--${tone}`}>
      <span className="stats-figure__label">{label}</span>
      <div className="stats-figure__rate">
        <RateRing value={rate} tone={tone} />
        <div className="stats-figure__rate-text">
          <span className="stats-figure__value">{rate}%</span>
          {caption ? <span className="stats-figure__caption">{caption}</span> : null}
        </div>
      </div>
    </div>
  );
}

type DuoSegment = { label: string; value: number; tone: Tone; href?: string };

/** Two-way outcome meter with in-bar shares and aligned chips below. */
function DuoSplit({ segments, label }: { segments: DuoSegment[]; label: string }) {
  const fmt = useFormatCount();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="stats-viz">
      <div className="meter meter--duo" role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}>
        {total === 0 ? (
          <span className="meter__seg meter__seg--muted" style={{ flex: "1 1 0" }} />
        ) : (
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => {
              const share = percent(segment.value, total);
              return (
                <span key={segment.label} className={`meter__seg meter__seg--${segment.tone}`} style={{ flex: `${segment.value} 1 0` }}>
                  {share >= 14 ? <span className="meter__pct">{share}%</span> : null}
                </span>
              );
            })
        )}
      </div>
      <ul className="outcome-grid">
        {segments.map((segment) => (
          <li key={segment.label} className={`outcome-chip outcome-chip--${segment.tone}${segment.value === 0 ? " is-empty" : ""}`}>
            <span className="outcome-chip__label">
              <span className={`legend__dot legend__dot--${segment.tone}`} />
              <ClipLabel label={segment.label} href={segment.href} />
            </span>
            <span className="outcome-chip__value">
              {fmt(segment.value)}
              <small>{percent(segment.value, total)}%</small>
            </span>
          </li>
        ))}
      </ul>
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
  segments,
}: {
  title: string;
  total: number;
  totalLabel: string;
  totalUnit: string;
  games?: number;
  rate: { label: string; value: number; tone: Tone; caption?: string };
  segments: DuoSegment[];
}) {
  return (
    <section className="stats-topic">
      <h3 className="stats-topic__title">{title}</h3>
      <div className="stats-topic__panel">
        <StatsFigure label={totalLabel} value={total} unit={totalUnit} games={games} />
        <RateFigure label={rate.label} rate={rate.value} tone={rate.tone} caption={rate.caption} />
        <DuoSplit segments={segments} label={`${title} breakdown`} />
      </div>
    </section>
  );
}

export function StatsSummaryBoard({
  summary,
  shots,
  games,
  videos,
}: {
  summary: MatchSummary;
  shots: number;
  games?: number;
  videos?: MatchStats["videos"];
}) {
  const fmt = useFormatCount();
  const offensiveTotal = summary.offensiveWon + summary.offensiveLost;
  const regains = summary.interceptions + summary.recoveries;

  return (
    <div className="stats-board-v2">
      <StatsRateTopic
        title="General Passing"
        total={summary.passes}
        totalLabel="Total passes"
        totalUnit="passes"
        games={games}
        rate={{
          label: "Accuracy",
          value: percent(summary.accurate, summary.passes),
          tone: "positive",
          caption: `${fmt(summary.accurate)} of ${fmt(summary.passes)} accurate`,
        }}
        segments={[
          { label: "Accurate", value: summary.accurate, tone: "positive" },
          { label: "Inaccurate", value: summary.inaccurate, tone: "negative" },
        ]}
      />
      <StatsRateTopic
        title="Offensive Duels"
        total={offensiveTotal}
        totalLabel="Total duels"
        totalUnit="duels"
        games={games}
        rate={{
          label: "Win rate",
          value: percent(summary.offensiveWon, offensiveTotal),
          tone: "positive",
          caption: `${fmt(summary.offensiveWon)} of ${fmt(offensiveTotal)} won`,
        }}
        segments={[
          {
            label: "Won",
            value: summary.offensiveWon,
            tone: "positive",
            href: clipUrl(videos, "Off. Duels Won", "Off Duels Won", "Offensive duels won"),
          },
          {
            label: "Lost",
            value: summary.offensiveLost,
            tone: "negative",
            href: clipUrl(videos, "Off. Duels Lost", "Off Duels Lost", "Offensive duels lost"),
          },
        ]}
      />
      <section className="stats-topic">
        <h3 className="stats-topic__title">Key Passes | Shots</h3>
        <div className="stats-topic__panel stats-topic__panel--duo">
          <StatsFigure
            label="Key passes"
            value={summary.keyPasses}
            unit="key passes"
            games={games}
            href={clipUrl(videos, "Key passes", "Passes with shot opportunity")}
          />
          <StatsFigure label="Shots" value={shots} unit="shots" games={games} href={clipUrl(videos, "Shots")} />
        </div>
      </section>
      <section className="stats-topic">
        <h3 className="stats-topic__title">Goals &amp; Assists</h3>
        <div className="stats-topic__panel stats-topic__panel--duo">
          <StatsFigure
            label="Goals"
            value={summary.goals}
            unit="goals"
            games={games}
            href={clipUrl(videos, "Goals")}
          />
          <StatsFigure
            label="Assists"
            value={summary.assists}
            unit="assists"
            games={games}
            href={clipUrl(videos, "Assists")}
          />
        </div>
      </section>
      <section className="stats-topic">
        <h3 className="stats-topic__title">Tackles</h3>
        <div className="stats-topic__panel stats-topic__panel--pair">
          <StatsFigure label="Total tackles" value={regains} unit="tackles" games={games} />
          <DuoSplit
            label="Tackles breakdown"
            segments={[
              { label: "Interceptions", value: summary.interceptions, tone: "accent", href: clipUrl(videos, "Interceptions") },
              { label: "Recoveries", value: summary.recoveries, tone: "recover", href: clipUrl(videos, "Recoveries") },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
