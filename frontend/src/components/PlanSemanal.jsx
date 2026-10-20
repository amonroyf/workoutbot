import React, { useState } from 'react';
import {
  DIAS,
  OBJETIVOS,
  claseParaDia,
  claseParaFecha,
  diaIso,
  formatearDias,
  nombreDia,
  obtenerObjetivo,
  siguienteDiaPlan,
} from '../engine/plan';

function ChipDia({ dia, activo, hecho, hoy, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={nombreDia(dia.id)}
      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-black transition ${
        hecho
          ? 'border-green-400 bg-green-500/20 text-green-200'
          : activo
            ? 'border-orange-400/60 bg-orange-500/20 text-orange-200'
            : 'border-white/10 bg-white/5 text-white/30'
      } ${hoy ? 'ring-2 ring-white/70' : ''}`}
    >
      {dia.corto}
    </button>
  );
}

export default function PlanSemanal({ plan, resumen, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(plan);

  const hoyClase = claseParaFecha(plan);
  const proximo = hoyClase ? null : siguienteDiaPlan(plan, diaIso());
  const objetivo = obtenerObjetivo(plan.objetivo);

  const abrirEditor = () => {
    setBorrador(plan);
    setEditando(true);
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

  const guardar = () => {
    onGuardar(borrador);
    setEditando(false);
  };

  return (
    <>
      <div className="mt-3 w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-300">
              Tu plan semanal
            </p>
            <p className="mt-0.5 truncate text-sm font-black text-white">
              {hoyClase ? `Hoy toca ${hoyClase.nombre}` : 'Hoy descansas'}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-white/55">
              {proximo
                ? `El ${nombreDia(proximo.dia)} toca ${proximo.clase.nombre}`
                : `${objetivo.nombre} · ${formatearDias(plan.dias)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={abrirEditor}
            className="shrink-0 rounded-md border border-white/15 px-2.5 py-1 text-[10px] font-bold text-white/70 transition hover:bg-white/10"
          >
            Editar
          </button>
        </div>

        <div className="mt-2.5 flex gap-1.5">
          {DIAS.map((dia) => (
            <ChipDia
              key={dia.id}
              dia={dia}
              activo={plan.dias.includes(dia.id)}
              hecho={Boolean(resumen?.semana?.[dia.id - 1]?.hecha)}
              hoy={dia.id === diaIso()}
              onClick={abrirEditor}
            />
          ))}
        </div>
      </div>

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center"
          onClick={() => setEditando(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-4 text-left shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Editar plan semanal"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-white">Tu plan semanal</p>
                <p className="text-xs text-white/55">Elige tus días y el enfoque.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-md border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white/70"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-white/45">
              Días de entrenamiento
            </p>
            <div className="mt-1.5 flex justify-between gap-1">
              {DIAS.map((dia) => {
                const activo = borrador.dias.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => alternarDia(dia.id)}
                    className={`flex h-10 flex-1 flex-col items-center justify-center rounded-lg border text-[11px] font-black transition ${
                      activo
                        ? 'border-orange-400 bg-orange-500/20 text-orange-200'
                        : 'border-white/10 bg-white/5 text-white/40'
                    }`}
                  >
                    <span>{dia.corto}</span>
                    <span className="text-[8px] font-normal">{nombreDia(dia.id).slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-white/45">
              Enfoque
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {OBJETIVOS.map((item) => {
                const activo = borrador.objetivo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBorrador((actual) => ({ ...actual, objetivo: item.id }))}
                    className={`rounded-lg border p-2 text-left transition ${
                      activo
                        ? 'border-green-400 bg-green-500/15'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="block text-xs font-black text-white">{item.nombre}</span>
                    <span className="block text-[10px] text-white/50">{item.descripcion}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                Queda así
              </p>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                {borrador.dias.map((dia) => (
                  <div key={dia} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="capitalize text-white/50">{nombreDia(dia)}</span>
                    <span className="truncate font-bold text-white/85">
                      {claseParaDia(borrador, dia)?.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="flex-1 rounded-lg border border-white/15 py-2.5 text-sm font-bold text-white/60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardar}
                className="flex-1 rounded-lg bg-green-500 py-2.5 text-sm font-black text-black transition hover:bg-green-400"
              >
                Guardar plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
