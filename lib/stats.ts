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
  passWithShotOpportunity: number;
  videoLink: string;
};

export type MatchStats = {
  id: string;
  kind: "session";
  label: string;
  shortLabel: string;
  logo: string;
  games?: number;
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
  };
  player: StatsReport["player"];
  match: {
    label: string;
    logo: string;
  };
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

/** Combined totals across every session match, with per-game averages in the UI. */
export function seasonMatch(matches: MatchStats[]): MatchStats {
  const sessions = matches.filter((match) => match.id !== "season");
  const sumCarries = (pick: (c: CarriesStats) => number) =>
    sessions.reduce((sum, match) => sum + pick(match.carries), 0);
  const sumFinal = (pick: (f: FinalThirdActionsStats) => number) =>
    sessions.reduce((sum, match) => sum + pick(match.finalThirdActions), 0);

  return {
    id: "season",
    kind: "session",
    label: "Season",
    shortLabel: "Season",
    logo: "",
    games: sessions.length,
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
      passWithShotOpportunity: sumFinal((f) => f.passWithShotOpportunity),
      videoLink: "",
    },
    videos: [],
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  const games = match.games ?? 1;
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}`,
      games,
    },
    player: report.player,
    match: {
      label: match.label,
      logo: match.logo,
    },
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
