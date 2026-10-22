import React, { useState } from 'react';
import Icono from './Icono';
import Marca from './Marca';
import MarcoEncuadre from './MarcoEncuadre';
import {
  DIAS,
  OBJETIVOS,
  claseParaDia,
  normalizarPlan,
  nombreDia,
} from '../engine/plan';
import { track } from '../engine/analytics';

const TOTAL_PASOS = 3;

function Punto({ activo, completado }) {
  return (
    <span
      className={`h-1.5 flex-1 rounded-full transition ${
        completado ? 'bg-marca-400' : activo ? 'bg-marca-500/70' : 'bg-tinta-800'
      }`}
    />
  );
}

export default function Onboarding({
  plan,
  onTerminar,
  onSaltar,
  onGuardarPlan,
  onSinCamara,
}) {
  const [paso, setPaso] = useState(1);
  const [borrador, setBorrador] = useState(() => normalizarPlan(plan));

  const irA = (siguiente) => {
    const destino = Math.min(TOTAL_PASOS, Math.max(1, siguiente));
    setPaso(destino);
    track('onboarding_step', { paso: destino });
  };

  const alternarDia = (dia) => {
    setBorrador((actual) => {
      const activo = actual.dias.includes(dia);
      if (activo && actual.dias.length === 1) return actual;
      const dias = activo
        ? actual.dias.filter((item) => item !== dia)
        : [...actual.dias, dia].sort((a, b) => a - b);
      return { ...actual, dias };
    });
  };

  const terminar = () => {
    track('onboarding_complete', {
      dias: borrador.dias.length,
      objetivo: borrador.objetivo,
    });
    onGuardarPlan(borrador);
    onTerminar();
  };

  const usarPlanPorDefecto = () => {
    const porDefecto = normalizarPlan(undefined);
    track('onboarding_complete', {
      dias: porDefecto.dias.length,
      objetivo: porDefecto.objetivo,
      plan: 'defecto',
    });
    onGuardarPlan(porDefecto);
    onTerminar();
  };

  const usarSinCamara = () => {
    track('onboarding_sin_camara');
    onSinCamara();
    irA(3);
  };

  const saltar = () => {
    track('onboarding_skip', { paso });
    onSaltar();
  };

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-fondo text-tinta-100"
      role="dialog"
      aria-modal="true"
      aria-label="Primeros pasos en WorkoutBot"
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.16),transparent_70%)]" />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <Marca />
          <button
            type="button"
            onClick={saltar}
            className="min-h-9 rounded-boton px-2 text-xs font-bold text-tinta-400 hover:text-tinta-100"
          >
            Saltar
          </button>
        </header>

        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
            <Punto key={i} activo={paso === i + 1} completado={paso > i + 1} />
          ))}
        </div>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-tinta-500">
          Paso {paso} de {TOTAL_PASOS}
        </p>

        <div className="flex flex-1 flex-col justify-center py-6">
          {paso === 1 && (
            <section>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-400">
                Bienvenido
              </p>
              <h1 className="mt-2 text-4xl font-black leading-[1.05]">
                Entrena en casa,
                <br />
                <span className="text-marca-400">en minutos.</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-tinta-300">
                WorkoutBot te guía con voz, cuenta tus repeticiones y te corrige
                la postura. Sin equipo y sin gimnasio.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-tinta-200">
                <li className="flex items-center gap-2">
                  <Icono nombre="reloj" tamano={17} className="text-marca-400" />
                  Clases cortas de 2 a 15 minutos
                </li>
                <li className="flex items-center gap-2">
                  <Icono nombre="camara" tamano={17} className="text-marca-400" />
                  La cámara es opcional
                </li>
                <li className="flex items-center gap-2">
                  <Icono nombre="rayo" tamano={17} className="text-marca-400" />
                  Tu progreso y racha quedan guardados
                </li>
              </ul>
              <button
                type="button"
                onClick={() => irA(2)}
                className="mt-6 min-h-14 w-full rounded-ficha bg-marca-500 text-lg font-black text-black transition hover:bg-marca-400"
              >
                Empezar
              </button>
            </section>
          )}

          {paso === 2 && (
            <section>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-400">
                Encuadre
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight">
                Ubica la cámara para verte completo.
              </h1>
              <MarcoEncuadre className="mt-4 h-44" />
              <ul className="mt-4 space-y-2 text-sm text-tinta-200">
                <li className="flex gap-2">
                  <Icono nombre="check" tamano={16} className="mt-0.5 shrink-0 text-marca-400" />
                  Deja unos 2 metros entre tú y el dispositivo.
                </li>
                <li className="flex gap-2">
                  <Icono nombre="check" tamano={16} className="mt-0.5 shrink-0 text-marca-400" />
                  Que se vean cabeza, manos y pies.
                </li>
                <li className="flex gap-2">
                  <Icono nombre="check" tamano={16} className="mt-0.5 shrink-0 text-marca-400" />
                  Ponte de frente y con luz en la cara.
                </li>
                <li className="flex gap-2">
                  <Icono nombre="info" tamano={16} className="mt-0.5 shrink-0 text-aviso-400" />
                  Si no puedes, entrena con temporizador y voz.
                </li>
              </ul>
              <button
                type="button"
                onClick={() => irA(3)}
                className="mt-6 min-h-14 w-full rounded-ficha bg-marca-500 text-lg font-black text-black transition hover:bg-marca-400"
              >
                Ya estoy listo
              </button>
              <button
                type="button"
                onClick={usarSinCamara}
                className="mt-2 min-h-11 w-full rounded-boton border border-linea text-sm font-bold text-tinta-300 transition hover:bg-tinta-900"
              >
                Entrenar sin cámara
              </button>
            </section>
          )}

          {paso === 3 && (
            <section>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-400">
                Tu semana
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight">
                Elige tus días y tu enfoque.
              </h1>
              <p className="mt-2 text-sm text-tinta-300">
                Puedes cambiarlo después. Con 3 días ya construyes el hábito.
              </p>

              <p className="mt-5 text-xs font-bold text-tinta-500">Días</p>
              <div className="mt-1.5 flex gap-1.5">
                {DIAS.map((dia) => {
                  const activo = borrador.dias.includes(dia.id);
                  return (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => alternarDia(dia.id)}
                      aria-pressed={activo}
                      className={`flex min-h-11 flex-1 flex-col items-center justify-center rounded-boton border text-[11px] font-black transition ${
                        activo
                          ? 'border-racha-400 bg-racha-500/20 text-racha-300'
                          : 'border-linea bg-tinta-900/60 text-tinta-500'
                      }`}
                    >
                      <span>{dia.corto}</span>
                      <span className="text-[8px] font-normal">{nombreDia(dia.id).slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs font-bold text-tinta-500">Enfoque</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {OBJETIVOS.map((item) => {
                  const activo = borrador.objetivo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBorrador((actual) => ({ ...actual, objetivo: item.id }))}
                      aria-pressed={activo}
                      className={`rounded-boton border p-2.5 text-left transition ${
                        activo
                          ? 'border-marca-400 bg-marca-500/15'
                          : 'border-linea bg-tinta-900/60 hover:bg-tinta-800/60'
                      }`}
                    >
                      <span className="block text-xs font-black text-tinta-100">{item.nombre}</span>
                      <span className="block text-[10px] text-tinta-400">{item.descripcion}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-panel border border-linea bg-panel p-3">
                <p className="text-xs font-bold text-tinta-500">Queda así</p>
                <div className="mt-1 space-y-1">
                  {borrador.dias.map((dia) => (
                    <div key={dia} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="capitalize text-tinta-400">{nombreDia(dia)}</span>
                      <span className="truncate font-bold text-tinta-200">
                        {claseParaDia(borrador, dia)?.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={terminar}
                className="mt-5 min-h-14 w-full rounded-ficha bg-marca-500 text-lg font-black text-black transition hover:bg-marca-400"
              >
                Empezar con este plan
              </button>
              <button
                type="button"
                onClick={usarPlanPorDefecto}
                className="mt-2 min-h-11 w-full rounded-boton text-sm font-bold text-tinta-400 hover:text-tinta-200"
              >
                Usar plan por defecto (L, X y V)
              </button>
            </section>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {paso > 1 ? (
            <button
              type="button"
              onClick={() => irA(paso - 1)}
              className="flex min-h-10 items-center gap-1 rounded-boton px-2 text-xs font-bold text-tinta-400 hover:text-tinta-100"
            >
              <Icono nombre="chevronDerecha" tamano={14} className="rotate-180" />
              Atrás
            </button>
          ) : (
            <span />
          )}
          <p className="text-[10px] text-tinta-500">Tu video nunca se sube.</p>
        </div>
      </main>
    </div>
  );
}
