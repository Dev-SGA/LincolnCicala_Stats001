import { BRAND } from "@/lib/brand";
import type { GameStats, PlayResultBreakdown } from "@/lib/stats";
import { getFinalThirdBreakdown } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Tone = "blue" | "red" | "strong-red" | "warn" | "pass-progressive" | "pass-neutral" | "pass-lost";

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function StatTiles({
  items,
}: {
  items: {
    label: string;
    value: number;
    tone?: Tone;
    detail?: string;
    detailTone?: "carry-transition" | "carry-possession";
    emphasizeDetail?: boolean;
    highlight?: boolean;
  }[];
}) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li
          key={item.label}
          className={`spdf-stat${item.emphasizeDetail ? " spdf-stat--emphasis" : ""}${item.highlight ? " spdf-stat--highlight" : ""}`}
        >
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? (
            <span
              className={`spdf-stat__detail${item.emphasizeDetail ? " spdf-stat__detail--emphasis" : ""}${item.detailTone ? ` spdf-stat__detail--${item.detailTone}` : ""}`}
            >
              {item.detail}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ActionResultPanel({ title, breakdown }: { title: string; breakdown: PlayResultBreakdown }) {
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;
  const segments = [
    { value: breakdown.positive, tone: "pass-progressive" as const },
    { value: breakdown.neutral, tone: "pass-neutral" as const },
    { value: breakdown.lost, tone: "pass-lost" as const },
  ];

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">{title}</p>
        <span className="spdf-pass-panel__total">{total} actions</span>
      </div>
      <div className="spdf-pass-panel__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-pass-panel__seg spdf-pass-panel__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="spdf-pass-panel__legend">
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-progressive" />
          <span className="spdf-pass-panel__legend-label">Positive</span>
          <strong>
            {breakdown.positive} · {pct(breakdown.positive, total)}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-neutral" />
          <span className="spdf-pass-panel__legend-label">Neutral</span>
          <strong>
            {breakdown.neutral} · {pct(breakdown.neutral, total)}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-lost" />
          <span className="spdf-pass-panel__legend-label">Lost</span>
          <strong>
            {breakdown.lost} · {pct(breakdown.lost, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

type PdfPhase = "carrying" | "final-third";

const PDF_PHASE_LABEL: Record<PdfPhase, string> = {
  carrying: "Carrying",
  "final-third": "Final Third",
};

function PdfSection({
  title,
  kpi,
  unit,
  children,
  footer,
  size = "md",
  phase = "carrying",
}: {
  title: string;
  kpi: number;
  unit: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
  phase?: PdfPhase;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase} spdf-section--${size}`}>
      <div className="spdf-section__top">
        <p className="spdf-section__phase">{PDF_PHASE_LABEL[phase]}</p>
        <h3 className="spdf-section__title">{title}</h3>
      </div>
      <div className="spdf-section__content">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{kpi}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__panel">{children}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, carries, finalThirdActions } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-stack">
          <section className="spdf-section spdf-section--carrying spdf-section--pressure">
            <div className="spdf-section__top">
              <p className="spdf-section__phase">Carrying</p>
              <h3 className="spdf-section__title">Carries</h3>
            </div>
            <div className="spdf-pressure">
              <div className="spdf-pressure__total">
                <span className="spdf-pressure__kicker">Total carries</span>
                <span className="spdf-pressure__value">{carries.total}</span>
                <span className="spdf-pressure__caption">Carries tracked in the match</span>
              </div>
              <div className="spdf-pressure__context">
                <p className="spdf-pressure__kicker">Phase context</p>
                <p className="spdf-pressure__headline">
                  {carries.inTransition} in transition · {carries.inPossession} in possession
                </p>
                <div className="spdf-pressure__track">
                  <span
                    className="spdf-pressure__seg spdf-pressure__seg--warn"
                    style={{ width: `${pct(carries.inTransition, carries.total)}%` }}
                  />
                  <span
                    className="spdf-pressure__seg spdf-pressure__seg--blue"
                    style={{ width: `${pct(carries.inPossession, carries.total)}%` }}
                  />
                </div>
                <ul className="spdf-pressure__legend">
                  <li>
                    <span className="spdf-pressure__dot spdf-pressure__dot--warn" />
                    <span>In transition</span>
                    <strong>
                      {carries.inTransition} · {pct(carries.inTransition, carries.total)}%
                    </strong>
                  </li>
                  <li>
                    <span className="spdf-pressure__dot spdf-pressure__dot--blue" />
                    <span>In possession</span>
                    <strong>
                      {carries.inPossession} · {pct(carries.inPossession, carries.total)}%
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <PdfSection title="Carries Results" kpi={carries.total} unit="Carries" size="md">
            <StatTiles
              items={[
                {
                  label: "Positive in transition",
                  value: carries.transitionPositive,
                  tone: "blue",
                  detail: `${pct(carries.transitionPositive, carries.inTransition)}% positive`,
                  detailTone: "carry-transition",
                },
                {
                  label: "Positive in possession",
                  value: carries.possessionPositive,
                  tone: "blue",
                  detail: `${pct(carries.possessionPositive, carries.inPossession)}% positive`,
                  detailTone: "carry-possession",
                },
              ]}
            />
          </PdfSection>

          <PdfSection
            title="Final Third Actions"
            kpi={finalThirdActions.total}
            unit="Actions"
            size="lg"
            phase="final-third"
          >
            <ActionResultPanel title="Outcome breakdown" breakdown={finalThirdBreakdown} />
            <StatTiles
              items={[
                { label: "Shots", value: finalThirdActions.shots, tone: "warn", highlight: true },
                {
                  label: "Pass with shot opportunity",
                  value: finalThirdActions.passWithShotOpportunity,
                  tone: "blue",
                  highlight: true,
                },
              ]}
            />
          </PdfSection>
        </div>

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
