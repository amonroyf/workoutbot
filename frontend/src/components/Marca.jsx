import React from 'react';
import logo from '../mirutinahoy.jpeg';

export default function Marca({ compacta = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="MiRutinaHoy">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-marca-500">
        <img src={logo} alt="MiRutinaHoy" className="h-full w-full object-cover" />
      </span>
      {!compacta && (
        <span className="text-lg font-black tracking-tight text-tinta-100">
          MiRutinaHoy
        </span>
      )}
    </span>
  );
}
