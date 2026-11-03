import gameStats from "@/data/gameStats.json";

export type PlayResultBreakdown = {
  positive: number;
  neutral: number;
  lost: number;
};

export type CarriesStats = {
  total: number;
  inTransition: number;
  inPossession: number;
  transitionPositive: number;
  possessionPositive: number;
  videoLink: string;
};

export type FinalThirdActionsStats = {
  total: number;
  positive: number;
  neutral: number;
  lost: number;
  shots: number;
  /** Shot map, only tracked for some matches. */
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  shotsInsideBox?: number;
  shotsOutsideBox?: number;
  passWithShotOpportunity: number;
  videoLink: string;
};

/** High-level match numbers shown in the "Stats" summary topic. */
export type MatchSummary = {
  passes: number;
  accurate: number;
  inaccurate: number;
  keyPasses: number;
  offensiveWon: number;
  offensiveLost: number;
  interceptions: number;
  recoveries: number;
  goals: number;
  assists: number;
};

export type MatchStats = {
  id: string;
  kind: "session";
  label: string;
  shortLabel: string;
  logo: string;
  games?: number;
  /** Season numbers divided by the games played. */
  perGame?: boolean;
  summary?: MatchSummary;
  /** Games that contributed summary data (Season only). */
  summaryGames?: number;
  /** Games that contributed shot detail data (Season only). */
  shotGames?: number;
  carries: CarriesStats;
  finalThirdActions: FinalThirdActionsStats;
  videos?: { label: string; url: string }[];
};

export type StatsReport = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    clubLogo: string;
    photo: string;
  };
  matches: MatchStats[];
};

/** Shape consumed by the report UI and PDF export for one match. */
export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
    fileSlug?: string;
    games?: number;
    perGame?: boolean;
    summaryGames?: number;
  };
  player: StatsReport["player"];
  match: {
    label: string;
    logo: string;
  };
  summary?: MatchSummary;
  carries: CarriesStats;
  finalThirdActions: FinalThirdActionsStats;
  videos?: { label: string; url: string }[];
};

export function getStatsReport(): StatsReport {
  return gameStats as StatsReport;
}

