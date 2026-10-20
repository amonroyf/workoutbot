import React from 'react';

export function Esqueleto({ className = '', redondeado = 'rounded-boton' }) {
  return <div className={`esqueleto ${redondeado} ${className}`} aria-hidden="true" />;
}

export function EsqueletoTexto({ lineas = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lineas }).map((_, i) => (
        <Esqueleto
          key={i}
          className={`h-3 ${i === lineas - 1 ? 'w-2/3' : 'w-full'}`}
          redondeado="rounded-chip"
        />
      ))}
    </div>
  );
}

export function EsqueletoTarjeta({ className = '' }) {
  return (
    <div
      className={`rounded-ficha border border-linea bg-panel p-4 ${className}`}
      aria-hidden="true"
    >
      <Esqueleto className="h-3 w-24" redondeado="rounded-chip" />
      <Esqueleto className="mt-3 h-6 w-32" />
      <EsqueletoTexto className="mt-3" lineas={2} />
    </div>
  );
}

export default Esqueleto;
