import { useState } from 'react';
import { ExportModal } from './ExportModal';
import s from './ExportButton.module.css';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={s.btn}
        onClick={() => setOpen(true)}
        data-testid="export-button"
      >
        結果を画像で保存
      </button>
      <ExportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
