import React from 'react';
import {
  ARQUETIPOS,
  CLASES,
  duracionClase,
  formatearDuracion,
  obtenerArquetipo,
  resumenSecciones,
} from '../engine/clases';
import { claseParaFecha, diaIso } from '../engine/plan';
import { estiloGel } from '../theme';
import Marca from '../components/Marca';
import Icono from '../components/Icono';
import { Esqueleto } from '../components/Esqueleto';
import { useInstalarApp } from '../hooks/useInstalarApp';
import { useLocation } from 'wouter';

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

function Chip({ children, tono = 'neutro', gel = null }) {
  if (gel) {
    return (
      <span
        style={estiloGel(gel)}
        className="rounded-chip border border-white/10 fondo-gel px-2.5 py-1 text-[10px] font-bold texto-gel"
      >
        {children}
      </span>
    );
  }
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

export default function PantallaInicioWrapper({
  user,
  plan,
  resumen,
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
  onSalida,
  mostrarGuia,
  onvertedGuia,
  soportaPantallaCompleta,
}) {
  const [, navigate] = useLocation();
  const { puedeInstalar, instalada, esIos, instalar, descartar } = useInstalarApp();
  const nombre = user?.displayName?.split(' ')[0] || 'atleta';
  const hoyClase = claseParaFecha(plan);
  const esClaseDelPlan = hoyClase?.id === claseActual.id;
  const proximo = hoyClase ? null : hoyClase;
  const mostrarInstalar = !instalada && (puedeInstalar || esIos);
  const resumenClase = resumenSecciones(claseActual);

  const etiquetaHeroe =
    !hoyClase && !claseActual
      ? 'HOY DESCANSAS'
      : hoyClase
        ? esClaseDelPlan
          ? 'HOY TOCA'
          : 'TU CLASE'
        : 'HOY DESCANSAS';

  const abrirInstalacion = async () => {
    if (puedeInstalar) {
      await instalar();
    } else {
      window.location.href = 'https://apps.apple.com/app/id1234567890';
    }
  };

  return (
    <div style={estiloGel(claseActual.arquetipo)} className="absolute inset-0 z-10 h-full w-full overflow-y-auto overscroll-contain bg-fondo">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-fondo/90 via-fondo/80 to-fondo" />

      <main className="relative mx-auto w-full max-w-md px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <Marca />
          <div className="min-w-0 text-right">
            <p className="fuente-display truncate text-sm font-black text-tinta-100">Hola, {nombre}</p>
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
          <div style={estiloGel(claseActual.arquetipo)} className="gel pointer-events-none absolute inset-x-0 -top-24 h-56" />
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

            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] texto-gel">
              {claseActual.arquetipo ? obtenerArquetipo(claseActual.arquetipo)?.nombre : null} ·{' '}
              {obtenerArquetipo(claseActual.arquetipo)?.descripcion}
            </p>
            <h1 className="fuente-display mt-1 text-3xl font-black leading-[1.05] text-tinta-100">
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
              <Chip gel={claseActual.arquetipo}>
                {obtenerArquetipo(claseActual.arquetipo)?.nombre || claseActual.arquetipo}
              </Chip>
              <Chip>{textoEquipo(claseActual)}</Chip>
            </div>

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
              onClick={() => navigate('/actividad')}
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
              onClick={onSalida}
              className="min-h-8 font-bold hover:text-tinta-200"
            >
              Cerrar sesión
            </button>
          </div>
          <p className="text-center">Tu video no se sube. La pose se procesa en tu dispositivo.</p>
        </footer>
      </main>
    </div>
  );
}
