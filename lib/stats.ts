import gameStats from "@/data/gameStats.json";

export type PlayResultBreakdown = {
  positive: number;
  neutral: number;
  lost: number;
};

export type GameStats = {
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
  match: {
    label: string;
    logo: string;
  };
  carries: {
    total: number;
    inTransition: number;
    inPossession: number;
    transitionPositive: number;
    possessionPositive: number;
    videoLink: string;
  };
  finalThirdActions: {
    total: number;
    positive: number;
    neutral: number;
    lost: number;
    shots: number;
    passWithShotOpportunity: number;
    videoLink: string;
  };
  videos?: { label: string; url: string }[];
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
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
