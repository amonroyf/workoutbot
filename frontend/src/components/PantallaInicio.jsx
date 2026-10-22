import React, { useMemo, useRef, useState } from 'react';
import {
  CLASES,
  duracionClase,
  etiquetaFormato,
  formatearDuracion,
  obtenerClase,
  resumenSecciones,
} from '../engine/clases';
import {
  claseParaFecha,
  diaIso,
  formatearDias,
  nombreDia,
  obtenerObjetivo,
  siguienteDiaPlan,
} from '../engine/plan';
import { nombreEjercicio } from '../engine/ejercicios';
import Marca from './Marca';
import Icono from './Icono';
import PlanSemanal from './PlanSemanal';
import GuiaPrimeraVez from './GuiaPrimeraVez';
import { Esqueleto } from './Esqueleto';
import { useInstalarApp } from '../hooks/useInstalarApp';
import EliminarCuenta from './EliminarCuenta';

const NIVELES = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

function Chip({ children, tono = 'neutro' }) {
  const clases =
    tono === 'marca'
      ? 'border-marca-400/40 bg-marca-500/15 text-marca-300'
      : tono === 'racha'
        ? 'border-racha-400/40 bg-racha-500/15 text-racha-300'
        : 'border-linea bg-tinta-900/70 text-tinta-300';
  return (
    <span className={`rounded-chip border px-2.5 py-1 text-[10px] font-bold ${clases}`}>
      {children}
    </span>
  );
}

