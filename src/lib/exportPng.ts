import type { AxisKey, RankedDivision, ResolvedArchetype } from '../data/types';
import { AX } from '../data/types';
import { AXES } from '../data/axes';
import { TYPES } from '../data/archetypes';

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

// Manually-authored title break index per archetype code. Names with ≤6 chars
// fit on one line and don't appear here. Index = char position where line 2 begins.
const NAME_BREAKS: Record<string, number> = {
  DARIG: 3, // 改革の / 現場指揮官
  DARIX: 6, // 制度を変える / 技術者
  DPSCX: 5, // 福祉政策の / 知恵袋
  DPSIG: 3, // 共創の / プロデューサー
  DPSIX: 5, // 社会変革の / 仕掛人
  DPRIX: 2, // 政策 / イノベーター
  FASCG: 4, // 縁の下の / 万能選手
  FASCX: 3, // 技術で / 支える人
  FASIG: 4, // 現場発の / 改善者
  FASIX: 5, // 技術革新の / 推進者
  FARIG: 5, // 現場改革の / 実行者
  FARIX: 5, // 技術革新の / 先導者
  FPSCX: 5, // 制度設計の / 専門家
  FPSIX: 5, // 未来を描く / 技術者
  FPRIG: 4, // DX推進 / リーダー
  FPRIX: 3, // 戦略の / アーキテクト
};

function titleLines(code: string, name: string): string[] {
  const breakAt = NAME_BREAKS[code];
  if (breakAt === undefined) return [name];
  const chars = Array.from(name);
  return [chars.slice(0, breakAt).join(''), chars.slice(breakAt).join('')];
}

// Pick top-3 axes by |score|; emit their winning-pole label.
function topStrengths(scores: Record<AxisKey, number>): string[] {
  return [...AX]
    .sort((a, b) => Math.abs(scores[b]) - Math.abs(scores[a]))
    .slice(0, 3)
    .map(ax => (scores[ax] >= 0 ? AXES[ax].plus : AXES[ax].minus));
}

export type ExportData = {
  type: { code: string; name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: RankedRow[];
  worst: RankedRow[];
  date: Date;
};

export const EXPORT_W = 794;
export const EXPORT_H = 1123;
export const EXPORT_SCALE = 2;

const INDIGO = '#1C2340';
const CREAM = '#F5EBD8';
const TEXT_FAINT = '#9CA3AF';
const TEXT_BODY = '#1C2340';
const PAGE_PAD_X = 56;
const MASTHEAD_H = 360;
const FONT_FAMILY = "'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif";
const MINCHO_FAMILY = "'Hiragino Mincho ProN','Yu Mincho','MS Mincho','Noto Serif JP',serif";

const PROFILE_TOP = MASTHEAD_H + 32;
const PROFILE_LABEL_COL = 110;
const PROFILE_ROW_H = 46;
const FITS_TOP = PROFILE_TOP + 32 + 5 * PROFILE_ROW_H + 28;

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
  dotColor: string,
  pct: number,
): void {
  const barH = 8;
  const r = barH / 2;
  ctx.fillStyle = trackColor;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + barH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  const dotX = x + (pct / 100) * w;
  const dotY = y + barH / 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = dotColor;
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

function drawOutlinePill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): number {
  setFont(ctx, 10.5, 500);
  const padX = 12;
  const padY = 4;
  const lineH = 20;
  const textW = ctx.measureText(text).width;
  const totalW = textW + padX * 2;
  const r = lineH / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + totalW - r, y);
  ctx.arc(x + totalW - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + lineH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(text, x + padX, y + lineH - padY - 1);
  return totalW;
}

function drawArchetypeGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  highlightCode: string,
): void {
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  setFont(ctx, 9, 700);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawTrackedText(ctx, '32 アーキタイプ', x, y, 0.2);

  const codes = Object.keys(TYPES);
  const cols = 4;
  const rows = 8;
  const gridTop = y + 12;
  const gridH = h - 28;
  const cellW = (w - (cols - 1) * 3) / cols;
  const cellH = gridH / rows;

  for (let i = 0; i < codes.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = x + col * (cellW + 3);
    const cy = gridTop + row * cellH;
    const code = codes[i];
    const name = TYPES[code].name;
    const isUser = code === highlightCode;

    if (isUser) {
      ctx.fillStyle = CREAM;
      const r = 2;
      ctx.beginPath();
      ctx.moveTo(cx + r, cy);
      ctx.lineTo(cx + cellW - r, cy);
      ctx.quadraticCurveTo(cx + cellW, cy, cx + cellW, cy + r);
      ctx.lineTo(cx + cellW, cy + cellH - 2 - r);
      ctx.quadraticCurveTo(cx + cellW, cy + cellH - 2, cx + cellW - r, cy + cellH - 2);
      ctx.lineTo(cx + r, cy + cellH - 2);
      ctx.quadraticCurveTo(cx, cy + cellH - 2, cx, cy + cellH - 2 - r);
      ctx.lineTo(cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = INDIGO;
      setFont(ctx, 7.5, 700);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      setFont(ctx, 7.5, 400);
    }

    const padX = 4;
    const truncated = truncateToWidth(ctx, name, cellW - padX * 2);
    ctx.fillText(truncated, cx + padX, cy + cellH - 8);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  setFont(ctx, 8.5, 400);
  ctx.fillText('32 タイプから 1 つ — あなたの座標', x, y + h - 2);
}

function drawMasthead(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  const gridW = 280;
  const leftW = innerW - gridW - 24;

  // Header row
  ctx.fillStyle = '#FFFFFF';
  setFont(ctx, 10.5, 700);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, 40, 0.3);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(formatDateForDisplay(data.date), EXPORT_W - PAGE_PAD_X, 40);

  // Title (Mincho display, optional 2-line break, demoted 型 trailing)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  const lines = titleLines(data.type.code, data.type.name);
  const titleSize = 56;
  const titleLineH = titleSize * 1.05;
  const titleTop = 88;
  setFont(ctx, titleSize, 700, MINCHO_FAMILY);
  for (let i = 0; i < lines.length; i++) {
    const lineY = titleTop + i * titleLineH + titleSize;
    setFont(ctx, titleSize, 700, MINCHO_FAMILY);
    ctx.fillText(lines[i], PAGE_PAD_X, lineY);
    if (i === lines.length - 1) {
      const lineW = ctx.measureText(lines[i]).width;
      // 型 sits inline at end of last line, demoted
      setFont(ctx, 22, 400, MINCHO_FAMILY);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('型', PAGE_PAD_X + lineW + 8, lineY - 4);
      ctx.fillStyle = '#FFFFFF';
    }
  }

  const titleEndY = titleTop + lines.length * titleLineH;

  // Description (wrapped)
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  setFont(ctx, 12.5, 400);
  const descMaxW = leftW;
  const measure: Measure = (s: string) => ctx.measureText(s);
  const descLines = wrapJapanese(measure, data.type.desc, descMaxW);
  let descY = titleEndY + 18;
  const descLineH = 12.5 * 1.85;
  for (const line of descLines) {
    ctx.fillText(line, PAGE_PAD_X, descY);
    descY += descLineH;
  }

  // Outline cream pills (top-3 strengths)
  const strengths = topStrengths(data.userScores);
  const pillsY = descY + 8;
  let pillCursor = PAGE_PAD_X;
  for (const s of strengths) {
    const pillW = drawOutlinePill(ctx, s, pillCursor, pillsY, CREAM);
    pillCursor += pillW + 8;
  }

  // 32-archetype grid (right side)
  drawArchetypeGrid(
    ctx,
    PAGE_PAD_X + leftW + 24,
    88,
    gridW,
    MASTHEAD_H - 88 - 24,
    data.type.code,
  );
}

function drawProfile(ctx: CanvasRenderingContext2D, data: ExportData): void {
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(28,35,64,0.7)';
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, 'プロファイル', PAGE_PAD_X, PROFILE_TOP, 0.28);
  drawHairline(ctx, PAGE_PAD_X, PROFILE_TOP + 8, EXPORT_W - PAGE_PAD_X * 2, INDIGO, 0.18);

  let y = PROFILE_TOP + 36;
  const barX = PAGE_PAD_X + PROFILE_LABEL_COL + 6;
  const barW = EXPORT_W - PAGE_PAD_X * 2 - PROFILE_LABEL_COL - 6;

  for (const ax of AX) {
    const a = AXES[ax];
    const score = data.userScores[ax];
    const isPlus = score >= 0;

    ctx.fillStyle = a.dark;
    setFont(ctx, 10.5, 700);
    ctx.fillText(a.label, PAGE_PAD_X, y + 5);

    drawBar(ctx, barX, y, barW, a.color, a.dark, axisDotPct(score));

    // Pole anchors below bar — winning side bold + axis-dark, losing side gray normal
    ctx.textAlign = 'left';
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
}

function drawListSection(
  ctx: CanvasRenderingContext2D,
  topY: number,
  colX: number,
  colW: number,
  headerJp: string,
  headerEn: string,
  rows: RankedRow[],
  options: { headerOpacity: number; rankColW: number },
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
  const rowH = 36;
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
    ctx.fillText(row.dept, nameStartX, y + 13);

    // Fit % — green only when ≥80, else faint grey
    const pct = row.fit;
    ctx.fillStyle = pct >= 80 ? AXES.C.dark : TEXT_FAINT;
    setFont(ctx, 14, 700);
    ctx.textAlign = 'right';
    ctx.fillText(formatPct(pct), fitX, y);

    // Dotted divider between rows
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = INDIGO;
    ctx.setLineDash([1, 3]);
    ctx.beginPath();
    ctx.moveTo(colX, y + 22);
    ctx.lineTo(colX + colW, y + 22);
    ctx.stroke();
    ctx.restore();

    y += rowH;
  }
  ctx.textAlign = 'left';
}

function drawQrPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  ctx.fillStyle = INDIGO;
  ctx.fillRect(x, y, size, size);

  const finderSize = 14;
  const finderInset = 6;
  const finders: Array<[number, number]> = [
    [x + finderInset, y + finderInset],
    [x + size - finderInset - finderSize, y + finderInset],
    [x + finderInset, y + size - finderInset - finderSize],
  ];
  for (const [fx, fy] of finders) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx, fy, finderSize, finderSize);
    ctx.fillStyle = INDIGO;
    ctx.fillRect(fx + 3, fy + 3, finderSize - 6, finderSize - 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + 5, fy + 5, finderSize - 10, finderSize - 10);
  }

  // Sparse white dots in body to look more QR-like
  const cell = 4;
  const dotPositions: Array<[number, number]> = [
    [size * 0.42, size * 0.42],
    [size * 0.52, size * 0.52],
    [size * 0.42, size * 0.62],
    [size * 0.78, size * 0.42],
    [size * 0.78, size * 0.52],
    [size * 0.78, size * 0.62],
    [size * 0.42, size * 0.78],
    [size * 0.52, size * 0.78],
  ];
  ctx.fillStyle = '#FFFFFF';
  for (const [dx, dy] of dotPositions) {
    ctx.fillRect(x + dx, y + dy, cell, cell);
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const footerTop = EXPORT_H - 32 - 64;

  // Left: muted wordmark + date
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = INDIGO;
  setFont(ctx, 9.5, 700);
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, footerTop + 18, 0.32);
  ctx.restore();
  ctx.fillStyle = TEXT_FAINT;
  setFont(ctx, 9.5, 400);
  ctx.fillText(formatDateForDisplay(data.date), PAGE_PAD_X, footerTop + 36);

  // Right: 64×64 QR + caption underneath
  const qrSize = 64;
  const qrX = EXPORT_W - PAGE_PAD_X - qrSize;
  drawQrPlaceholder(ctx, qrX, footerTop, qrSize);

  ctx.fillStyle = TEXT_FAINT;
  setFont(ctx, 8.5, 400);
  ctx.textAlign = 'center';
  ctx.fillText('診断はこちら', qrX + qrSize / 2, footerTop + qrSize + 14);
  ctx.textAlign = 'left';
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
  drawProfile(ctx, data);

  // 2-column lists: best (left, full opacity) + worst (right, dimmed)
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  const colGap = 32;
  const colW = (innerW - colGap) / 2;
  const leftX = PAGE_PAD_X;
  const rightX = PAGE_PAD_X + colW + colGap;

  drawListSection(
    ctx,
    FITS_TOP,
    leftX,
    colW,
    '相性の高い課',
    '上位 5',
    data.best,
    { headerOpacity: 1, rankColW: 28 },
  );
  drawListSection(
    ctx,
    FITS_TOP,
    rightX,
    colW,
    '相性の低い課',
    '下位 5',
    data.worst,
    { headerOpacity: 0.55, rankColW: 36 },
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
): ExportData {
  return {
    type: { code: type.code, name: type.name, desc: type.desc },
    userScores,
    best: topNBestFits(ranked, BEST_COUNT),
    // Reverse worst so the actual worst (highest rank number) appears first — list "climbs out".
    worst: bottomNWorstFits(ranked, WORST_COUNT).reverse(),
    date,
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
