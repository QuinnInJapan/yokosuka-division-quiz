import { AX } from '../data/types';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
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
  }).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
}

function summarize(rows: Row[]): string | null {
  if (rows.length < 2) return null;
  const sorted = [...rows];
  const widest = sorted[0];
  const closest = sorted[sorted.length - 1];
  if (widest.bucket === 'match' && closest.bucket === 'match') {
    return `この課とは全ての軸でほぼ一致しています。`;
  }
  if (widest.bucket === 'match' || widest.bucket === 'close') {
    return `この課とは ${AXES[widest.ax].label} までも近く、全体的に相性が良い課です。`;
  }
  return `この課とは ${AXES[closest.ax].label} が近く、${AXES[widest.ax].label} に違いがあります。`;
}

export function ComparisonBars({
  user,
  division,
}: {
  user: Record<AxisKey, number>;
  division: Record<AxisKey, number>;
}) {
  const rows = buildRows(user, division);
  const summary = summarize(rows);
  return (
    <>
      <div className={s.label}>相性の内訳</div>
      {summary && <p className={s.summary}>{summary}</p>}
      <div className={s.list}>
        {rows.map(row => {
          const a = AXES[row.ax];
          const left = Math.min(row.userPct, row.divPct);
          const right = 100 - Math.max(row.userPct, row.divPct);
          return (
            <div key={row.ax} className={s.row}>
              <div className={s.axis} style={{ color: a.dark }}>{a.label}</div>
              <div className={s.bar}>
                <div className={s.poles}>
                  <span>{a.minus}</span>
                  <span>{a.plus}</span>
                </div>
                <div className={s.track}>
                  <div
                    className={s.segment}
                    style={{ left: `${left}%`, right: `${right}%`, background: a.color, opacity: 0.55 }}
                  />
                  <div
                    className={`${s.marker} ${s['marker--user']}`}
                    style={{ left: `${row.userPct}%`, background: a.dark }}
                  />
                  <div
                    className={`${s.marker} ${s['marker--div']}`}
                    style={{ left: `${row.divPct}%`, borderColor: a.dark }}
                  />
                </div>
              </div>
              <span className={`${s.badge} ${s[`badge--${row.bucket}`]}`}>
                {BUCKET_LABEL[row.bucket]}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
