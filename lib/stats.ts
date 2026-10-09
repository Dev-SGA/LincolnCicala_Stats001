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
    photo: string;
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
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}

export function getFinalThirdBreakdown(stats: GameStats): PlayResultBreakdown {
  const { positive, neutral, lost } = stats.finalThirdActions;
  return { positive, neutral, lost };
}
