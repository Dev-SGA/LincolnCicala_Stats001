"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  carriesVideoLink: string;
  setCarriesVideoLink: (value: string) => void;
  finalThirdActionsVideoLink: string;
  setFinalThirdActionsVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialCarriesVideoLink: string;
  initialFinalThirdActionsVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialCarriesVideoLink,
  initialFinalThirdActionsVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [carriesVideoLink, setCarriesVideoLink] = useState(initialCarriesVideoLink);
  const [finalThirdActionsVideoLink, setFinalThirdActionsVideoLink] = useState(initialFinalThirdActionsVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      carriesVideoLink,
      setCarriesVideoLink,
      finalThirdActionsVideoLink,
      setFinalThirdActionsVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          carries: { ...stats.carries, videoLink: carriesVideoLink },
          finalThirdActions: { ...stats.finalThirdActions, videoLink: finalThirdActionsVideoLink },
        };
      },
    }),
    [carriesVideoLink, finalThirdActionsVideoLink],
  );

  return <VideoLinksContext.Provider value={value}>{children}</VideoLinksContext.Provider>;
}

export function useVideoLinks(): VideoLinksContextValue {
  const ctx = useContext(VideoLinksContext);
  if (!ctx) {
    throw new Error("useVideoLinks must be used within VideoLinksProvider");
  }
  return ctx;
}
