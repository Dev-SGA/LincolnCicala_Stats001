"use client";

import type { ReactNode } from "react";
import { useFormatCount } from "@/components/CountFormat";

export type OutcomeRow = {
  key: string;
  /** Meter/legend tone, e.g. "pass-progressive", "pass-lost", "pass-neutral", "accent", "warn", "muted". */
  tone: string;
  label: ReactNode;
  value: number;
  /** Clip that opens when the number is clicked. */
  href?: string;
  /** Text shown in the share column; defaults to the percentage of the card total. */
  share?: string;
};

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

type OutcomeCardProps = {
  title: ReactNode;
  total: number;
  unit: string;
  /** Pill next to the total, e.g. { value: 28, label: "progressive" }. */
  rate?: { value: number; label: string };
  rows: OutcomeRow[];
  meterLabel: string;
  className?: string;
};

/** Reads top to bottom: title, total and rate, one bar, then one row per outcome in bar order. */
export function OutcomeCard({ title, total, unit, rate, rows, meterLabel, className }: OutcomeCardProps) {
  const fmt = useFormatCount();
  const sum = rows.reduce((acc, row) => acc + row.value, 0);

  return (
    <div className={`metric-card pass-card${className ? ` ${className}` : ""}`}>
      <div className="pass-card__head">
        {typeof title === "string" ? <h3 className="metric-card__title">{title}</h3> : title}
        <div className="pass-card__kpis">
          <p className="pass-card__total">
            <strong>{fmt(total)}</strong>
            <span>{unit}</span>
          </p>
          {rate && total > 0 ? (
            <p className="pass-card__rate">
              <strong>{rate.value}%</strong>
              <span>{rate.label}</span>
            </p>
          ) : null}
        </div>
      </div>
      <div className="meter meter--tri" role="img" aria-label={`${meterLabel}: ${rows.map((row) => `${row.value}`).join(", ")}`}>
        {sum === 0 ? (
          <span className="meter__seg meter__seg--muted" style={{ flex: "1 1 0" }} />
        ) : (
          rows
            .filter((row) => row.value > 0)
            .map((row) => {
              const share = percent(row.value, sum);
              return (
                <span key={row.key} className={`meter__seg meter__seg--${row.tone}`} style={{ flex: `${row.value} 1 0` }}>
                  {share >= 14 ? <span className="meter__pct">{share}%</span> : null}
                </span>
              );
            })
        )}
      </div>
      <ul className="pass-rows">
        {rows.map((row) => {
          const share = percent(row.value, sum);
          return (
            <li key={row.key} className={`pass-row${row.value === 0 ? " is-empty" : ""}`}>
              <span className={`legend__dot legend__dot--${row.tone}`} />
              <span className="pass-row__label">{row.label}</span>
              <span className="pass-row__track">
                <span className={`pass-row__fill meter__seg--${row.tone}`} style={{ width: `${share}%` }} />
              </span>
              {row.href ? (
                <a className="pass-row__value" href={row.href} target="_blank" rel="noreferrer" aria-label="Open video clip">
                  {fmt(row.value)}
                </a>
              ) : (
                <strong className="pass-row__value">{fmt(row.value)}</strong>
              )}
              <span className="pass-row__share">{row.share ?? `${share}%`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
