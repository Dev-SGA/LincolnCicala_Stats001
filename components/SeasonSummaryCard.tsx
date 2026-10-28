import { AvgPill, CountLine } from "@/components/CountLine";
import type { GameStats } from "@/lib/stats";

type SeasonSummaryCardProps = {
  stats: GameStats;
  games: number;
};

type Tone = "accent" | "positive" | "negative" | "muted" | "warn";

function SeasonStat({
  label,
  total,
  unit,
  games,
  primary,
  tone,
}: {
  label: string;
  total: number;
  unit: string;
  games: number;
  primary?: boolean;
  tone?: Tone;
}) {
  const classes = ["season-stat", primary ? "season-stat--primary" : "", tone ? `season-stat--${tone}` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <span className="season-stat__label">{label}</span>
      <CountLine value={total} unit={unit} games={games} size={primary ? "hero" : "compact"} className="season-stat__count" />
    </div>
  );
}

function CarryMini({ label, value, games }: { label: string; value: number; games: number }) {
  return (
    <div className="season-mini">
      <span className="season-mini__value">{value}</span>
      <span className="season-mini__label">{label}</span>
      <AvgPill value={value} games={games} className="avg-pill--mini" />
    </div>
  );
}

export function SeasonSummaryCard({ stats, games }: SeasonSummaryCardProps) {
  const { carries, finalThirdActions } = stats;
  const progressive = finalThirdActions.positive;
  const lost = finalThirdActions.lost;
  const other = finalThirdActions.neutral;
  const progressiveCarries = carries.transitionPositive + carries.possessionPositive;

  return (
    <div className="metric-card metric-card--hero season-card">
      <div className="season-card__head">
        <div>
          <h3 className="metric-card__title">Season</h3>
          <p className="season-card__meta">Totals with per-game averages</p>
        </div>
        <span className="season-card__games">
          <span className="season-card__games-value">{games}</span>
          <span className="season-card__games-label">matches</span>
        </span>
      </div>

      <div className="season-card__primary">
        <SeasonStat label="Carries" total={carries.total} unit="carries" games={games} primary />
        <SeasonStat label="Final third actions" total={finalThirdActions.total} unit="actions" games={games} primary />
      </div>

      <div className="season-card__grid season-card__grid--outcomes">
        <SeasonStat label="Progressive plays" total={progressive} unit="plays" games={games} tone="positive" />
        <SeasonStat label="Lost plays" total={lost} unit="plays" games={games} tone="negative" />
        <SeasonStat label="Other" total={other} unit="plays" games={games} tone="muted" />
      </div>

      <div className="season-card__grid">
        <SeasonStat label="Shots" total={finalThirdActions.shots} unit="shots" games={games} tone="accent" />
        <SeasonStat label="Key passes" total={finalThirdActions.passWithShotOpportunity} unit="passes" games={games} tone="accent" />
      </div>

      <div className="season-card__breakdown">
        <span className="season-card__breakdown-title">Carries breakdown</span>
        <div className="season-card__breakdown-grid">
          <CarryMini label="Progressive carries" value={progressiveCarries} games={games} />
          <CarryMini label="In transition" value={carries.inTransition} games={games} />
          <CarryMini label="In possession" value={carries.inPossession} games={games} />
        </div>
      </div>
    </div>
  );
}
