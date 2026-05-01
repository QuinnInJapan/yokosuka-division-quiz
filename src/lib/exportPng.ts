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

export const EXPORT_W = 1200;
export const EXPORT_H = 720;
export const EXPORT_SCALE = 2;

const INDIGO = '#1C2340';
const TEXT_FAINT = '#9CA3AF';
const TEXT_BODY = '#1C2340';
const PAGE_PAD_X = 56;
const FONT_FAMILY = "'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif";

const TOP_ZONE_BG = '#F7F8FA';
const TOP_ZONE_RADIUS = 18;
const TOP_ZONE_INNER_PAD = 28;
const TOP_ZONE_GAP = 32;
const TOP_TO_FITS_GAP = 28;
const PROFILE_ROW_H = 50;

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

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  trackColor: string,
  dotBorderColor: string,
  pct: number,
): void {
  const barH = 10;
  const r = barH / 2;

  // Full-saturated axis-color track (matches Results page)
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + barH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // White dot w/ axis-dark border at score position
  const dotR = 8;
  const dotX = x + (pct / 100) * w;
  const dotY = y + r;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = dotBorderColor;
  ctx.stroke();
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawArchetypeCol(
  ctx: CanvasRenderingContext2D,
  data: ExportData,
  colX: number,
  colY: number,
  colW: number,
): number {
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Sukarin LEFT, text RIGHT — kills horizontal whitespace around mascot
  const imgSize = 180;
  const imgX = colX;
  const imgY = colY;
  if (data.sukarinImage) {
    ctx.save();
    ctx.shadowColor = 'rgba(28,35,64,0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(data.sukarinImage, imgX, imgY, imgSize, imgSize);
    ctx.restore();
  }

  // Text block to right of Sukarin
  const textX = colX + imgSize + 24;
  const textW = colW - imgSize - 24;

  // Eyebrow
  const eyebrowY = colY + 18;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = INDIGO;
  setFont(ctx, 10, 700);
  drawTrackedText(ctx, '課適性診断', textX, eyebrowY, 0.32);
  ctx.restore();

  // Type name — left-aligned (text-block flush left); name + 型 muted
  const nameY = eyebrowY + 32;
  setFont(ctx, 28, 800);
  ctx.fillStyle = INDIGO;
  ctx.textAlign = 'left';
  ctx.fillText(data.type.name, textX, nameY);
  const nameW = ctx.measureText(data.type.name).width;

  setFont(ctx, 16, 500);
  ctx.fillStyle = '#6B7280';
  ctx.fillText('型', textX + nameW + 6, nameY - 2);

  // Description (wrapped, left-aligned, capped at 4 lines)
  const descY = nameY + 24;
  ctx.fillStyle = '#4A5568';
  setFont(ctx, 12, 400);
  const measure: Measure = (s: string) => ctx.measureText(s);
  const descLines = wrapJapanese(measure, data.type.desc, textW);
  let curY = descY;
  const descLineH = 12 * 1.75;
  for (const line of descLines.slice(0, 4)) {
    ctx.fillText(line, textX, curY);
    curY += descLineH;
  }

  // Return max(image bottom, text bottom) — Sukarin floor often wins
  return Math.max(imgY + imgSize, curY);
}

function drawProfileCol(
  ctx: CanvasRenderingContext2D,
  data: ExportData,
  colX: number,
  colY: number,
  colW: number,
): number {
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Section header
  ctx.fillStyle = 'rgba(28,35,64,0.7)';
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, 'プロファイル', colX, colY + 10, 0.28);
  drawHairline(ctx, colX, colY + 18, colW, INDIGO, 0.18);

  let y = colY + 36;
  const barX = colX;
  const barW = colW;

  for (const ax of AX) {
    const a = AXES[ax];
    const score = data.userScores[ax];
    const isPlus = score >= 0;
    const dotPct = axisDotPct(score);
    const winningPct = isPlus ? dotPct : 100 - dotPct;
    const pctStr = `${winningPct.toFixed(0)}%`;

    // Header line: just axis label (neutral)
    ctx.fillStyle = INDIGO;
    setFont(ctx, 11, 600);
    ctx.textAlign = 'left';
    ctx.fillText(a.label, barX, y + 10);

    // Bar: full-color track + white dot
    drawBar(ctx, barX, y + 18, barW, a.color, a.dark, dotPct);

    // Poles: pct prefixes the WINNING side. Winning bold+axis-dark, losing faint.
    if (isPlus) {
      setFont(ctx, 10, 400);
      ctx.fillStyle = TEXT_FAINT;
      ctx.textAlign = 'left';
      ctx.fillText(a.minus, barX, y + 42);

      setFont(ctx, 11, 700);
      ctx.fillStyle = a.dark;
      ctx.textAlign = 'right';
      ctx.fillText(`${pctStr} ${a.plus}`, barX + barW, y + 42);
    } else {
      setFont(ctx, 11, 700);
      ctx.fillStyle = a.dark;
      ctx.textAlign = 'left';
      ctx.fillText(`${pctStr} ${a.minus}`, barX, y + 42);

      setFont(ctx, 10, 400);
      ctx.fillStyle = TEXT_FAINT;
      ctx.textAlign = 'right';
      ctx.fillText(a.plus, barX + barW, y + 42);
    }
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

  // === TOP ZONE: archetype + profile side-by-side w/ shared bg ===
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  const topZoneX = PAGE_PAD_X;
  const topZoneY = 24;
  const topColW = (innerW - TOP_ZONE_INNER_PAD * 2 - TOP_ZONE_GAP) / 2;
  const archetypeColX = topZoneX + TOP_ZONE_INNER_PAD;
  const profileColX = archetypeColX + topColW + TOP_ZONE_GAP;
  const colY = topZoneY + TOP_ZONE_INNER_PAD;

  const profileH = 36 + 5 * PROFILE_ROW_H; // header + 5 rows
  const archetypeH = 180; // Sukarin floor; text block beside fits within image height
  const contentH = Math.max(archetypeH, profileH);
  const topZoneH = contentH + TOP_ZONE_INNER_PAD * 2;

  // Draw top zone background
  ctx.fillStyle = TOP_ZONE_BG;
  roundRect(ctx, topZoneX, topZoneY, innerW, topZoneH, TOP_ZONE_RADIUS);
  ctx.fill();

  // Vertically center archetype within content area (Sukarin shorter than profile column)
  const archetypeY = colY + Math.max(0, (contentH - archetypeH) / 2);
  drawArchetypeCol(ctx, data, archetypeColX, archetypeY, topColW);
  drawProfileCol(ctx, data, profileColX, colY, topColW);

  const fitsTop = topZoneY + topZoneH + TOP_TO_FITS_GAP;

  // === FITS LISTS: 2-column, full canvas width ===
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
