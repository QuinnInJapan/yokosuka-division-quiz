import type { AxisKey, RankedDivision, ResolvedArchetype } from '../data/types';
import { AX } from '../data/types';
import { AXES } from '../data/axes';

export function loadImage(src: string | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

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
  type: { code: string; name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: RankedRow[];
  worst: RankedRow[];
  totalCount: number;
  date: Date;
  sukarinImage?: HTMLImageElement | null;
};

export const EXPORT_W = 794;
export const EXPORT_H = 1123;
export const EXPORT_SCALE = 2;

const INDIGO = '#1C2340';
const TEXT_FAINT = '#9CA3AF';
const TEXT_BODY = '#1C2340';
const PAGE_PAD_X = 56;
const FONT_FAMILY = "'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif";

const MASTHEAD_TOP_GAP = 36;
const PROFILE_LABEL_COL = 110;
const PROFILE_ROW_H = 46;
const PROFILE_TO_FITS_GAP = 28;

function setFont(
  ctx: CanvasRenderingContext2D,
  sizePx: number,
  weight: number = 400,
  family: string = FONT_FAMILY,
): void {
  ctx.font = `${weight} ${sizePx}px ${family}`;
}

function fontSizePx(ctx: CanvasRenderingContext2D): number {
  const m = ctx.font.match(/(\d+(?:\.\d+)?)px/);
  return m ? parseFloat(m[1]) : 16;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackEm: number,
): void {
  const chars = Array.from(text);
  const sizePx = fontSizePx(ctx);
  let cursor = x;
  for (const ch of chars) {
    ctx.fillText(ch, cursor, y);
    const w = ctx.measureText(ch).width;
    cursor += w + trackEm * sizePx;
  }
}

function drawHairline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 0.5);
  ctx.lineTo(x + w, y + 0.5);
  ctx.stroke();
  ctx.restore();
}

const TRACK_NEUTRAL = '#E5E7EB';

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  fillColor: string,
  pct: number,
): void {
  const barH = 8;
  const r = barH / 2;

  // Neutral track (full width)
  ctx.fillStyle = TRACK_NEUTRAL;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + barH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Axis-color filled segment from x to (pct/100)*w
  const fillW = Math.max(barH, (pct / 100) * w);
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + fillW - r, y);
  ctx.arc(x + fillW - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + barH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo) + '…';
}

function measureTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  trackEm: number,
): number {
  const sizePx = fontSizePx(ctx);
  const chars = Array.from(text);
  let total = 0;
  for (const ch of chars) {
    total += ctx.measureText(ch).width + trackEm * sizePx;
  }
  return total - trackEm * sizePx;
}

function drawMasthead(ctx: CanvasRenderingContext2D, data: ExportData): number {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  const cardX = PAGE_PAD_X;
  const cardY = 24;
  const cardW = innerW;

  // Sukarin image (centered, hero scale w/ drop-shadow)
  const imgSize = 180;
  const imgX = cardX + (cardW - imgSize) / 2;
  const imgY = cardY + 24;
  if (data.sukarinImage) {
    ctx.save();
    ctx.shadowColor = 'rgba(28,35,64,0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(data.sukarinImage, imgX, imgY, imgSize, imgSize);
    ctx.restore();
  }

  // Eyebrow: muted civic/quiz framing (replaces type code)
  const eyebrowY = imgY + imgSize + 18;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = INDIGO;
  setFont(ctx, 10, 700);
  const eyebrowText = '課適性診断';
  const eyebrowW = measureTracked(ctx, eyebrowText, 0.32);
  drawTrackedText(ctx, eyebrowText, cardX + cardW / 2 - eyebrowW / 2, eyebrowY, 0.32);
  ctx.restore();

  // Type name (centered) — manual kern between 」 and 型 to fix optical-weight gap
  const nameY = eyebrowY + 26;
  ctx.fillStyle = '#1C2340'; // var(--text)
  setFont(ctx, 26, 800);
  const quotedName = `「${data.type.name}」`;
  const suffix = '型';
  const kernAdjust = -6;
  const quotedW = ctx.measureText(quotedName).width;
  const suffixW = ctx.measureText(suffix).width;
  const totalW = quotedW + kernAdjust + suffixW;
  const startX = cardX + cardW / 2 - totalW / 2;
  ctx.fillText(quotedName, startX, nameY);
  ctx.fillText(suffix, startX + quotedW + kernAdjust, nameY);

  // Description (wrapped, centered, capped at 3 lines)
  const descY = nameY + 28;
  ctx.fillStyle = '#4A5568'; // var(--text-sec)
  setFont(ctx, 12, 400);
  const descMaxW = cardW - 96;
  const measure: Measure = (s: string) => ctx.measureText(s);
  const descLines = wrapJapanese(measure, data.type.desc, descMaxW);
  let curY = descY;
  const descLineH = 12 * 1.85;
  for (const line of descLines.slice(0, 3)) {
    const lw = ctx.measureText(line).width;
    ctx.fillText(line, cardX + cardW / 2 - lw / 2, curY);
    curY += descLineH;
  }

  // Interior padding holds masthead block; stroke removed (was invisible at #EBF3FC).
  const cardH = (curY - cardY) + 12;

  ctx.textBaseline = 'alphabetic';
  return cardY + cardH;
}

