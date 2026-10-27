import React, { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/workoutStore';

export default function MascotaVirtual({ racha = 0 }) {
  const { faseActual, combo, flashPerfecta, pausado } = useWorkoutStore();
  const [estadoAnimo, setEstadoAnimo] = useState('normal');

  // Lógica de color del Jaguar según la racha semanal
  const colorMascota = racha >= 3 ? '#f59e0b' : racha > 0 ? '#fcd34d' : '#d6d3d1';
  const colorManchas = racha >= 3 ? '#78350f' : racha > 0 ? '#92400e' : '#78716c';

  useEffect(() => {
    if (pausado) {
      setEstadoAnimo('descansando');
    } else if (combo >= 3 || flashPerfecta > 0) {
      setEstadoAnimo('feliz'); 
    } else if (faseActual === 'TRABAJO') {
      setEstadoAnimo('esfuerzo'); 
    } else {
      setEstadoAnimo('normal'); 
    }
  }, [faseActual, combo, flashPerfecta, pausado]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Textos flotantes */}
      {estadoAnimo === 'feliz' && (
        <span className="absolute -top-6 text-[10px] font-black text-racha-400 animate-bounce drop-shadow-md">
          ¡Fuego! 🔥
        </span>
      )}
      {estadoAnimo === 'descansando' && (
        <span className="absolute -top-6 text-[10px] font-bold text-tinta-400 animate-pulse">
          Zzz...
        </span>
      )}

      {/* SVG del Jaguar */}
      <svg 
        viewBox="0 0 100 100" 
        className={`w-20 h-20 drop-shadow-xl transition-transform duration-300 ${
          estadoAnimo === 'feliz' ? 'animate-bounce' : 
          estadoAnimo === 'esfuerzo' ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : ''
        }`}
      >
        {/* Oreja Izquierda */}
        <path d="M 25 45 Q 10 10 40 25 Z" fill={colorMascota} className="transition-colors duration-500" />
        <path d="M 27 42 Q 18 20 37 28 Z" fill="#fef3c7" />
        
        {/* Oreja Derecha */}
        <path d="M 75 45 Q 90 10 60 25 Z" fill={colorMascota} className="transition-colors duration-500" />
        <path d="M 73 42 Q 82 20 63 28 Z" fill="#fef3c7" />

        {/* Cabeza (Cara del jaguar) */}
        <circle cx="50" cy="55" r="35" fill={colorMascota} className="transition-colors duration-500" />

        {/* Manchas (Rosetas) */}
        <circle cx="32" cy="32" r="4" fill={colorManchas} opacity="0.7" />
        <circle cx="68" cy="32" r="4.5" fill={colorManchas} opacity="0.7" />
        <circle cx="50" cy="27" r="3.5" fill={colorManchas} opacity="0.7" />
        <circle cx="23" cy="50" r="3" fill={colorManchas} opacity="0.7" />
        <circle cx="77" cy="50" r="3" fill={colorManchas} opacity="0.7" />
        <circle cx="28" cy="65" r="3.5" fill={colorManchas} opacity="0.7" />
        <circle cx="72" cy="65" r="3.5" fill={colorManchas} opacity="0.7" />

        {/* Hocico */}
        <ellipse cx="50" cy="65" rx="16" ry="12" fill="#fffbeb" />
        
        {/* Nariz */}
        <polygon points="45,61 55,61 50,67" fill="#0f172a" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />

        {/* Ojos expresivos según el estado */}
        {estadoAnimo === 'descansando' ? (
          <>
            <path d="M 32 46 Q 37 50 42 46" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 58 46 Q 63 50 68 46" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : estadoAnimo === 'feliz' ? (
          <>
            <path d="M 32 48 Q 37 42 42 48" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 58 48 Q 63 42 68 48" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : estadoAnimo === 'esfuerzo' ? (
          <>
            {/* Cejas fruncidas de concentración */}
            <line x1="30" y1="42" x2="42" y2="47" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="70" y1="42" x2="58" y2="47" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="37" cy="49" r="2.5" fill="#0f172a" />
            <circle cx="63" cy="49" r="2.5" fill="#0f172a" />
          </>
        ) : (
          <>
            <circle cx="36" cy="46" r="3.5" fill="#0f172a" />
            <circle cx="64" cy="46" r="3.5" fill="#0f172a" />
          </>
        )}

        {/* Boca y Bigotes */}
        <line x1="50" y1="67" x2="50" y2="70" stroke="#0f172a" strokeWidth="2" />
        {estadoAnimo === 'feliz' ? (
          <path d="M 44 69 Q 50 76 56 69" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : estadoAnimo === 'esfuerzo' ? (
          <path d="M 44 71 Q 50 68 56 71" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 45 70 Q 50 73 55 70" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        
        {/* Bigotes */}
        <line x1="33" y1="62" x2="20" y2="60" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="33" y1="66" x2="20" y2="68" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="67" y1="62" x2="80" y2="60" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="67" y1="66" x2="80" y2="68" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>

        {/* Gota de sudor animada */}
        {estadoAnimo === 'esfuerzo' && (
          <path 
            d="M 75 35 Q 80 45 75 50 Q 70 45 75 35 Z" 
            fill="#60a5fa" 
            className="animate-bounce" 
          />
        )}
      </svg>
    </div>
  );
}
