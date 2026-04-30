import { AX } from '../data/types';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
import { fitColor } from '../lib/scoring';
import s from './ComparisonBars.module.css';

const NEAR_THRESHOLD = 0.4;
const CLOSE_THRESHOLD = 1.0;
const SOME_THRESHOLD = 1.8;

type GapBucket = 'match' | 'close' | 'some' | 'wide';

function bucket(gap: number): GapBucket {
  const g = Math.abs(gap);
  if (g <= NEAR_THRESHOLD) return 'match';
  if (g <= CLOSE_THRESHOLD) return 'close';
  if (g <= SOME_THRESHOLD) return 'some';
  return 'wide';
}

const BUCKET_LABEL: Record<GapBucket, string> = {
  match: 'ほぼ一致',
  close: '近い',
  some: 'やや違い',
  wide: '大きな違い',
};

function toPct(v: number) {
  return ((v + 2) / 4) * 100;
}

type FitTier = 'great' | 'good' | 'medium' | 'bad' | 'very_bad';

function fitTier(p: number): FitTier {
  if (p >= 80) return 'great';
  if (p >= 60) return 'good';
  if (p >= 45) return 'medium';
  if (p >= 30) return 'bad';
  return 'very_bad';
}

const TIER_LABEL: Record<FitTier, string> = {
  great: '相性が非常にいい',
  good: '相性がいい',
  medium: '中程度',
  bad: 'よくない',
  very_bad: 'かなり良くない',
};

type Row = {
  ax: AxisKey;
  userPct: number;
  divPct: number;
  gap: number;
  bucket: GapBucket;
};

function buildRows(
  user: Record<AxisKey, number>,
  division: Record<AxisKey, number>,
): Row[] {
  return AX.map(ax => {
    const gap = user[ax] - division[ax];
    return {
      ax,
      userPct: toPct(user[ax]),
      divPct: toPct(division[ax]),
      gap,
      bucket: bucket(gap),
    };
  });
}

function joinAxes(axes: AxisKey[]): string {
  const labels = axes.map(a => AXES[a].label);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}と${labels[1]}`;
  return labels.join('、');
}

function pickAxes(rows: Row[], side: 'close' | 'far', cap = 2): AxisKey[] {
  const sorted = [...rows].sort((a, b) =>
    side === 'close' ? Math.abs(a.gap) - Math.abs(b.gap) : Math.abs(b.gap) - Math.abs(a.gap),
  );
  const targetBucket = sorted[0].bucket;
  const sameBucket = sorted.filter(r => r.bucket === targetBucket);
  return sameBucket.slice(0, cap).map(r => r.ax);
}

type Narrative = { prefix: string; label: string; suffix: string };

function buildNarrative(rows: Row[], tier: FitTier): Narrative {
  const buckets = new Set(rows.map(r => r.bucket));
  const uniform = buckets.size === 1;
  const label = TIER_LABEL[tier];

  if (uniform) {
    const only = rows[0].bucket;
    if (only === 'match') return { prefix: '全ての軸でほぼ一致しており、', label, suffix: '課です。' };
    if (only === 'close') return { prefix: '全ての軸で価値観が近く、', label, suffix: '課です。' };
    if (only === 'some') return { prefix: '全ての軸でやや違いがあり、相性は', label, suffix: 'です。' };
    return { prefix: '全ての軸で大きな違いがあり、相性は', label, suffix: 'です。' };
  }

  const closeAxes = joinAxes(pickAxes(rows, 'close'));
  const farAxes = joinAxes(pickAxes(rows, 'far'));

  switch (tier) {
    case 'great':
      return {
        prefix: `${closeAxes}で価値観が近く、目立った違いも少なく、`,
        label,
        suffix: '課です。',
      };
    case 'good':
      return {
        prefix: `${closeAxes}で価値観が近く、${farAxes}には多少の違いがありますが、`,
        label,
        suffix: '課と言えます。',
      };
    case 'medium':
      return {
        prefix: `${closeAxes}では近い面がある一方、${farAxes}で違いが見られ、相性は`,
        label,
        suffix: 'です。',
      };
    case 'bad':
      return {
        prefix: `${farAxes}で価値観に違いがあり、相性は`,
        label,
        suffix: `です。${closeAxes}の面では近い傾向です。`,
      };
    case 'very_bad':
      return {
        prefix: `${farAxes}など複数の軸で価値観が大きく異なり、相性は`,
        label,
        suffix: '課です。',
      };
  }
}

function summarize(rows: Row[]): string | null {
  if (rows.length < 2) return null;
  const sorted = [...rows].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const widest = sorted[0];
  const closest = sorted[sorted.length - 1];
  if (widest.bucket === 'match' && closest.bucket === 'match') {
    return `この課とは全ての軸でほぼ一致しています。`;
  }
  if (widest.bucket === 'match' || widest.bucket === 'close') {
    return `この課とは${AXES[widest.ax].label}までも近く、全体的に相性が良い課です。`;
  }
  return `この課とは${AXES[closest.ax].label}が近く、${AXES[widest.ax].label}に違いがあります。`;
}

export function ComparisonBars({
  user,
  division,
  divisionName,
  fit,
}: {
  user: Record<AxisKey, number>;
  division: Record<AxisKey, number>;
  divisionName: string;
  fit: number;
}) {
  const rows = buildRows(user, division);
  const summary = summarize(rows);
  const tier = fitTier(fit);
  const narrative = buildNarrative(rows, tier);
  const tierColor = fitColor(fit).text;

  return (
    <>
      <div className={s.label}>相性の内訳</div>
      {summary && <p className={s.summary}>{summary}</p>}
      <p className={s.rationale}>
        {narrative.prefix}
        <strong className={s.tierEmph} style={{ color: tierColor }}>{narrative.label}</strong>
        {narrative.suffix}
      </p>
      <div className={s.legend} aria-label="凡例">
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s['legendDot--user']}`} />あなた
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s['legendDot--div']}`} />{divisionName}
        </span>
      </div>
      <div className={s.list}>
        {rows.map(row => {
          const a = AXES[row.ax];
          const left = Math.min(row.userPct, row.divPct);
          const right = 100 - Math.max(row.userPct, row.divPct);
          return (
            <div key={row.ax} className={s.row}>
              <div className={s.header}>
                <span className={s.axisLabel} style={{ color: a.dark }}>{a.label}</span>
                <span className={`${s.badge} ${s[`badge--${row.bucket}`]}`}>
                  {BUCKET_LABEL[row.bucket]}
                </span>
              </div>
              <div className={s.track}>
                <div
                  className={s.segment}
                  style={{ left: `${left}%`, right: `${right}%`, background: a.color, opacity: 0.55 }}
                />
                <div
                  className={`${s.marker} ${s['marker--user']}`}
                  style={{ left: `${row.userPct}%`, background: a.dark, borderColor: a.dark }}
                />
                <div
                  className={`${s.marker} ${s['marker--div']}`}
                  style={{ left: `${row.divPct}%`, borderColor: a.dark }}
                />
              </div>
              <div className={s.poles}>
                <span>{a.minus}</span>
                <span>{a.plus}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
