import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { ARQUETIPOS, CLASES, duracionClase, etiquetaFormato, formatearDuracion, obtenerArquetipo, obtenerClase } from '../engine/clases';
import { estiloGel } from '../theme';
import Icono from '../components/Icono';
import PlanSemanal from '../components/PlanSemanal';
import { Esqueleto } from '../components/Esqueleto';

const NIVELES = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const NOMBRES_EQUIPO = {
  banda: 'Banda elástica',
  pared: 'Pared',
  toalla: 'Toalla',
  silla: 'Silla o banco',
  botellas: 'Botellas con agua',
  mochila: 'Mochila con peso',
};

function textoEquipo(clase) {
  const equipo = clase.equipamiento || [];
  if (equipo.length === 0) return 'Sin equipo';
  return equipo.map((pieza) => NOMBRES_EQUIPO[pieza] || pieza).join(' · ');
}

// Pestaña Actividad: racha y semana, el plan semanal editable y el catálogo
// completo de clases agrupado por arquetipo (antes vivía en la hoja de la
// Pantalla de Inicio).
export default function PantallaActividad({
  resumen,
  cargandoResumen,
  plan,
  onGuardarPlan,
  claseActual,
  onSeleccionarClase,
}) {
  const [, navigate] = useLocation();
  const clasesAgrupadas = useMemo(
    () =>
      ARQUETIPOS.map((arquetipo) => ({
        arquetipo,
        clases: CLASES.filter((clase) => clase.arquetipo === arquetipo.id),
      })).filter((grupo) => grupo.clases.length > 0),
    []
  );

  return (
    <div className="absolute inset-0 overflow-y-auto overscroll-contain">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-fondo/90 via-fondo/80 to-fondo" />

      <main className="relative mx-auto w-full max-w-md px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header>
          <h1 className="fuente-display text-2xl font-black text-tinta-100">Tu actividad</h1>
          <p className="text-[11px] text-tinta-400">Racha, semana y plan de entrenamiento.</p>
        </header>

        <section className="mt-3 rounded-panel border border-linea bg-panel p-3">
          {cargandoResumen && !resumen ? (
            <div className="flex items-center justify-between gap-3">
              <Esqueleto className="h-8 w-28" redondeado="rounded-chip" />
              <Esqueleto className="h-8 w-28" redondeado="rounded-chip" />
            </div>
          ) : resumen ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-boton bg-racha-500/15 text-racha-300">
                    <Icono nombre="fuego" tamano={17} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-tinta-100">
                      {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'} de racha
                    </p>
                    <p className="text-[10px] text-tinta-400">Sigue así, se nota.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-marca-300">
                    {resumen.dias_semana}/{resumen.meta_semanal}
                  </p>
                  <p className="text-[10px] text-tinta-400">esta semana</p>
                </div>
              </div>
              <div className="mt-2.5 flex justify-between gap-1">
                {resumen.semana.map((dia) => (
                  <div key={dia.fecha} className="flex flex-1 flex-col items-center gap-1" title={dia.fecha}>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        dia.hecha ? 'bg-marca-400' : 'bg-tinta-700'
                      } ${dia.hoy ? 'ring-2 ring-tinta-100' : ''}`}
                    />
                    <span
                      className={`text-[9px] font-bold ${dia.hoy ? 'text-tinta-100' : 'text-tinta-500'}`}
                    >
                      {dia.etiqueta}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-boton bg-marca-500/15 text-marca-400">
                <Icono nombre="rayo" tamano={17} />
              </span>
              <div>
                <p className="text-sm font-black text-tinta-100">Tu primera clase te espera</p>
                <p className="text-[10px] text-tinta-400">
                  La racha empieza con un solo día. Hoy es buen momento.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-marca-400">
            Tu plan semanal
          </p>
          <PlanSemanal plan={plan} resumen={resumen} onGuardar={onGuardarPlan} />
        </section>

        <section className="mt-5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-sm font-black text-tinta-100">Cambiar clase</p>
              <p className="text-[11px] text-tinta-400">{CLASES.length} clases disponibles</p>
            </div>
          </div>
          <div className="mt-3 space-y-4">
            {clasesAgrupadas.map(({ arquetipo, clases }) => (
              <div key={arquetipo.id} style={estiloGel(arquetipo.id)}>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] texto-gel">
                  <span className="h-1.5 w-1.5 rounded-full fondo-gel borde-gel border" />
                  {arquetipo.nombre}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {clases.map((clase) => {
                    const activa = clase.id === claseActual.id;
                    return (
                      <button
                        key={clase.id}
                        type="button"
                        onClick={() => { onSeleccionarClase(clase.id); navigate('/'); }}
                        aria-pressed={activa}
                        className={`relative overflow-hidden rounded-boton border-2 p-2.5 text-left transition ${
                          activa
                            ? 'border-[var(--gel)] bg-panel-alto'
                            : 'border-linea bg-tinta-900/60 hover:bg-tinta-800/60'
                        }`}
                      >
                        {activa && <span className="gel-lateral absolute inset-y-0 left-0 w-1" />}
                        <span className="block text-xs font-black leading-tight text-tinta-100">
                          {clase.nombre}
                        </span>
                        <span className="mt-1 block text-[10px] text-tinta-400">
                          {formatearDuracion(duracionClase(clase))} ·{' '}
                          {NIVELES[clase.nivel] || clase.nivel} · {etiquetaFormato(clase)}
                        </span>
                        <span className="block text-[10px] text-tinta-500">
                          {textoEquipo(clase)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
