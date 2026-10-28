"use client";

import { createContext, useContext } from "react";
import { formatCount } from "@/lib/stats";

const CountDecimalsContext = createContext(false);

/** Per-game Season numbers always show two decimals. */
export const CountDecimalsProvider = CountDecimalsContext.Provider;

export function useFormatCount(): (value: number) => string {
  const fixed = useContext(CountDecimalsContext);
  return (value: number) => formatCount(value, fixed);
}
