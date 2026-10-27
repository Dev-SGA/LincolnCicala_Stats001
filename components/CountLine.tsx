import { perGame } from "@/lib/stats";

type CountLineProps = {
  value: number;
  unit: string;
  games?: number;
  className?: string;
};

/** Season readout: "16 carries | 8 avg per game". */
export function CountLine({ value, unit, games, className }: CountLineProps) {
  if (!games || games <= 1) {
    return (
      <p className={`count-line count-line--single${className ? ` ${className}` : ""}`}>
        <span className="count-line__main">
          {value} {unit}
        </span>
      </p>
    );
  }

  return (
    <p className={`count-line${className ? ` ${className}` : ""}`}>
      <span className="count-line__main">
        {value} {unit}
      </span>
      <span className="count-line__sep" aria-hidden="true">
        |
      </span>
      <span className="count-line__avg">{perGame(value, games)} avg per game</span>
    </p>
  );
}
