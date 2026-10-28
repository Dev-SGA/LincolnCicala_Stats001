import { CountLine } from "@/components/CountLine";
import { formatCount, type GameStats } from "@/lib/stats";

type SeasonSummaryCardProps = {
  stats: GameStats;
  games: number;
};

type Tone = "accent" | "positive" | "negative" | "muted" | "warn";

function SeasonStat({
  label,
  total,
  unit,
  primary,
  tone,
}: {
  label: string;
  total: number;
  unit: string;
  primary?: boolean;
  tone?: Tone;
}) {
  const classes = ["season-stat", primary ? "season-stat--primary" : "", tone ? `season-stat--${tone}` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <span className="season-stat__label">{label}</span>
      <CountLine value={total} unit={unit} size={primary ? "hero" : "compact"} className="season-stat__count" />
    </div>
  );
}

function CarryMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="season-mini">
      <span className="season-mini__value">{formatCount(value)}</span>
      <span className="season-mini__label">{label}</span>
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
          <p className="season-card__meta">{stats.meta.perGame ? "Averages per game" : "Totals"}</p>
        </div>
        <span className="season-card__games">
          <span className="season-card__games-value">{games}</span>
          <span className="season-card__games-label">matches</span>
        </span>
      </div>

      <div className="season-card__primary">
        <SeasonStat label="Carries" total={carries.total} unit="carries" primary />
        <SeasonStat label="Final third actions" total={finalThirdActions.total} unit="actions" primary />
      </div>

      <div className="season-card__grid season-card__grid--outcomes">
        <SeasonStat label="Progressive plays" total={progressive} unit="plays" tone="positive" />
        <SeasonStat label="Lost plays" total={lost} unit="plays" tone="negative" />
        <SeasonStat label="Other" total={other} unit="plays" tone="muted" />
      </div>

      <div className="season-card__grid">
        <SeasonStat label="Shots" total={finalThirdActions.shots} unit="shots" tone="accent" />
        <SeasonStat label="Key passes" total={finalThirdActions.passWithShotOpportunity} unit="passes" tone="accent" />
      </div>

      <div className="season-card__breakdown">
        <span className="season-card__breakdown-title">Carries breakdown</span>
        <div className="season-card__breakdown-grid">
          <CarryMini label="Progressive carries" value={progressiveCarries} />
          <CarryMini label="In transition" value={carries.inTransition} />
          <CarryMini label="In possession" value={carries.inPossession} />
        </div>
      </div>
    </div>
  );
}
