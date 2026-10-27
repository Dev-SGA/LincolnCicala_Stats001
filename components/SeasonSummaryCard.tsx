import { CountLine } from "@/components/CountLine";
import { perGame, type GameStats } from "@/lib/stats";

type SeasonSummaryCardProps = {
  stats: GameStats;
  games: number;
};

function SeasonStat({
  label,
  total,
  unit,
  games,
}: {
  label: string;
  total: number;
  unit: string;
  games: number;
}) {
  return (
    <div className="season-stat">
      <span className="season-stat__label">{label}</span>
      <CountLine value={total} unit={unit} games={games} className="season-stat__count" />
    </div>
  );
}

export function SeasonSummaryCard({ stats, games }: SeasonSummaryCardProps) {
  const { carries, finalThirdActions } = stats;
  const progressive = finalThirdActions.positive;
  const lost = finalThirdActions.lost;
  const other = finalThirdActions.neutral;

  return (
    <div className="metric-card metric-card--hero season-card">
      <div className="season-card__head">
        <h3 className="metric-card__title">Season</h3>
        <p className="season-card__meta">
          {games} matches · totals with per-game averages
        </p>
      </div>
      <div className="season-card__grid">
        <SeasonStat label="Carries" total={carries.total} unit="carries" games={games} />
        <SeasonStat label="Final third actions" total={finalThirdActions.total} unit="actions" games={games} />
        <SeasonStat label="Progressive plays" total={progressive} unit="plays" games={games} />
        <SeasonStat label="Lost plays" total={lost} unit="plays" games={games} />
        <SeasonStat label="Other" total={other} unit="plays" games={games} />
        <SeasonStat label="Shots" total={finalThirdActions.shots} unit="shots" games={games} />
        <SeasonStat label="Key passes" total={finalThirdActions.passWithShotOpportunity} unit="passes" games={games} />
      </div>
      <p className="season-card__carry-note">
        Carries: {carries.transitionPositive + carries.possessionPositive} progressive total (
        {perGame(carries.transitionPositive + carries.possessionPositive, games)} avg per game) ·{" "}
        {carries.inTransition} in transition ({perGame(carries.inTransition, games)} avg) · {carries.inPossession} in
        possession ({perGame(carries.inPossession, games)} avg)
      </p>
    </div>
  );
}
