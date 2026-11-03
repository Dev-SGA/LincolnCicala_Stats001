import { useFormatCount } from "@/components/CountFormat";
import { BRAND, carryProgressiveRateColor, type CarryProgressiveSituation } from "@/lib/brand";
import { clipUrl, getFinalThirdBreakdown, perGame, type GameStats, type PlayResultBreakdown } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  clubLogoUrl: string;
  opponentLogoUrl: string;
};

function PdfPlay({ href }: { href?: string }) {
  if (!href) return null;
  return (
    <a className="spdf-play" href={href} data-pdf-link={href} target="_blank" rel="noreferrer" aria-label="Open video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/play-icon.png" alt="" className="spdf-play__icon" width={14} height={14} />
    </a>
  );
}

function PdfPlayTarget({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-play-target" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

type Tone = "blue" | "red" | "strong-red" | "warn" | "pass-progressive" | "pass-neutral" | "pass-lost";

type PrintTone = "green" | "yellow" | "blue" | "mint" | "grey" | "pass-progressive" | "pass-lost";

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function PdfSide({
  photoUrl,
  logoUrl,
  clubLogoUrl,
  name,
  club,
}: {
  photoUrl: string;
  logoUrl: string;
  clubLogoUrl: string;
  name: string;
  club: string;
}) {
  return (
    <aside className="spdf-side">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt="" className="spdf-side__logo" />
      <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
      <div className="spdf-side__identity">
        <p className="spdf-side__label">Athlete</p>
        <h2 className="spdf-side__name">{name}</h2>
        <p className="spdf-side__club">
          {clubLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
          ) : null}
          {club}
        </p>
      </div>
      <p className="spdf-side__slogan">{BRAND.slogan}</p>
    </aside>
  );
}

function PdfHeader({ title, subtitle, opponentLogoUrl }: { title: string; subtitle: string; opponentLogoUrl: string }) {
  return (
    <header className="spdf-head">
      <div>
        <p className="spdf-head__eyebrow">{BRAND.legal}</p>
        <h1 className="spdf-head__title">{title}</h1>
      </div>
      <div className="spdf-head__meta">
        <span className="spdf-head__match">
          {opponentLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={opponentLogoUrl} alt="" className="spdf-head__logo" />
          ) : null}
          <span>{subtitle}</span>
        </span>
      </div>
    </header>
  );
}

