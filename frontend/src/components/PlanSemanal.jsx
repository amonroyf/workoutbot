import React, { useState } from 'react';
import Icono from './Icono';
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
          ? 'border-marca-400 bg-marca-500/20 text-marca-300'
          : activo
            ? 'border-racha-400/60 bg-racha-500/20 text-racha-300'
            : 'border-linea bg-tinta-900/60 text-tinta-600'
      } ${hoy ? 'ring-2 ring-tinta-100/70' : ''}`}
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
      <div className="mt-3 w-full max-w-md rounded-panel border border-linea bg-tinta-900/60 p-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-racha-300">
              <Icono nombre="calendario" tamano={14} />
              Tu plan semanal
            </p>
            <p className="mt-0.5 truncate text-sm font-black text-tinta-100">
              {hoyClase ? `Hoy toca ${hoyClase.nombre}` : 'Hoy descansas'}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-tinta-400">
              {proximo
                ? `El ${nombreDia(proximo.dia)} toca ${proximo.clase.nombre}`
                : `${objetivo.nombre} · ${formatearDias(plan.dias)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={abrirEditor}
            className="shrink-0 rounded-md border border-linea px-2.5 py-1 text-[10px] font-bold text-tinta-300 transition hover:bg-tinta-800/60"
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-tinta-950/85 p-3 sm:items-center"
          onClick={() => setEditando(false)}
        >
          <div
            className="w-full max-w-md rounded-ficha border border-linea bg-tinta-950 p-4 text-left shadow-flotante"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Editar plan semanal"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-tinta-100">Tu plan semanal</p>
                <p className="text-xs text-tinta-400">Elige tus días y el enfoque.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center rounded-boton border border-linea text-tinta-300 transition hover:bg-tinta-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
              >
                <Icono nombre="cerrar" tamano={16} />
              </button>
            </div>

            <p className="mt-4 text-xs font-bold text-tinta-500">
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
                    className={`flex h-10 flex-1 flex-col items-center justify-center rounded-boton border text-[11px] font-black transition ${
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

            <p className="mt-4 text-xs font-bold text-tinta-500">
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
                    className={`rounded-boton border p-2 text-left transition ${
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

            <div className="mt-4 rounded-boton border border-linea bg-tinta-900/60 p-2.5">
              <p className="text-xs font-bold text-tinta-500">
                Queda así
              </p>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
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

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="min-h-12 flex-1 rounded-boton border border-linea text-sm font-bold text-tinta-300 transition hover:bg-tinta-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardar}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-boton bg-marca-500 text-sm font-black text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
              >
                <Icono nombre="check" tamano={16} />
                Guardar plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
