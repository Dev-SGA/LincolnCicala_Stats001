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

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}`,
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
