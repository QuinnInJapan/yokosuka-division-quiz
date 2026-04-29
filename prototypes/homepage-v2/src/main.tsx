import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/styles/reset.css';
import '../../../src/styles/tokens.css';
import '../../../src/styles/layout.css';
import './global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
