import { useEffect, useRef } from 'react';
import { useDerived } from '../state/hooks';
import { buildExportData, renderExport, sanitizeFilename } from '../lib/exportPng';
import s from './ExportModal.module.css';

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { type, userScores, results } = useDerived();

  // Render canvas on open
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = buildExportData(type, userScores, results, new Date());
    const draw = () => renderExport(canvas, data);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw).catch(draw);
    } else {
      draw();
    }
  }, [open, type, userScores, results]);

  // Focus management + ESC to close
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(type.name, new Date());
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={s.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      data-testid="export-modal"
    >
      <div ref={panelRef} className={s.panel}>
        <h2 id="export-modal-title" className={s.title}>結果を画像で保存</h2>
        <p className={s.copy}>画像を保存して同僚に共有できます。</p>
        <canvas ref={canvasRef} className={s.canvas} data-testid="export-canvas" />
        <div className={s.actions}>
          <button
            ref={closeBtnRef}
            type="button"
            className={s.btnSecondary}
            onClick={onClose}
            data-testid="export-close"
          >
            閉じる
          </button>
          <button
            type="button"
            className={s.btnPrimary}
            onClick={handleSave}
            data-testid="export-save"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
