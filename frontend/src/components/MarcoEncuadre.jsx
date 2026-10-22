import React, { useId } from 'react';

export default function MarcoEncuadre({ className = '' }) {
  const gradienteId = useId();

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-linea bg-tinta-900 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#18181b" />
            <stop offset="1" stopColor="#09090b" />
          </linearGradient>
        </defs>
        <rect width="240" height="180" fill={`url(#${gradienteId})`} />
        <ellipse cx="120" cy="166" rx="58" ry="8" fill="#22c55e" opacity="0.12" />

        <g stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
          <path d="M22 48V26h22" />
          <path d="M218 48V26h-22" />
          <path d="M22 132v22h22" />
          <path d="M218 132v22h-22" />
        </g>

        <g stroke="#52525b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="120" cy="52" r="13" />
          <path d="M120 65v42" />
          <path d="M120 78l-24 14" />
          <path d="M120 78l24 14" />
          <path d="M120 107l-18 34" />
          <path d="M120 107l18 34" />
        </g>

        <g stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.5">
          <path d="M120 20v14" />
          <path d="M120 146v14" />
          <path d="M56 90h12" />
          <path d="M172 90h12" />
        </g>

        <rect x="82" y="140" width="76" height="3" rx="1.5" fill="#22c55e" opacity="0.55" />
      </svg>
    </div>
  );
}