function TarjetaClase({ clase, activa, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`min-w-[152px] shrink-0 snap-start rounded-ficha border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100 ${
        activa
          ? 'border-marca-400 bg-marca-500/15'
          : 'border-linea bg-panel hover:border-tinta-600 hover:bg-panel-alto'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-marca-400">
          {etiquetaFormato(clase)}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-tinta-400">
          <Icono nombre="reloj" tamano={12} />
          {formatearDuracion(duracionClase(clase))}
        </span>
      </span>
      <span className="mt-2 block text-sm font-black leading-tight text-tinta-100">
        {clase.nombre}
      </span>
      <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-tinta-400">
        {clase.descripcion}
      </span>
      <span className="mt-2 block text-[10px] font-bold text-tinta-500">
        {NIVELES[clase.nivel] || clase.nivel} · Sin equipo
      </span>
    </button>
  );
}

export default function PantallaInicio({
  user,
  plan,
  resumen,
  cargandoResumen,
  claseActual,
  errorCamara,
  camaraActiva,
  camaraHabilitada,
  onReintentarCamara,
  onActivarCamara,
  onDesactivarCamara,
  onEmpezar,
  onSeleccionarClase,
  onGuardarPlan,
  onSalir,
  mostrarGuia,
  onCerrarGuia,
  soportaPantallaCompleta,
}) {
  const contenedorRef = useRef(null);
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [verDetalle, setVerDetalle] = useState(false);
  const [instruccionesIos, setInstruccionesIos] = useState(false);
  const [eliminarCuentaAbierto, setEliminarCuentaAbierto] = useState(false);
  const {
    puedeInstalar,
    instalada,
    esIos,
    instalar,
    descartar,
  } = useInstalarApp();

  const hoyClase = claseParaFecha(plan);
  const proximo = hoyClase ? null : siguienteDiaPlan(plan, diaIso());
  const objetivo = obtenerObjetivo(plan.objetivo);
  const resumenClase = resumenSecciones(claseActual);
  const nombre = user.displayName?.split(' ')[0] || 'atleta';
  const esClaseDelPlan = hoyClase?.id === claseActual.id;
  const mostrarInstalar = !instalada && (puedeInstalar || esIos);

  const recomendadas = useMemo(() => {
    const delObjetivo = objetivo.clases.map(obtenerClase).filter(Boolean);
    const cortas = [...CLASES]
      .filter((clase) => clase.formato === 'express')
      .sort((a, b) => duracionClase(a) - duracionClase(b));
    const mezcla = [...delObjetivo];
    for (const clase of cortas) {
      if (!mezcla.some((item) => item.id === clase.id)) mezcla.push(clase);
    }
    return mezcla.filter((clase) => clase.id !== claseActual.id).slice(0, 3);
  }, [objetivo, claseActual.id]);

  const elegirClase = (claseId) => {
    onSeleccionarClase(claseId);
    setHojaAbierta(false);
    setVerDetalle(false);
    contenedorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const abrirInstalacion = async () => {
    if (puedeInstalar) {
      await instalar();
    } else {
      setInstruccionesIos(true);
    }
  };

  const etiquetaHeroe = hoyClase
    ? esClaseDelPlan
      ? 'HOY TOCA'
      : 'TU CLASE'
    : 'HOY DESCANSAS';

  return (
    <div
      ref={contenedorRef}
      className="absolute inset-0 z-10 overflow-y-auto overscroll-contain"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-fondo/90 via-fondo/80 to-fondo" />

      <main className="relative mx-auto w-full max-w-md px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <Marca />
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-black text-tinta-100">Hola, {nombre}</p>
            <p className="text-[11px] text-tinta-400">¿Qué entrenamos hoy?</p>
          </div>
        </header>

        {!camaraHabilitada ? (
          <div className="mt-3 flex items-start gap-2 rounded-panel border border-aviso-400/30 bg-aviso-500/10 p-3 text-left">
            <Icono nombre="camara" tamano={16} className="mt-0.5 shrink-0 text-aviso-300" />
            <div className="flex-1">
              <p className="text-xs font-bold text-aviso-200">Modo sin cámara</p>
              <p className="mt-0.5 text-[11px] text-tinta-400">
                Temporizador y voz guían la clase. Usa +1 o −1 para las repeticiones.
              </p>
            </div>
            <button
              type="button"
              onClick={onActivarCamara}
              className="min-h-9 shrink-0 rounded-boton bg-marca-500 px-3 text-xs font-bold text-black transition hover:bg-marca-400"
            >
              Activar
            </button>
          </div>
        ) : (
          <>
            {errorCamara && (
              <div className="mt-3 flex items-start gap-2 rounded-panel border border-error-500/40 bg-tinta-900 p-3 text-left">
                <Icono nombre="alerta" tamano={16} className="mt-0.5 shrink-0 text-error-300" />
                <p className="flex-1 text-xs text-tinta-200">{errorCamara}</p>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={onReintentarCamara}
                    className="flex min-h-9 items-center justify-center gap-1 rounded-boton bg-marca-500 px-3 text-xs font-bold text-black transition hover:bg-marca-400"
                  >
                    <Icono nombre="reproducir" tamano={14} />
                    Reintentar
                  </button>
                  <button
                    type="button"
                    onClick={onDesactivarCamara}
                    className="min-h-8 rounded-boton border border-linea px-2 text-[10px] font-bold text-tinta-300 transition hover:bg-tinta-800"
                  >
                    Sin cámara
                  </button>
                </div>
              </div>
            )}

            {!camaraActiva && !errorCamara && (
              <div className="mt-3 flex items-center gap-2 rounded-panel border border-linea bg-tinta-900/80 p-2.5 text-[11px] text-tinta-400">
                <Icono nombre="camara" tamano={14} className="text-marca-400" />
                Preparando la cámara
                <Esqueleto className="h-1.5 w-10" redondeado="rounded-chip" />
                <button
                  type="button"
                  onClick={onDesactivarCamara}
                  className="ml-auto min-h-7 rounded-boton px-1.5 text-[10px] font-bold text-tinta-400 hover:text-tinta-200"
                >
                  Sin cámara
                </button>
              </div>
            )}
          </>
        )}

        <section className="relative mt-3 overflow-hidden rounded-ficha border border-linea bg-panel p-4">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-marca-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <Chip tono={hoyClase ? 'marca' : 'neutro'}>{etiquetaHeroe}</Chip>
              {resumen?.racha > 0 && (
                <Chip tono="racha">
                  <span className="flex items-center gap-1">
                    <Icono nombre="fuego" tamano={12} />
                    {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
                  </span>
                </Chip>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-black leading-[1.05] text-tinta-100">
              {claseActual.nombre}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-tinta-300">
              {hoyClase
                ? claseActual.descripcion
                : 'Hoy puedes descansar o hacer esta clase corta para activarte.'}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip>{formatearDuracion(duracionClase(claseActual))}</Chip>
              <Chip>{NIVELES[claseActual.nivel] || claseActual.nivel}</Chip>
              <Chip>{etiquetaFormato(claseActual)}</Chip>
              <Chip>Sin equipo</Chip>
            </div>

            {hoyClase && !esClaseDelPlan && (
              <button
                type="button"
                onClick={() => elegirClase(hoyClase.id)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-marca-300 underline underline-offset-2"
              >
                <Icono nombre="chevronDerecha" tamano={12} className="rotate-180" />
                Volver a la clase del plan: {hoyClase.nombre}
              </button>
            )}

            <button
              type="button"
              onClick={onEmpezar}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-ficha bg-marca-500 px-6 text-xl font-black text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
            >
              <Icono nombre="reproducir" tamano={22} />
              {esClaseDelPlan || !hoyClase ? 'Empezar clase' : 'Hacer esta clase'}
            </button>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-tinta-500">
              <Icono nombre="expandir" tamano={12} />
              {soportaPantallaCompleta
                ? 'Se abre en pantalla completa'
                : 'En iPhone, instala la app para verla completa'}
            </p>

            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setHojaAbierta(true)}
                className="flex min-h-10 items-center gap-1 text-xs font-bold text-tinta-300 hover:text-tinta-100"
              >
                <Icono nombre="calendario" tamano={14} />
                Ver plan y clases
              </button>
              <span className="text-right text-[10px] text-tinta-500">
                La cámara no sube tu video
              </span>
            </div>
          </div>
        </section>

        {mostrarGuia && <GuiaPrimeraVez onCerrar={onCerrarGuia} />}

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
                      className={`text-[9px] font-bold ${
                        dia.hoy ? 'text-tinta-100' : 'text-tinta-500'
                      }`}
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
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-tinta-100">Clases cortas</h2>
              <p className="text-[11px] text-tinta-400">
                {proximo
                  ? `El ${nombreDia(proximo.dia)} toca ${proximo.clase.nombre}`
                  : `${objetivo.nombre} · ${formatearDias(plan.dias)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHojaAbierta(true)}
              className="flex min-h-9 shrink-0 items-center gap-1 text-xs font-bold text-marca-300"
            >
              Ver todas
              <Icono nombre="chevronDerecha" tamano={13} />
            </button>
          </div>
          <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
            {recomendadas.map((clase) => (
              <TarjetaClase
                key={clase.id}
                clase={clase}
                activa={clase.id === claseActual.id}
                onClick={() => elegirClase(clase.id)}
              />
            ))}
          </div>
        </section>

        {mostrarInstalar && (
          <section className="mt-4 flex items-start gap-3 rounded-ficha border border-marca-500/25 bg-marca-500/10 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-boton bg-marca-500 text-black">
              <Icono nombre="rayo" tamano={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-tinta-100">Llévala en tu pantalla de inicio</p>
              <p className="mt-0.5 text-[11px] leading-snug text-tinta-300">
                Abre WorkoutBot como una app, incluso con mala señal.
              </p>
              <button
                type="button"
                onClick={abrirInstalacion}
                className="mt-2 min-h-9 rounded-boton bg-marca-500 px-3 text-xs font-black text-black transition hover:bg-marca-400"
              >
                {puedeInstalar ? 'Instalar app' : 'Cómo instalar en iPhone'}
              </button>
            </div>
            <button
              type="button"
              onClick={descartar}
              aria-label="Ocultar instalación"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-boton text-tinta-400 hover:bg-tinta-800"
            >
              <Icono nombre="cerrar" tamano={14} />
            </button>
          </section>
        )}

        <footer className="mt-6 flex flex-col items-center gap-2 text-[11px] text-tinta-500">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a className="hover:text-tinta-200" href="/privacidad">
              Privacidad
            </a>
            <span aria-hidden="true">·</span>
            <a className="hover:text-tinta-200" href="/terminos">
              Términos
            </a>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onSalir}
              className="min-h-8 font-bold hover:text-tinta-200"
            >
              Cerrar sesión
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setEliminarCuentaAbierto(true)}
              className="min-h-8 font-bold text-error-400 hover:text-error-300"
            >
              Eliminar cuenta
            </button>
          </div>
          <p className="text-center">
            Tu video no se sube. La pose se procesa en tu dispositivo.
          </p>
        </footer>
      </main>

      {eliminarCuentaAbierto && (
        <EliminarCuenta onCerrar={() => setEliminarCuentaAbierto(false)} />
      )}

      {instruccionesIos && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-tinta-950/85 p-3 sm:items-center"
          onClick={() => setInstruccionesIos(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cómo instalar en iPhone"
            className="w-full max-w-md rounded-ficha border border-linea bg-tinta-950 p-4 text-left shadow-flotante"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-tinta-100">Instalar en iPhone</p>
                <p className="text-xs text-tinta-400">Solo toma unos segundos en Safari.</p>
              </div>
              <button
                type="button"
                onClick={() => setInstruccionesIos(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center rounded-boton border border-linea text-tinta-300 hover:bg-tinta-800"
              >
                <Icono nombre="cerrar" tamano={16} />
              </button>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-tinta-200">
              <li className="flex gap-2">
                <span className="font-black text-marca-400">1.</span>
                Abre esta página en Safari.
              </li>
              <li className="flex gap-2">
                <span className="font-black text-marca-400">2.</span>
                Toca el botón Compartir (el cuadrado con la flecha hacia arriba).
              </li>
              <li className="flex gap-2">
                <span className="font-black text-marca-400">3.</span>
                Elige “Añadir a pantalla de inicio” y confirma.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setInstruccionesIos(false)}
              className="mt-4 min-h-12 w-full rounded-boton bg-marca-500 text-sm font-black text-black hover:bg-marca-400"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {hojaAbierta && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-tinta-950/85 sm:items-center sm:p-4"
          onClick={() => setHojaAbierta(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Plan y clases"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-linea bg-tinta-950 p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-left shadow-flotante sm:rounded-ficha"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-tinta-700 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-tinta-100">Tu plan</p>
                <p className="text-xs text-tinta-400">Días, enfoque y clase.</p>
              </div>
              <button
                type="button"
                onClick={() => setHojaAbierta(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center rounded-boton border border-linea text-tinta-300 hover:bg-tinta-800"
              >
                <Icono nombre="cerrar" tamano={16} />
              </button>
            </div>

            <PlanSemanal plan={plan} resumen={resumen} onGuardar={onGuardarPlan} />

            <div className="mt-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-tinta-100">Cambiar clase</p>
                  <p className="text-[11px] text-tinta-400">
                    {CLASES.length} clases disponibles
                  </p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CLASES.map((clase) => {
                  const activa = clase.id === claseActual.id;
                  return (
                    <button
                      key={clase.id}
                      type="button"
                      onClick={() => elegirClase(clase.id)}
                      aria-pressed={activa}
                      className={`rounded-boton border-2 p-2.5 text-left transition ${
                        activa
                          ? 'border-marca-400 bg-marca-500/15'
                          : 'border-linea bg-tinta-900/60 hover:bg-tinta-800/60'
                      }`}
                    >
                      <span className="block text-xs font-black leading-tight text-tinta-100">
                        {clase.nombre}
                      </span>
                      <span className="mt-1 block text-[10px] text-tinta-400">
                        {formatearDuracion(duracionClase(clase))} ·{' '}
                        {etiquetaFormato(clase)}
                      </span>
                      <span className="block text-[10px] text-tinta-500">
                        {NIVELES[clase.nivel] || clase.nivel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-panel border border-linea bg-panel p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-marca-400">
                Detalle de la clase
              </p>
              <p className="mt-1 text-base font-black text-tinta-100">
                {claseActual.nombre}
              </p>
              <p className="text-xs text-tinta-300">{claseActual.descripcion}</p>
              <p className="mt-1 text-[11px] text-tinta-400">
                {formatearDuracion(duracionClase(claseActual))} ·{' '}
                {NIVELES[claseActual.nivel] || claseActual.nivel} · Sin equipo
              </p>
              <button
                type="button"
                onClick={() => setVerDetalle(!verDetalle)}
                aria-expanded={verDetalle}
                className="mt-2 flex min-h-10 items-center gap-1 text-xs font-bold text-marca-300"
              >
                <Icono nombre={verDetalle ? 'chevronAbajo' : 'chevronDerecha'} tamano={14} />
                {verDetalle ? 'Ocultar ejercicios' : 'Ver ejercicios'}
              </button>

              {verDetalle && (
                <div className="mt-1 space-y-2 border-t border-linea pt-2">
                  {resumenClase ? (
                    <>
                      {resumenClase.map((seccion, i) => (
                        <div key={seccion.id}>
                          <p className="text-xs font-bold text-tinta-100">
                            {i + 1}. {seccion.nombre} · {formatearDuracion(seccion.duracion)}
                            {seccion.rondas > 1 ? ` · ${seccion.rondas} rondas` : ''}
                          </p>
                          <p className="text-[11px] text-tinta-400">
                            {seccion.ejercicios.map(nombreEjercicio).join(' · ')}
                          </p>
                        </div>
                      ))}
                      <p className="text-[10px] text-tinta-500">
                        {claseActual.bloques.length} ejercicios en {claseActual.secciones.length}{' '}
                        secciones
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] leading-relaxed text-tinta-400">
                      {claseActual.bloques
                        .map((bloque) => nombreEjercicio(bloque.ejercicio))
                        .join(' · ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-tinta-500">
              Si te cuesta: apóyate en una silla o pared, o haz menos
              repeticiones. Detente si sientes dolor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
