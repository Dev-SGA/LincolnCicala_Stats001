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

function RateRing({ value, color }: { value: number; color: string }) {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(value, 100)) / 100) * circumference;
  return (
    <svg viewBox="0 0 64 64" width={46} height={46} className="spdf-ring" aria-hidden="true">
      <circle cx={32} cy={32} r={radius} fill="none" stroke="#e3eaf0" strokeWidth={7} />
      <circle
        cx={32}
        cy={32}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 32 32)"
      />
    </svg>
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
      <div className="spdf-pressure__track spdf-pressure__track--thick">
        {total === 0 ? (
          <span className="spdf-pressure__seg spdf-pressure__seg--grey" style={{ width: "100%" }} />
        ) : (
          segments
            .filter((segment) => segment.share > 0)
            .map((segment) => {
              const share = pct(segment.share, total);
              return (
                <span
                  key={segment.label}
                  className={`spdf-pressure__seg spdf-pressure__seg--${segment.tone}`}
                  style={{ width: `${(segment.share / total) * 100}%` }}
                >
                  {share >= 14 ? <span className="spdf-pressure__pct">{share}%</span> : null}
                </span>
              );
            })
        )}
      </div>
      <ul className="spdf-chips">
        {segments.map((segment) => (
          <li key={segment.label} className="spdf-chip">
            <span className="spdf-chip__label">
              <span className={`spdf-pressure__dot spdf-pressure__dot--${segment.tone}`} />
              {segment.label}
              <PdfPlay href={segment.href} />
            </span>
            <span className="spdf-chip__value">
              {segment.value}
              <small>{pct(segment.share, total)}%</small>
            </span>
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
  rateCaption,
  segments,
  wide,
}: {
  title: string;
  total: number;
  totalLabel: string;
  rate?: number;
  rateLabel?: string;
  rateCaption?: string;
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
            <span className="spdf-summary-kpi__label">{totalLabel}</span>
            <span className="spdf-summary-kpi__value">{fmt(total)}</span>
          </div>
          {rate != null ? (
            <div className="spdf-summary-kpi spdf-summary-kpi--rate">
              <span className="spdf-summary-kpi__label">{rateLabel}</span>
              <div className="spdf-summary-kpi__rate">
                <RateRing value={rate} color="#4d8f6e" />
                <div className="spdf-summary-kpi__rate-text">
                  <span className="spdf-summary-kpi__value">{rate}%</span>
                  {rateCaption ? <span className="spdf-summary-kpi__caption">{rateCaption}</span> : null}
                </div>
              </div>
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
            rateLabel="Accuracy"
            rateCaption={`${fmt(summary.accurate)} of ${fmt(summary.passes)} accurate`}
            segments={[
              { label: "Accurate", value: fmt(summary.accurate), share: summary.accurate, tone: "pass-progressive" },
              { label: "Inaccurate", value: fmt(summary.inaccurate), share: summary.inaccurate, tone: "yellow" },
            ]}
          />
          <SummaryStatCard
            title="Offensive duels"
            total={offensiveTotal}
            totalLabel="Total duels"
            rate={pct(summary.offensiveWon, offensiveTotal)}
            rateLabel="Win rate"
            rateCaption={`${fmt(summary.offensiveWon)} of ${fmt(offensiveTotal)} won`}
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
                tone: "yellow",
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
              { label: "Goals", value: summary.goals, href: clipUrl(stats.videos, "Goals") },
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

type OutcomeRowData = {
  key: string;
  tone: string;
  label: string;
  value: number;
  href?: string;
  share?: string;
};

function PdfOutcomePanel({
  title,
  titleHref,
  total,
  unit,
  rate,
  rows,
  className,
}: {
  title: string;
  titleHref?: string;
  total: number;
  unit: string;
  rate?: { value: number; label: string };
  rows: OutcomeRowData[];
  className?: string;
}) {
  const fmt = useFormatCount();
  const sum = rows.reduce((acc, row) => acc + row.value, 0);

  return (
    <div className={`spdf-op${className ? ` ${className}` : ""}`}>
      <div className="spdf-op__head">
        <p className="spdf-op__title">
          {title}
          <PdfPlay href={titleHref} />
        </p>
        <div className="spdf-op__kpis">
          <span className="spdf-op__total">
            <strong>{fmt(total)}</strong> {unit}
          </span>
          {rate && total > 0 ? (
            <span className="spdf-op__rate">
              <strong>{rate.value}%</strong> {rate.label}
            </span>
          ) : null}
        </div>
      </div>
      <div className="spdf-op__track">
        {rows
          .filter((row) => row.value > 0)
          .map((row) => (
            <span key={row.key} className={`spdf-op__seg spdf-pass-panel__seg--${row.tone}`} style={{ width: `${pct(row.value, sum)}%` }} />
          ))}
      </div>
      <ul className="spdf-op__rows">
        {rows.map((row) => (
          <li key={row.key} className="spdf-op__row">
            <span className={`spdf-pass-panel__dot spdf-pass-panel__dot--${row.tone}`} />
            <span className="spdf-op__label">
              {row.label}
              <PdfPlay href={row.href} />
            </span>
            <span className="spdf-op__bar">
              <span className={`spdf-op__fill spdf-pass-panel__seg--${row.tone}`} style={{ width: `${pct(row.value, sum)}%` }} />
            </span>
            <strong className="spdf-op__value">{fmt(row.value)}</strong>
            <span className="spdf-op__share">{row.share ?? `${pct(row.value, sum)}%`}</span>
          </li>
        ))}
      </ul>
    </div>
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
  const progressiveHref = clipUrl(videos, "Progressive plays Final third", "Progressive plays final third");
  const lostHref = clipUrl(videos, "Lost plays final third", "Lost plays Final third");
  const total = breakdown.positive + breakdown.neutral + breakdown.lost;

  return (
    <PdfOutcomePanel
      title={title}
      total={total}
      unit="actions"
      rate={{ value: pct(breakdown.positive, total), label: "progressive" }}
      rows={[
        { key: "progressive", tone: "pass-progressive", label: "Progressive plays", value: breakdown.positive, href: progressiveHref },
        { key: "lost", tone: "pass-lost", label: "Lost plays", value: breakdown.lost, href: lostHref },
        { key: "other", tone: "pass-neutral", label: "Other", value: breakdown.neutral },
      ]}
    />
  );
}

function CarryResultPanel({
  label,
  total,
  progressive,
  playHref,
}: {
  label: string;
  total: number;
  ofTotal?: number;
  progressive: number;
  situation?: CarryProgressiveSituation;
  playHref?: string;
}) {
  return (
    <PdfOutcomePanel
      title={label}
      titleHref={playHref}
      total={total}
      unit="carries"
      rate={{ value: pct(progressive, total), label: "progressive play" }}
      rows={[
        { key: "progressive", tone: "pass-progressive", label: "Progressive play", value: progressive, href: playHref },
        { key: "other", tone: "pass-neutral", label: "Other carries", value: Math.max(total - progressive, 0) },
      ]}
    />
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
  const otherPasses = Math.max(totalPasses - keyPasses, 0);

  return (
    <PdfOutcomePanel
      title="Key passes"
      titleHref={playHref}
      total={keyPasses}
      unit="key passes"
      rate={{ value: pct(keyPasses, totalPasses), label: "of passes" }}
      rows={[
        { key: "key", tone: "pass-progressive", label: "Key passes", value: keyPasses, href: playHref },
        { key: "other", tone: "pass-neutral", label: "Other passes", value: otherPasses },
      ]}
    />
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
      <PdfOutcomePanel
        title="Shots"
        titleHref={playHref}
        total={accuracyTotal}
        unit="shots"
        rate={{ value: pct(onTarget, accuracyTotal), label: "on target" }}
        rows={[
          { key: "on", tone: "pass-progressive", label: "On target", value: onTarget, href: playHref },
          { key: "off", tone: "pass-lost", label: "Off target", value: offTarget, href: playHref },
        ]}
      />
      {shots.shotsInsideBox != null ? (
        <PdfOutcomePanel
          title="Shot location"
          total={locationTotal}
          unit="shots"
          rate={{ value: pct(insideBox, locationTotal), label: "inside the box" }}
          rows={[
            { key: "inside", tone: "blue", label: "Inside the box", value: insideBox },
            { key: "outside", tone: "pass-neutral", label: "Outside the box", value: outsideBox },
          ]}
        />
      ) : null}
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