function drawProfile(ctx: CanvasRenderingContext2D, data: ExportData, profileTop: number): number {
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(28,35,64,0.7)';
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, 'プロファイル', PAGE_PAD_X, profileTop, 0.28);
  drawHairline(ctx, PAGE_PAD_X, profileTop + 8, EXPORT_W - PAGE_PAD_X * 2, INDIGO, 0.18);

  let y = profileTop + 36;
  const barX = PAGE_PAD_X + PROFILE_LABEL_COL + 6;
  const barW = EXPORT_W - PAGE_PAD_X * 2 - PROFILE_LABEL_COL - 6;

  for (const ax of AX) {
    const a = AXES[ax];
    const score = data.userScores[ax];
    const isPlus = score >= 0;
    const dotPct = axisDotPct(score);
    const winningPct = isPlus ? dotPct : 100 - dotPct;

    // Axis label (right-aligned in label gutter) + winning pct (right-aligned at bar end)
    ctx.fillStyle = a.dark;
    setFont(ctx, 10.5, 700);
    ctx.textAlign = 'right';
    ctx.fillText(a.label, PAGE_PAD_X + PROFILE_LABEL_COL, y + 5);
    setFont(ctx, 12, 800);
    ctx.fillText(`${winningPct.toFixed(0)}%`, barX + barW, y + 5);
    ctx.textAlign = 'left';

    drawBar(ctx, barX, y, barW, a.dark, dotPct);

    // Pole anchors below bar — winning side bold + axis-dark, losing side gray normal
    setFont(ctx, 10, isPlus ? 400 : 700);
    ctx.fillStyle = isPlus ? TEXT_FAINT : a.dark;
    ctx.fillText(a.minus, barX, y + 26);
    ctx.textAlign = 'right';
    setFont(ctx, 10, isPlus ? 700 : 400);
    ctx.fillStyle = isPlus ? a.dark : TEXT_FAINT;
    ctx.fillText(a.plus, barX + barW, y + 26);
    ctx.textAlign = 'left';

    y += PROFILE_ROW_H;
  }
  return y;
}

