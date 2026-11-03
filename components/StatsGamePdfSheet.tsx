import { useFormatCount } from "@/components/CountFormat";
import { BRAND, carryProgressiveRateColor, type CarryProgressiveSituation } from "@/lib/brand";
import { clipUrl, getFinalThirdBreakdown, type GameStats, type PlayResultBreakdown } from "@/lib/stats";

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
  segments,
  wide,
}: {
  title: string;
  total: number;
  totalLabel: string;
  rate?: number;
  rateLabel?: string;
  segments: { label: string; value: string; share: number; tone: PrintTone; href?: string }[];
  wide?: boolean;
}) {
  const fmt = useFormatCount();

  return (
    <section className={`spdf-section spdf-section--summary${wide ? " spdf-section--wide" : ""}`}>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-summary-body">
        <div className={`spdf-summary-kpis${rate == null ? " spdf-summary-kpis--single" : ""}`}>
          <div className="spdf-summary-kpi">
            <span className="spdf-summary-kpi__value">{fmt(total)}</span>
            <span className="spdf-summary-kpi__label">{totalLabel}</span>
          </div>
          {rate != null ? (
            <div className="spdf-summary-kpi spdf-summary-kpi--rate">
              <span className="spdf-summary-kpi__value">{rate}%</span>
              <span className="spdf-summary-kpi__label">{rateLabel}</span>
            </div>
          ) : null}
        </div>
        <SummaryMeter segments={segments} />
      </div>
    </section>
  );
}

function SummaryPairCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number; href?: string }[];
}) {
  const fmt = useFormatCount();

  return (
    <section className="spdf-section spdf-section--summary spdf-section--pair">
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-summary-kpis">
        {items.map((item) => (
          <div key={item.label} className="spdf-summary-kpi">
            <span className="spdf-summary-kpi__value">
              <PdfPlayTarget href={item.href}>{fmt(item.value)}</PdfPlayTarget>
            </span>
            <span className="spdf-summary-kpi__label">
              {item.label}
              <PdfPlay href={item.href} />
            </span>
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
  const offensiveTotal = summary.offensiveWon + summary.offensiveLost;
  const regains = summary.interceptions + summary.recoveries;

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
          <SummaryPairCard
            title="Key passes | Shots"
            items={[
              {
                label: "Key passes",
                value: summary.keyPasses,
                href: clipUrl(stats.videos, "Key passes", "Passes with shot opportunity"),
              },
              { label: "Shots", value: stats.finalThirdActions.shots, href: clipUrl(stats.videos, "Shots") },
            ]}
          />
          <SummaryPairCard
            title="Goals & Assists"
            items={[
              { label: "Goals", value: summary.goals },
              { label: "Assists", value: summary.assists, href: clipUrl(stats.videos, "Assists") },
            ]}
          />
          <SummaryStatCard
            title="Tackles"
            total={regains}
            totalLabel="Total tackles"
            wide
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
  ofTotal,
  progressive,
  situation,
  playHref,
}: {
  label: string;
  total: number;
  ofTotal: number;
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
              <span className="spdf-carry__share">{pct(total, ofTotal)}% of carries</span>
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
              <span className="spdf-carry__bar">
                <span className="spdf-carry__bar-fill" style={{ width: `${pct(progressive, total)}%`, background: color }} />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PdfKeyPassesPanel({
  keyPasses,
  totalPasses,
  playHref,
}: {
  keyPasses: number;
  totalPasses: number;
  playHref?: string;
}) {
  const fmt = useFormatCount();
  const otherPasses = Math.max(totalPasses - keyPasses, 0);
  const keyPct = pct(keyPasses, totalPasses);

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">
          Key passes
          <PdfPlay href={playHref} />
        </p>
        <span className="spdf-pass-panel__total">{fmt(keyPasses)} key passes</span>
      </div>
      <div className="spdf-pass-panel__track">
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--pass-progressive" style={{ width: `${keyPct}%` }} />
        <span className="spdf-pass-panel__seg spdf-pass-panel__seg--pass-neutral" style={{ width: `${100 - keyPct}%` }} />
      </div>
      <ul className="spdf-pass-panel__legend">
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-progressive" />
          <span className="spdf-pass-panel__legend-label">Key passes</span>
          <strong>
            {fmt(keyPasses)} · {keyPct}%
            <PdfPlay href={playHref} />
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-neutral" />
          <span className="spdf-pass-panel__legend-label">Other passes</span>
          <strong>
            {fmt(otherPasses)} · {pct(otherPasses, totalPasses)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function PdfShotGroup({
  title,
  total,
  shareTotal,
  rows,
  playHref,
}: {
  title: string;
  total: number;
  shareTotal?: number;
  rows: { label: string; value: number; tone: Tone }[];
  playHref?: string;
}) {
  const fmt = useFormatCount();
  const share = shareTotal ?? total;

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">
          {title}
          <PdfPlay href={playHref} />
        </p>
        <span className="spdf-pass-panel__total">{fmt(total)} shots</span>
      </div>
      <div className="spdf-pass-panel__track">
        {rows.map((row) => (
          <span
            key={row.label}
            className={`spdf-pass-panel__seg spdf-pass-panel__seg--${row.tone}`}
            style={{ width: `${pct(row.value, share)}%` }}
          />
        ))}
      </div>
      <ul className="spdf-pass-panel__legend">
        {rows.map((row) => (
          <li key={row.label}>
            <span className={`spdf-pass-panel__dot spdf-pass-panel__dot--${row.tone}`} />
            <span className="spdf-pass-panel__legend-label">{row.label}</span>
            <strong>
              {fmt(row.value)} · {pct(row.value, share)}%
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PdfShotsRow({ shots, playHref }: { shots: GameStats["finalThirdActions"]; playHref?: string }) {
  const onTarget = shots.shotsOnTarget ?? 0;
  const offTarget = shots.shotsOffTarget ?? Math.max(shots.shots - onTarget, 0);
  const insideBox = shots.shotsInsideBox ?? 0;
  const outsideBox = shots.shotsOutsideBox ?? Math.max(shots.shots - insideBox, 0);
  const accuracyTotal = onTarget + offTarget;
  const locationTotal = insideBox + outsideBox;

  return (
    <>
      <PdfShotGroup
        title="Shot accuracy"
        total={accuracyTotal}
        shareTotal={accuracyTotal}
        playHref={playHref}
        rows={[
          { label: "On target", value: onTarget, tone: "pass-progressive" },
          { label: "Off target", value: offTarget, tone: "pass-lost" },
        ]}
      />
      <PdfShotGroup
        title="Shot location"
        total={locationTotal}
        shareTotal={locationTotal}
        rows={[
          { label: "Inside the box", value: insideBox, tone: "blue" },
          { label: "Outside the box", value: outsideBox, tone: "pass-neutral" },
        ]}
      />
    </>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl, clubLogoUrl, opponentLogoUrl }: StatsGamePdfSheetProps) {
  const fmt = useFormatCount();
  const { player, meta, match, carries, finalThirdActions, videos, summary } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
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
            <section className="spdf-section spdf-section--carrying spdf-section--md">
              <div className="spdf-section__top">
                <p className="spdf-section__phase">Carrying</p>
                <h3 className="spdf-section__title">Carries Results</h3>
              </div>
              <div className="spdf-carry-row">
                <CarryResultPanel
                  label="In transition"
                  total={carries.inTransition}
                  ofTotal={carries.total}
                  progressive={carries.transitionPositive}
                  situation="transition"
                  playHref={transitionClip}
                />
                <CarryResultPanel
                  label="In possession"
                  total={carries.inPossession}
                  ofTotal={carries.total}
                  progressive={carries.possessionPositive}
                  situation="possession"
                  playHref={possessionClip}
                />
              </div>
            </section>

            <section className="spdf-section spdf-section--final-third spdf-section--lg">
              <div className="spdf-section__top">
                <p className="spdf-section__phase">Final Third</p>
                <h3 className="spdf-section__title">Final Third Actions</h3>
              </div>
              <div className="spdf-final-third-panel">
                <div className="spdf-pass-panel spdf-ft-kpi">
                  <span className="spdf-ft-kpi__value">{fmt(finalThirdActions.total)}</span>
                  <span className="spdf-ft-kpi__unit">Actions</span>
                  <span className="spdf-ft-kpi__caption">Final third actions in the match</span>
                </div>
                <div className={`spdf-ft-grid${summary || hasShotDetail ? "" : " spdf-ft-grid--single"}`}>
                  <ActionResultPanel title="Outcome breakdown" breakdown={finalThirdBreakdown} videos={videos} />
                  {summary ? (
                    <PdfKeyPassesPanel
                      keyPasses={summary.keyPasses}
                      totalPasses={summary.passes}
                      playHref={keyPassesClip}
                    />
                  ) : null}
                  {hasShotDetail ? <PdfShotsRow shots={finalThirdActions} playHref={shotsClip} /> : null}
                </div>
                {hasShotDetail ? null : (
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
            </section>
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