function SummaryMeter({
  segments,
}: {
  segments: { label: string; value: string; share: number; tone: PrintTone; href?: string }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.share, 0);

  return (
    <div className="spdf-summary-meter">
      <div className="spdf-pressure__track">
        {total === 0 ? (
          <span className="spdf-pressure__seg spdf-pressure__seg--grey" style={{ width: "100%" }} />
        ) : (
          segments.map((segment) => (
            <span
              key={segment.label}
              className={`spdf-pressure__seg spdf-pressure__seg--${segment.tone}`}
              style={{ width: `${(segment.share / total) * 100}%` }}
            />
          ))
        )}
      </div>
      <ul className="spdf-pressure__legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className={`spdf-pressure__dot spdf-pressure__dot--${segment.tone}`} />
            <span>
              {segment.label}
              <PdfPlay href={segment.href} />
            </span>
            <strong className={`spdf-tone spdf-tone--${segment.tone}`}>{segment.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryStatCard({
  title,
  total,
  totalLabel,
  rate,
  rateLabel,
  perGameLabel,
  segments,
}: {
  title: string;
  total: number;
  totalLabel: string;
  rate?: number;
  rateLabel?: string;
  perGameLabel?: string;
  segments: { label: string; value: string; share: number; tone: PrintTone; href?: string }[];
}) {
  const fmt = useFormatCount();

  return (
    <section className="spdf-section spdf-section--carrying spdf-section--summary">
      <h3 className="spdf-section__title">{title}</h3>
      <div className={`spdf-summary-kpis${rate == null ? " spdf-summary-kpis--single" : ""}`}>
        <div className="spdf-summary-kpi">
          <span className="spdf-summary-kpi__value">{fmt(total)}</span>
          <span className="spdf-summary-kpi__label">{totalLabel}</span>
          {perGameLabel ? <span className="spdf-summary-kpi__per">{perGameLabel}</span> : null}
        </div>
        {rate != null ? (
          <div className="spdf-summary-kpi spdf-summary-kpi--rate">
            <span className="spdf-summary-kpi__value">{rate}%</span>
            <span className="spdf-summary-kpi__label">{rateLabel}</span>
          </div>
        ) : null}
      </div>
      <SummaryMeter segments={segments} />
    </section>
  );
}

function GoalsAssistsCard({ goals, assists, games }: { goals: number; assists: number; games?: number }) {
  const fmt = useFormatCount();
  const items = [
    { label: "Goals", value: goals },
    { label: "Assists", value: assists },
  ];

  return (
    <section className="spdf-section spdf-section--carrying spdf-section--summary spdf-section--goals">
      <h3 className="spdf-section__title">Goals &amp; Assists</h3>
      <div className="spdf-summary-kpis">
        {items.map((item) => (
          <div key={item.label} className="spdf-summary-kpi">
            <span className="spdf-summary-kpi__value">{fmt(item.value)}</span>
            <span className="spdf-summary-kpi__label">{item.label}</span>
            {games ? <span className="spdf-summary-kpi__per">{perGame(item.value, games)} per game</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryPdfPage({ stats, photoUrl, logoUrl, clubLogoUrl, opponentLogoUrl }: StatsGamePdfSheetProps) {
  const fmt = useFormatCount();
  const summary = stats.summary;
  if (!summary) return null;
  const games = stats.meta.games;
  const offensiveTotal = summary.offensiveWon + summary.offensiveLost;
  const regains = summary.interceptions + summary.recoveries;
  const otherPasses = Math.max(summary.passes - summary.keyPasses, 0);

  return (
    <article className="stats-pdf" aria-hidden="true">
      <PdfSide photoUrl={photoUrl} logoUrl={logoUrl} clubLogoUrl={clubLogoUrl} name={stats.player.name} club={stats.player.club} />
      <div className="spdf-main">
        <PdfHeader title={stats.meta.title} subtitle={stats.meta.subtitle} opponentLogoUrl={opponentLogoUrl} />
        <div className="spdf-summary">
          <SummaryStatCard
            title="General passing"
            total={summary.passes}
            totalLabel="Total passes"
            rate={pct(summary.accurate, summary.passes)}
            rateLabel="Accurate"
            perGameLabel={games ? `${perGame(summary.passes, games)} per game` : undefined}
            segments={[
              { label: "Accurate", value: fmt(summary.accurate), share: summary.accurate, tone: "pass-progressive" },
              { label: "Inaccurate", value: fmt(summary.inaccurate), share: summary.inaccurate, tone: "grey" },
            ]}
          />
          <SummaryStatCard
            title="Offensive duels"
            total={offensiveTotal}
            totalLabel="Total duels"
            rate={pct(summary.offensiveWon, offensiveTotal)}
            rateLabel="Won rate"
            perGameLabel={games ? `${perGame(offensiveTotal, games)} per game` : undefined}
            segments={[
              {
                label: "Won",
                value: fmt(summary.offensiveWon),
                share: summary.offensiveWon,
                tone: "pass-progressive",
                href: clipUrl(stats.videos, "Off. Duels Won", "Off Duels Won", "Offensive duels won"),
              },
              {
                label: "Lost",
                value: fmt(summary.offensiveLost),
                share: summary.offensiveLost,
                tone: "grey",
                href: clipUrl(stats.videos, "Off. Duels Lost", "Off Duels Lost", "Offensive duels lost"),
              },
            ]}
          />
          <SummaryStatCard
            title="Tackles"
            total={regains}
            totalLabel="Total tackles"
            perGameLabel={games ? `${perGame(regains, games)} per game` : undefined}
            segments={[
              {
                label: "Interceptions",
                value: fmt(summary.interceptions),
                share: summary.interceptions,
                tone: "blue",
                href: clipUrl(stats.videos, "Interceptions"),
              },
              {
                label: "Recoveries",
                value: fmt(summary.recoveries),
                share: summary.recoveries,
                tone: "mint",
                href: clipUrl(stats.videos, "Recoveries"),
              },
            ]}
          />
          <SummaryStatCard
            title="Key passes"
            total={summary.keyPasses}
            totalLabel="Key passes"
            rate={pct(summary.keyPasses, summary.passes)}
            rateLabel="Of all passes"
            perGameLabel={games ? `${perGame(summary.keyPasses, games)} per game` : undefined}
            segments={[
              {
                label: "Key passes",
                value: fmt(summary.keyPasses),
                share: summary.keyPasses,
                tone: "pass-progressive",
                href: clipUrl(stats.videos, "Key passes", "Passes with shot opportunity"),
              },
              { label: "Other passes", value: fmt(otherPasses), share: otherPasses, tone: "grey" },
            ]}
          />
          <GoalsAssistsCard goals={summary.goals} assists={summary.assists} games={games} />
        </div>
        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {stats.player.name} · {stats.meta.subtitle}
          </span>
        </footer>
      </div>
    </article>
  );
}

function StatTiles({
  items,
}: {
  items: {
    label: string;
    value: number;
    tone?: Tone;
    detail?: string;
    emphasizeDetail?: boolean;
    highlight?: boolean;
  }[];
}) {
  const fmt = useFormatCount();
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li
          key={item.label}
          className={`spdf-stat${item.emphasizeDetail ? " spdf-stat--emphasis" : ""}${item.highlight ? " spdf-stat--highlight" : ""}`}
        >
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{fmt(item.value)}</span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? (
            <span className={`spdf-stat__detail${item.emphasizeDetail ? " spdf-stat__detail--emphasis" : ""}`}>
              {item.detail}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ActionResultPanel({
  title,
  breakdown,
  videos,
}: {
  title: string;
  breakdown: PlayResultBreakdown;
  videos?: GameStats["videos"];
}) {
  const fmt = useFormatCount();
  const progressiveHref = clipUrl(videos, "Progressive plays Final third", "Progressive plays final third");
  const lostHref = clipUrl(videos, "Lost plays final third", "Lost plays Final third");
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;
  const segments = [
    { value: breakdown.positive, tone: "pass-progressive" as const },
    { value: breakdown.lost, tone: "pass-lost" as const },
    { value: breakdown.neutral, tone: "pass-neutral" as const },
  ];

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">{title}</p>
        <span className="spdf-pass-panel__total">{fmt(total)} actions</span>
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
          <span className="spdf-pass-panel__legend-label">Progressive plays</span>
          <strong>
            {fmt(breakdown.positive)} · {pct(breakdown.positive, total)}%
            <PdfPlay href={progressiveHref} />
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-lost" />
          <span className="spdf-pass-panel__legend-label">Lost</span>
          <strong>
            {fmt(breakdown.lost)} · {pct(breakdown.lost, total)}%
            <PdfPlay href={lostHref} />
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-neutral" />
          <span className="spdf-pass-panel__legend-label">Other</span>
          <strong>
            {fmt(breakdown.neutral)} · {pct(breakdown.neutral, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function CarryResultPanel({
  label,
  total,
  progressive,
  situation,
  playHref,
}: {
  label: string;
  total: number;
  progressive: number;
  situation: CarryProgressiveSituation;
  playHref?: string;
}) {
  const fmt = useFormatCount();
  const color = carryProgressiveRateColor(situation);

  return (
    <div className="spdf-carry">
      <p className="spdf-carry__title">{label}</p>
      <table className="spdf-carry__figures">
        <tbody>
          <tr>
            <td className="spdf-carry__figure">
              <span className="spdf-carry__value">{fmt(total)}</span>
              <span className="spdf-carry__label">Total</span>
            </td>
            <td className="spdf-carry__figure spdf-carry__figure--split">
              <span className="spdf-carry__value" style={{ color }}>
                <PdfPlayTarget href={playHref}>{fmt(progressive)}</PdfPlayTarget>
              </span>
              <span className="spdf-carry__label">
                <PdfPlayTarget href={playHref}>Progressive play</PdfPlayTarget>
                <PdfPlay href={playHref} />
              </span>
              <span className="spdf-carry__rate" style={{ color }}>
                {pct(progressive, total)}% progressive play
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PdfShotsPanel({ shots, playHref }: { shots: GameStats["finalThirdActions"]; playHref?: string }) {
  const fmt = useFormatCount();
  const total = shots.shots;
  const onTarget = shots.shotsOnTarget ?? 0;
  const offTarget = shots.shotsOffTarget ?? Math.max(total - onTarget, 0);
  const insideBox = shots.shotsInsideBox ?? 0;
  const outsideBox = shots.shotsOutsideBox ?? Math.max(total - insideBox, 0);
  const onTargetPct = pct(onTarget, total);
  const insideBoxPct = pct(insideBox, total);

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">
          Shots
          <PdfPlay href={playHref} />
        </p>
        <span className="spdf-pass-panel__total">{fmt(total)} shots</span>
      </div>
      <div className="spdf-pass-panel__track">
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--pass-progressive" style={{ width: `${onTargetPct}%` }} />
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--pass-lost" style={{ width: `${100 - onTargetPct}%` }} />
      </div>
      <ul className="spdf-pass-panel__legend">
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-progressive" />
          <span className="spdf-pass-panel__legend-label">On target</span>
          <strong>
            {fmt(onTarget)} · {onTargetPct}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-lost" />
          <span className="spdf-pass-panel__legend-label">Off target</span>
          <strong>
            {fmt(offTarget)} · {pct(offTarget, total)}%
          </strong>
        </li>
      </ul>
      <div className="spdf-pass-panel__track">
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--blue" style={{ width: `${insideBoxPct}%` }} />
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--pass-neutral" style={{ width: `${100 - insideBoxPct}%` }} />
      </div>
      <ul className="spdf-pass-panel__legend">
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--blue" />
          <span className="spdf-pass-panel__legend-label">Inside the box</span>
          <strong>
            {fmt(insideBox)} · {insideBoxPct}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-neutral" />
          <span className="spdf-pass-panel__legend-label">Outside the box</span>
          <strong>
            {fmt(outsideBox)} · {pct(outsideBox, total)}%
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
  const fmt = useFormatCount();
  return (
    <section className={`spdf-section spdf-section--${phase} spdf-section--${size}`}>
      <div className="spdf-section__top">
        <p className="spdf-section__phase">{PDF_PHASE_LABEL[phase]}</p>
        <h3 className="spdf-section__title">{title}</h3>
      </div>
      <div className="spdf-section__content">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{fmt(kpi)}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__panel">{children}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl, clubLogoUrl, opponentLogoUrl }: StatsGamePdfSheetProps) {
  const fmt = useFormatCount();
  const { player, meta, match, carries, finalThirdActions, videos } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
  const carriesClip = clipUrl(videos, "Carries");
  const transitionClip = clipUrl(videos, "Progressive plays in transition", "In transition");
  const possessionClip = clipUrl(videos, "Progressive play in possession", "In possession");
  const shotsClip = clipUrl(videos, "Shots");
  const keyPassesClip = clipUrl(videos, "Key passes", "Passes with shot opportunity", "Pass with shot opportunity");
  const hasShotDetail = finalThirdActions.shotsOnTarget != null;

  return (
    <>
      <SummaryPdfPage
        stats={stats}
        photoUrl={photoUrl}
        logoUrl={logoUrl}
        clubLogoUrl={clubLogoUrl}
        opponentLogoUrl={opponentLogoUrl}
      />
      <article className="stats-pdf" aria-hidden="true">
        <PdfSide photoUrl={photoUrl} logoUrl={logoUrl} clubLogoUrl={clubLogoUrl} name={player.name} club={player.club} />

        <div className="spdf-main">
          <PdfHeader title={meta.title} subtitle={match.label} opponentLogoUrl={opponentLogoUrl} />

          <div className="spdf-stack">
            <section className="spdf-section spdf-section--carrying spdf-section--pressure">
              <div className="spdf-section__top">
                <p className="spdf-section__phase">Carrying</p>
                <h3 className="spdf-section__title">Carries</h3>
              </div>
              <div className="spdf-pressure">
                <div className="spdf-pressure__total">
                  <span className="spdf-pressure__kicker">
                    <PdfPlayTarget href={carriesClip}>Total carries</PdfPlayTarget>
                    <PdfPlay href={carriesClip} />
                  </span>
                  <span className="spdf-pressure__value">
                    <PdfPlayTarget href={carriesClip}>{fmt(carries.total)}</PdfPlayTarget>
                  </span>
                  <span className="spdf-pressure__caption">Carries tracked in the match</span>
                </div>
                <div className="spdf-pressure__context">
                  <p className="spdf-pressure__kicker">Phase context</p>
                  <p className="spdf-pressure__headline">
                    {fmt(carries.inTransition)} in transition · {fmt(carries.inPossession)} in possession
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
                      In transition
                      <strong>
                        {fmt(carries.inTransition)} · {pct(carries.inTransition, carries.total)}%
                      </strong>
                    </li>
                    <li>
                      <span className="spdf-pressure__dot spdf-pressure__dot--blue" />
                      In possession
                      <strong>
                        {fmt(carries.inPossession)} · {pct(carries.inPossession, carries.total)}%
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="spdf-section spdf-section--carrying spdf-section--md">
              <div className="spdf-section__top">
                <p className="spdf-section__phase">Carrying</p>
                <h3 className="spdf-section__title">Carries Results</h3>
              </div>
              <div className="spdf-carry-row">
                <CarryResultPanel
                  label="In transition"
                  total={carries.inTransition}
                  progressive={carries.transitionPositive}
                  situation="transition"
                  playHref={transitionClip}
                />
                <CarryResultPanel
                  label="In possession"
                  total={carries.inPossession}
                  progressive={carries.possessionPositive}
                  situation="possession"
                  playHref={possessionClip}
                />
              </div>
            </section>

            <PdfSection
              title="Final Third Actions"
              kpi={finalThirdActions.total}
              unit="Actions"
              size="lg"
              phase="final-third"
            >
              <div className="spdf-final-third-panel">
                <ActionResultPanel title="Outcome breakdown" breakdown={finalThirdBreakdown} videos={videos} />
                {hasShotDetail ? (
                  <PdfShotsPanel shots={finalThirdActions} playHref={shotsClip} />
                ) : (
                  <div className="spdf-threat-row">
                    <table className="spdf-threat-card spdf-threat-card--shots">
                      <tbody>
                        <tr>
                          <td className="spdf-threat-card__value">
                            <PdfPlayTarget href={shotsClip}>{fmt(finalThirdActions.shots)}</PdfPlayTarget>
                          </td>
                          <td className="spdf-threat-card__copy">
                            <span className="spdf-threat-card__label">
                              <PdfPlayTarget href={shotsClip}>Shots</PdfPlayTarget>
                              <PdfPlay href={shotsClip} />
                            </span>
                            <span className="spdf-threat-card__caption">Shots taken</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="spdf-threat-card spdf-threat-card--pass">
                      <tbody>
                        <tr>
                          <td className="spdf-threat-card__value">
                            <PdfPlayTarget href={keyPassesClip}>{fmt(finalThirdActions.passWithShotOpportunity)}</PdfPlayTarget>
                          </td>
                          <td className="spdf-threat-card__copy">
                            <span className="spdf-threat-card__label">
                              <PdfPlayTarget href={keyPassesClip}>Key passes</PdfPlayTarget>
                              <PdfPlay href={keyPassesClip} />
                            </span>
                            <span className="spdf-threat-card__caption">Key passes in the final third</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
    </>
  );
}