function drawListSection(
  ctx: CanvasRenderingContext2D,
  topY: number,
  colX: number,
  colW: number,
  headerJp: string,
  headerEn: string,
  rows: RankedRow[],
  options: { headerOpacity: number; rankColW: number; pctColor: string },
): void {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Header: JP title + ranked count
  ctx.save();
  ctx.globalAlpha = options.headerOpacity;
  ctx.fillStyle = INDIGO;
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, headerJp, colX, topY, 0.28);
  ctx.restore();

  ctx.fillStyle = TEXT_FAINT;
  setFont(ctx, 10, 400);
  const headerJpW = ctx.measureText(headerJp).width * 1.28; // approx after tracking
  ctx.fillText(headerEn, colX + headerJpW + 12, topY);

  drawHairline(ctx, colX, topY + 8, colW, INDIGO, options.headerOpacity * 0.6);

  let y = topY + 30;
  const rowH = 40;
  const fitColW = 50;
  const nameStartX = colX + options.rankColW;
  const fitX = colX + colW;
  const nameMaxW = colW - options.rankColW - fitColW - 8;

  for (const row of rows) {
    // Rank
    ctx.fillStyle = TEXT_FAINT;
    setFont(ctx, 10.5, 400);
    ctx.textAlign = 'left';
    const rankStr = row.rank < 100 ? String(row.rank).padStart(2, '0') : String(row.rank);
    ctx.fillText(rankStr, colX, y);

    // Name (indigo, bold) on first line
    ctx.fillStyle = TEXT_BODY;
    setFont(ctx, 13, 600);
    const truncatedName = truncateToWidth(ctx, row.name, nameMaxW);
    ctx.fillText(truncatedName, nameStartX, y);

    // Dept (small grey) on second line under name
    ctx.fillStyle = TEXT_FAINT;
    setFont(ctx, 9.5, 400);
    ctx.fillText(row.dept, nameStartX, y + 16);

    // Fit % — column-level tier color (best=green, worst=indigo); legible regardless of value
    ctx.fillStyle = options.pctColor;
    setFont(ctx, 14, 700);
    ctx.textAlign = 'right';
    ctx.fillText(formatPct(row.fit), fitX, y);

    y += rowH;
  }
  ctx.textAlign = 'left';
}

function drawFooter(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const footerTop = EXPORT_H - 32 - 64;

  // Left: wordmark + date (unified muted treatment)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = TEXT_FAINT;
  setFont(ctx, 9.5, 400);
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, footerTop + 18, 0.32);
  ctx.fillText(formatDateForDisplay(data.date), PAGE_PAD_X, footerTop + 36);
}

export function renderExport(canvas: HTMLCanvasElement, data: ExportData): void {
  canvas.width = EXPORT_W * EXPORT_SCALE;
  canvas.height = EXPORT_H * EXPORT_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

  const mastheadEnd = drawMasthead(ctx, data);
  const profileTop = mastheadEnd + MASTHEAD_TOP_GAP;
  const profileEnd = drawProfile(ctx, data, profileTop);
  const fitsTop = profileEnd + PROFILE_TO_FITS_GAP;

  // 2-column lists: best (left, full opacity) + worst (right, dimmed)
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  const colGap = 32;
  const colW = (innerW - colGap) / 2;
  const leftX = PAGE_PAD_X;
  const rightX = PAGE_PAD_X + colW + colGap;

  drawListSection(
    ctx,
    fitsTop,
    leftX,
    colW,
    '相性の高い課',
    `上位 5 / 全${data.totalCount}課中`,
    data.best,
    { headerOpacity: 1, rankColW: 32, pctColor: AXES.C.dark },
  );
  drawListSection(
    ctx,
    fitsTop,
    rightX,
    colW,
    '相性の低い課',
    `下位 5 / 全${data.totalCount}課中`,
    data.worst,
    { headerOpacity: 0.7, rankColW: 32, pctColor: INDIGO },
  );

  drawFooter(ctx, data);
}

export const BEST_COUNT = 5;
export const WORST_COUNT = 5;

export function buildExportData(
  type: ResolvedArchetype,
  userScores: Record<AxisKey, number>,
  ranked: RankedDivision[],
  date: Date,
  sukarinImage?: HTMLImageElement | null,
): ExportData {
  return {
    type: { code: type.code, name: type.name, desc: type.desc },
    userScores,
    best: topNBestFits(ranked, BEST_COUNT),
    // Reverse worst so the actual worst (highest rank number) appears first — list "climbs out".
    worst: bottomNWorstFits(ranked, WORST_COUNT).reverse(),
    totalCount: ranked.length,
    date,
    sukarinImage: sukarinImage ?? null,
  };
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
