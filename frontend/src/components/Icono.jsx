import React from 'react';

const CONTORNO = {
  pausa: ['M9 5v14', 'M15 5v14'],
  voz: ['M4 10v4h3l5 4V6l-5 4H4z', 'M16 9.5a3.5 3.5 0 010 5', 'M18.5 7a7 7 0 010 10'],
  musica: ['M9 18V6l10-2v12', 'M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', 'M19 16a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'],
  ayuda: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M9.6 9.2a2.5 2.5 0 114 2c-.7.3-1 .9-1 1.6', 'M12 16.5h.01'],
  chevronDerecha: ['M9 6l6 6-6 6'],
  chevronAbajo: ['M6 9l6 6 6-6'],
  calendario: ['M4 7h16v13H4z', 'M4 11h16', 'M8 3v4', 'M16 3v4'],
  fuego: ['M12 3c3 4 5 5.5 5 9a5 5 0 01-10 0c0-2 1-3.5 2.5-5 .2 1.2.8 2 1.6 2.4C11 7.6 11.4 5 12 3z'],
  reloj: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 7.5V12l3 2'],
  check: ['M5 13l4 4L19 7'],
  alerta: ['M12 4l9 16H3z', 'M12 10v4', 'M12 17.5h.01'],
  camara: ['M4 8h3l2-2h6l2 2h3v11H4z', 'M12 13.5a3 3 0 100-6 3 3 0 000 6z'],
  cambiarCamara: [
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  ],
  info: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 11v5', 'M12 7.5h.01'],
  casa: ['M4 11l8-7 8 7v9H4z'],
  rayo: ['M13 3L5 14h6l-1 7 8-11h-6z'],
  cerrar: ['M6 6l12 12', 'M18 6L6 18'],
  expandir: ['M8 3H5a2 2 0 00-2 2v3', 'M16 3h3a2 2 0 012 2v3', 'M8 21H5a2 2 0 01-2-2v-3', 'M16 21h3a2 2 0 002-2v-3'],
};

const RELLENO = {
  reproducir: ['M8 5.5v13l10-6.5z'],
};

export const NOMBRES_ICONO = Object.freeze([
  ...Object.keys(CONTORNO),
  ...Object.keys(RELLENO),
]);

export default function Icono({ nombre, tamano = 20, titulo, className = '' }) {
  const trazos = CONTORNO[nombre] || [];
  const rellenos = RELLENO[nombre] || [];

  return (
    <svg
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
      focusable="false"
    >
      {trazos.map((d) => (
        <path key={d} d={d} />
      ))}
      {rellenos.map((d) => (
        <path key={d} d={d} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
