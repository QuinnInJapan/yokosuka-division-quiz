import type { AxisKey, RankedDivision } from '../data/types';

function dateParts(d: Date): { yyyy: number; mm: string; dd: string } {
  return {
    yyyy: d.getFullYear(),
    mm: String(d.getMonth() + 1).padStart(2, '0'),
    dd: String(d.getDate()).padStart(2, '0'),
  };
}

export function formatDateForFilename(d: Date): string {
  const { yyyy, mm, dd } = dateParts(d);
  return `${yyyy}-${mm}-${dd}`;
}

export function sanitizeFilename(typeName: string, date: Date): string {
  // Strip characters disallowed on common filesystems and quotes/colons.
  const safe = typeName.replace(/[\\/:*?"<>|\s]+/g, '');
  return `yokosuka-quiz-${safe}-${formatDateForFilename(date)}.png`;
}

export function formatDateForDisplay(d: Date): string {
  const { yyyy, mm, dd } = dateParts(d);
  return `${yyyy}.${mm}.${dd}`;
}

export type RankedRow = {
  rank: number;
  dept: string;
  name: string;
  fit: number;
};

function toRow(d: RankedDivision, rank: number): RankedRow {
  return { rank, dept: d.dept, name: d.name, fit: d.fit };
}

export function topNBestFits(ranked: RankedDivision[], n: number): RankedRow[] {
  return ranked.slice(0, n).map((d, i) => toRow(d, i + 1));
}

export function bottomNWorstFits(ranked: RankedDivision[], n: number): RankedRow[] {
  const start = Math.max(0, ranked.length - n);
  return ranked.slice(start).map((d, i) => toRow(d, start + i + 1));
}

export function formatPct(p: number): string {
  return `${Math.round(p)}%`;
}

export function axisDotPct(score: number): number {
  const clamped = Math.max(-2, Math.min(2, score));
  return ((clamped + 2) / 4) * 100;
}

export type ExportData = {
  type: { name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: RankedRow[];
  worst: RankedRow[];
  date: Date;
};

// Logical (CSS) dimensions. Final canvas is scaled 2× for ~192 dpi.
export const EXPORT_W = 794;
export const EXPORT_H = 1123;
export const EXPORT_SCALE = 2;

const INDIGO = '#1C2340';
const MASTHEAD_H = 340;
const FONT_FAMILY = "'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif";
const PAGE_PAD_X = 56;

function setFont(ctx: CanvasRenderingContext2D, sizePx: number, weight: number = 400): void {
  ctx.font = `${weight} ${sizePx}px ${FONT_FAMILY}`;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackEm: number,
): void {
  // Char-by-char draw with letter-spacing in em.
  const chars = Array.from(text);
  let cursor = x;
  for (const ch of chars) {
    ctx.fillText(ch, cursor, y);
    const w = ctx.measureText(ch).width;
    cursor += w + trackEm * parseFloat(ctx.font);
  }
}

function drawMasthead(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;

  ctx.fillStyle = '#FFFFFF';
  setFont(ctx, 10.5, 700);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, 56, 0.3);

  // Date — right aligned
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(formatDateForDisplay(data.date), EXPORT_W - PAGE_PAD_X, 56);

  // Eyebrow
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  setFont(ctx, 12, 500);
  drawTrackedText(ctx, 'あなたのタイプ', PAGE_PAD_X, 130, 0.15);

  // Title — auto-shrink if needed
  ctx.fillStyle = '#FFFFFF';
  let titleSize = 58;
  const titleText = `「${data.type.name}」型`;
  for (const trySize of [58, 52, 46, 42]) {
    setFont(ctx, trySize, 800);
    if (ctx.measureText(titleText).width <= innerW) {
      titleSize = trySize;
      break;
    }
  }
  setFont(ctx, titleSize, 800);
  ctx.fillText(titleText, PAGE_PAD_X, 130 + 16 + titleSize);

  // Description — wrap
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  setFont(ctx, 13, 400);
  const descMaxW = innerW * 0.75;
  const measure: Measure = (s: string) => ctx.measureText(s);
  const lines = wrapJapanese(measure, data.type.desc, descMaxW);
  let descY = 130 + 16 + titleSize + 28;
  const lineHeight = 13 * 1.85;
  for (const line of lines) {
    ctx.fillText(line, PAGE_PAD_X, descY);
    descY += lineHeight;
  }
}

export function renderExport(canvas: HTMLCanvasElement, data: ExportData): void {
  canvas.width = EXPORT_W * EXPORT_SCALE;
  canvas.height = EXPORT_H * EXPORT_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

  ctx.fillStyle = INDIGO;
  ctx.fillRect(0, 0, EXPORT_W, MASTHEAD_H);

  drawMasthead(ctx, data);
}

type Measure = (text: string) => TextMetrics;

export function wrapJapanese(measure: Measure, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    const candidate = line + ch;
    if (measure(candidate).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
