import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/public-sans';
import './index.css';
import './farm.css';
import './rich.css';
import App from './App.jsx';

try {
  const t = localStorage.getItem('theme');
  if (t) document.documentElement.dataset.theme = t;
} catch {
  /* storage unavailable: follow the OS theme */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