/** Average per recorded game, with one decimal when it is not a whole number. */
export function perGame(total: number, games: number): string {
  const value = games > 0 ? total / games : 0;
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

/** Sum every field of a summary; partial summaries stay undefined so the topic is skipped. */
function combineSummaries(summaries: MatchSummary[]): MatchSummary | undefined {
  if (summaries.length === 0) return undefined;
  return summaries.reduce((sum, item) => ({
    passes: sum.passes + item.passes,
    accurate: sum.accurate + item.accurate,
    inaccurate: sum.inaccurate + item.inaccurate,
    keyPasses: sum.keyPasses + item.keyPasses,
    offensiveWon: sum.offensiveWon + item.offensiveWon,
    offensiveLost: sum.offensiveLost + item.offensiveLost,
    interceptions: sum.interceptions + item.interceptions,
    recoveries: sum.recoveries + item.recoveries,
    goals: sum.goals + item.goals,
    assists: sum.assists + item.assists,
  }));
}

/** Combined totals across every session match, with per-game averages in the UI. */
export function seasonMatch(matches: MatchStats[]): MatchStats {
  const sessions = matches.filter((match) => match.id !== "season");
  const sumCarries = (pick: (c: CarriesStats) => number) =>
    sessions.reduce((sum, match) => sum + pick(match.carries), 0);
  const sumFinal = (pick: (f: FinalThirdActionsStats) => number) =>
    sessions.reduce((sum, match) => sum + pick(match.finalThirdActions), 0);
  const summaries = sessions.flatMap((match) => (match.summary ? [match.summary] : []));

  return {
    id: "season",
    kind: "session",
    label: "Season",
    shortLabel: "Season",
    logo: "",
    games: sessions.length,
    summary: summaries.length > 0 ? combineSummaries(summaries) : undefined,
    summaryGames: summaries.length > 0 ? summaries.length : undefined,
    shotGames: sessions.some((match) => match.finalThirdActions.shotsOnTarget != null)
      ? sessions.filter((match) => match.finalThirdActions.shotsOnTarget != null).length
      : undefined,
    carries: {
      total: sumCarries((c) => c.total),
      inTransition: sumCarries((c) => c.inTransition),
      inPossession: sumCarries((c) => c.inPossession),
      transitionPositive: sumCarries((c) => c.transitionPositive),
      possessionPositive: sumCarries((c) => c.possessionPositive),
      videoLink: "",
    },
    finalThirdActions: {
      total: sumFinal((f) => f.total),
      positive: sumFinal((f) => f.positive),
      neutral: sumFinal((f) => f.neutral),
      lost: sumFinal((f) => f.lost),
      shots: sumFinal((f) => f.shots),
      ...(sessions.some((match) => match.finalThirdActions.shotsOnTarget != null)
        ? {
            shotsOnTarget: sumFinal((f) => f.shotsOnTarget ?? 0),
            shotsOffTarget: sumFinal((f) => f.shotsOffTarget ?? 0),
            shotsInsideBox: sumFinal((f) => f.shotsInsideBox ?? 0),
            shotsOutsideBox: sumFinal((f) => f.shotsOutsideBox ?? 0),
          }
        : {}),
      passWithShotOpportunity: sumFinal((f) => f.passWithShotOpportunity),
      videoLink: "",
    },
    videos: [],
  };
}

/** Whole numbers stay as they are; averages show one decimal, or always one when `fixed` (per-game Season). */
export function formatCount(value: number, fixed = false): string {
  if (fixed) return value.toFixed(1);
  if (Number.isInteger(value)) return String(value);
  return (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

function scaleNumbers<T>(value: T, factor: number): T {
  if (typeof value === "number") return (value * factor) as T;
  if (Array.isArray(value) || value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, scaleNumbers(item, factor)]),
  ) as T;
}

/** Season match with every absolute number divided by the games played. Shares stay the same. */
export function perGameMatch(season: MatchStats): MatchStats {
  const games = season.games ?? 0;
  const factor = games > 0 ? 1 / games : 0;

  return {
    ...season,
    label: "Season · Per game",
    summary: scaleNumbers(season.summary, season.summaryGames ? 1 / season.summaryGames : factor),
    carries: scaleNumbers(season.carries, factor),
    finalThirdActions: {
      ...scaleNumbers(season.finalThirdActions, factor),
      ...(season.shotGames
        ? {
            shotsOnTarget: (season.finalThirdActions.shotsOnTarget ?? 0) / season.shotGames,
            shotsOffTarget: (season.finalThirdActions.shotsOffTarget ?? 0) / season.shotGames,
            shotsInsideBox: (season.finalThirdActions.shotsInsideBox ?? 0) / season.shotGames,
            shotsOutsideBox: (season.finalThirdActions.shotsOutsideBox ?? 0) / season.shotGames,
          }
        : {}),
    },
    perGame: true,
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  const games = match.games ?? 1;
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}${match.perGame ? "-per-game" : ""}`,
      games,
      perGame: match.perGame,
      summaryGames: match.summaryGames,
    },
    player: report.player,
    match: {
      label: match.label,
      logo: match.logo,
    },
    summary: match.summary,
    carries: match.carries,
    finalThirdActions: match.finalThirdActions,
    videos: match.videos,
  };
}

export function clipUrl(videos: { label: string; url: string }[] | undefined, ...aliases: string[]): string | undefined {
  if (!videos?.length) return undefined;
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set(aliases.map(normalize));
  return videos.find((video) => keys.has(normalize(video.label)))?.url;
}

export function getFinalThirdBreakdown(stats: GameStats): PlayResultBreakdown {
  const { positive, neutral, lost } = stats.finalThirdActions;
  return { positive, neutral, lost };
}
