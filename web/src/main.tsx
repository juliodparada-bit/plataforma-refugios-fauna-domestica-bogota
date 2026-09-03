import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Sustentacion } from './guia/Sustentacion';
import './estilos.css';

const esSustentacion =
  window.location.pathname.replace(/\/$/, '') === '/sustentacion';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    {esSustentacion ? <Sustentacion /> : <App />}
  </StrictMode>,
);
