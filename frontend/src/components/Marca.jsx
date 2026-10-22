import React from 'react';

export default function Marca({ compacta = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="WorkoutBot">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-marca-500 text-tinta-950">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 6l4 12 4-8 4 8 4-12" />
          <path d="M8 20h8" strokeWidth="1.6" />
        </svg>
      </span>
      {!compacta && (
        <span className="text-lg font-black tracking-tight text-tinta-100">
          WorkoutBot
        </span>
      )}
    </span>
  );
}
