import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PaginaLegal, { rutaLegal } from './components/PaginaLegal';
import PwaActualizacion from './components/PwaActualizacion';
import { iniciarAnalytics } from './engine/analytics';
import { instalarCapturaErrores } from './engine/errores';
import './index.css';

iniciarAnalytics();
instalarCapturaErrores();

const ruta = rutaLegal(window.location.pathname.replace(/\/+$/, '') || '/');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {ruta ? <PaginaLegal ruta={ruta} /> : <App />}
    <PwaActualizacion />
  </React.StrictMode>
);
