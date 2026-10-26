import React from 'react';
import { useLocation } from 'wouter';
import Icono from './Icono';

const PESTANAS = [
  { ruta: '/', nombre: 'Inicio', icono: 'casa' },
  { ruta: '/actividad', nombre: 'Actividad', icono: 'calendario' },
  { ruta: '/perfil', nombre: 'Perfil', icono: 'usuario' },
];

// Barra de pestañas inferior. Solo se renderiza fuera del entrenamiento
// (MainLayout gestiona el "Kiosk Mode" durante la clase).
export default function NavegacionInferior() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-fondo/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-md">
        {PESTANAS.map((pestaña) => {
          const activa = location === pestaña.ruta;
          return (
            <button
              key={pestaña.ruta}
              type="button"
              onClick={() => navigate(pestaña.ruta)}
              aria-current={activa ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition ${
                activa ? 'text-marca-400' : 'text-tinta-500 hover:text-tinta-300'
              }`}
            >
              <Icono
                nombre={pestaña.icono}
                tamano={22}
                className={activa ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' : ''}
              />
              <span className="text-[10px] font-bold tracking-wide">{pestaña.nombre}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
