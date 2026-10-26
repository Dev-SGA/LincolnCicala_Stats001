import { BRAND, carryProgressiveRateColor, type CarryProgressiveSituation } from "@/lib/brand";
import { clipUrl, getFinalThirdBreakdown, type GameStats, type PlayResultBreakdown } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  clubLogoUrl: string;
};

function PdfClipLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-clip-link" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function PdfVideos({ videos }: { videos: { label: string; url: string }[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="spdf-videos">
      <p className="spdf-videos__title">Videos</p>
      <ul className="spdf-videos__list">
        {videos.map((video) => (
          <li key={video.label}>
            <a
              className="spdf-videos__link"
              href={video.url}
              data-pdf-link={video.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="spdf-videos__play" aria-hidden="true">
                <span className="spdf-videos__play-icon" />
              </span>
              <span className="spdf-videos__text">
                <strong>{video.label}</strong>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

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
  const progressiveHref = clipUrl(videos, "Progressive plays Final third", "Progressive plays final third");
  const lostHref = clipUrl(videos, "Lost plays final third", "Lost plays Final third");
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
          <span className="spdf-pass-panel__legend-label">
            <PdfClipLink href={progressiveHref}>Progressive plays</PdfClipLink>
          </span>
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
          <span className="spdf-pass-panel__legend-label">
            <PdfClipLink href={lostHref}>Lost</PdfClipLink>
          </span>
          <strong>
            {breakdown.lost} · {pct(breakdown.lost, total)}%
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
  titleHref,
}: {
  label: string;
  total: number;
  progressive: number;
  situation: CarryProgressiveSituation;
  titleHref?: string;
}) {
  const color = carryProgressiveRateColor(situation);

  return (
    <div className="spdf-carry">
      <p className="spdf-carry__title">
        <PdfClipLink href={titleHref}>{label}</PdfClipLink>
      </p>
      <table className="spdf-carry__figures">
        <tbody>
          <tr>
            <td className="spdf-carry__figure">
              <span className="spdf-carry__value">{total}</span>
              <span className="spdf-carry__label">Total</span>
            </td>
            <td className="spdf-carry__figure spdf-carry__figure--split">
              <span className="spdf-carry__value" style={{ color }}>
                {progressive}
              </span>
              <span className="spdf-carry__label">Progressive play</span>
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

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl, clubLogoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, carries, finalThirdActions, videos } = stats;
  const finalThirdBreakdown = getFinalThirdBreakdown(stats);
  const carriesClip = clipUrl(videos, "Carries");
  const transitionClip = clipUrl(videos, "Progressive plays in transition", "In transition");
  const possessionClip = clipUrl(videos, "Progressive play in possession", "In possession");
  const shotsClip = clipUrl(videos, "Shots");
  const passShotClip = clipUrl(videos, "Passes with shot opportunity", "Pass with shot opportunity");

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
            ) : null}
            {player.club}
          </p>
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
              <h3 className="spdf-section__title">
                <PdfClipLink href={carriesClip}>Carries</PdfClipLink>
              </h3>
            </div>
            <div className="spdf-pressure">
              <div className="spdf-pressure__total">
                <span className="spdf-pressure__kicker">
                  <PdfClipLink href={carriesClip}>Total carries</PdfClipLink>
                </span>
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
                    <PdfClipLink href={transitionClip}>In transition</PdfClipLink>
                    <strong>
                      {carries.inTransition} · {pct(carries.inTransition, carries.total)}%
                    </strong>
                  </li>
                  <li>
                    <span className="spdf-pressure__dot spdf-pressure__dot--blue" />
                    <PdfClipLink href={possessionClip}>In possession</PdfClipLink>
                    <strong>
                      {carries.inPossession} · {pct(carries.inPossession, carries.total)}%
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
                titleHref={transitionClip}
              />
              <CarryResultPanel
                label="In possession"
                total={carries.inPossession}
                progressive={carries.possessionPositive}
                situation="possession"
                titleHref={possessionClip}
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
              <div className="spdf-threat-row">
                <table className="spdf-threat-card spdf-threat-card--shots">
                  <tbody>
                    <tr>
                      <td className="spdf-threat-card__value">{finalThirdActions.shots}</td>
                      <td className="spdf-threat-card__copy">
                        <span className="spdf-threat-card__label">
                          <PdfClipLink href={shotsClip}>Shots</PdfClipLink>
                        </span>
                        <span className="spdf-threat-card__caption">Shots taken</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="spdf-threat-card spdf-threat-card--pass">
                  <tbody>
                    <tr>
                      <td className="spdf-threat-card__value">{finalThirdActions.passWithShotOpportunity}</td>
                      <td className="spdf-threat-card__copy">
                        <span className="spdf-threat-card__label">
                          <PdfClipLink href={passShotClip}>Pass with shot opportunity</PdfClipLink>
                        </span>
                        <span className="spdf-threat-card__caption">Passes leading to a shot chance</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </PdfSection>
        </div>

        <PdfVideos videos={videos ?? []} />

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
