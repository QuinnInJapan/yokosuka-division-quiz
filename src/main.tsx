import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/layout.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log(
  '%c横須賀市役所 部署タイプ診断 %c\n内部向けの遊び。気軽にどうぞ。',
  'font-weight:700; font-size:13px; color:#1C2340;',
  'font-size:11px; color:#6B7280;',
);
