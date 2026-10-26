import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal, calcularSegundos, separarTotales } from '../engine/score';
import { esDeTiempo, nombreEjercicio, EJERCICIOS_CATALOGO } from '../engine/ejercicios';
import { formatearDuracion, obtenerArquetipo } from '../engine/clases';
import { estiloGel } from '../theme';
import { diferenciaReps, textoComparacion } from '../engine/progreso';
import {
  esPantallaCompleta,
  salirDePantallaCompleta,
  solicitarPantallaCompleta,
} from '../engine/pantallaCompleta';
import { Esqueleto, EsqueletoTarjeta } from './Esqueleto';
import Icono from './Icono';

function valorDe(ejercicio, reps, segundos) {
  if (esDeTiempo(ejercicio)) return `${segundos[ejercicio] || 0} s`;
  return `${reps[ejercicio] || 0}`;
}

// Ejes del radar, en el orden en que se trazan los ángulos del hexágono.
const EJES_RADAR = ['Piernas', 'Empuje', 'Tirón', 'Core', 'Cardio', 'Combat'];

// Mapeo del grupo del catálogo (nombres libres) a un eje del radar.
function ejeRadarDeGrupo(grupo) {
  switch (grupo) {
    case 'piernas':
    case 'glúteos':
      return 'Piernas';
    case 'pecho':
    case 'hombros':
      return 'Empuje';
    case 'espalda':
      return 'Tirón';
    case 'cardio':
      return 'Cardio';
    case 'combat':
    case 'combate':
      return 'Combat';
    default:
      return 'Core';
  }
}

// Gráfico hexagonal del volumen de trabajo por grupo muscular. Normaliza el
// tiempo isométrico contra repeticiones dinámicas (1 rep ≈ 1.5 s de tensión)
// y traza el esfuerzo máximo tocando el borde exterior del hexágono.
function RadarFatiga({ totales, color }) {
  const datos = { Piernas: 0, Empuje: 0, Tirón: 0, Core: 0, Cardio: 0, Combat: 0 };
  let maximo = 0;

  Object.entries(totales || {}).forEach(([ej, valor]) => {
    const catalogo = EJERCICIOS_CATALOGO[ej];
    if (!catalogo || !valor) return;

    // 1 repetición ≈ 1.5 s de tensión: los segundos se dividen, el resto son reps.
    const esfuerzo = esDeTiempo(ej) ? valor / 1.5 : valor;
    const eje = ejeRadarDeGrupo(catalogo.grupo);

    datos[eje] += esfuerzo;
    if (datos[eje] > maximo) maximo = datos[eje];
  });

  if (maximo === 0) return null; // sin trabajo creado, no hay huella que trazar

  const centro = 100;
  const radioMax = 65; // margen para que las etiquetas no se corten
  const angulos = [-90, -30, 30, 90, 150, 210].map((a) => (a * Math.PI) / 180);
  const etiquetas = Object.keys(datos);
  const valores = Object.values(datos);

  const puntosUsuario = valores
    .map((v, i) => {
      const r = (v / maximo) * radioMax;
      const x = centro + r * Math.cos(angulos[i]);
      const y = centro + r * Math.sin(angulos[i]);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mb-4 flex w-full max-w-sm flex-col items-center rounded-panel border border-linea bg-tinta-800/60 p-4">
      <p className="mb-2 w-full text-left text-xs font-bold text-tinta-300">Desgaste Muscular</p>
      <svg viewBox="0 0 200 200" className="h-48 w-48 overflow-visible drop-shadow-xl">
        {[0.33, 0.66, 1].map((escala) => (
          <polygon
            key={escala}
            points={angulos
              .map(
                (a) =>
                  `${centro + radioMax * escala * Math.cos(a)},${
                    centro + radioMax * escala * Math.sin(a)
                  }`
              )
              .join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {angulos.map((a, i) => (
          <line
            key={`eje-${i}`}
            x1={centro}
            y1={centro}
            x2={centro + radioMax * Math.cos(a)}
            y2={centro + radioMax * Math.sin(a)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        <polygon
          points={puntosUsuario}
          fill={color}
          fillOpacity="0.25"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {valores.map((v, i) => {
          if (v === 0) return null;
          const r = (v / maximo) * radioMax;
          return (
            <circle
              key={`nodo-${i}`}
              cx={centro + r * Math.cos(angulos[i])}
              cy={centro + r * Math.sin(angulos[i])}
              r="3"
              fill={color}
            />
          );
        })}
        {angulos.map((a, i) => {
          const rTexto = radioMax + 18;
          const xTexto = centro + rTexto * Math.cos(a);
          const yTexto = centro + rTexto * Math.sin(a) + 4;
          const resalte =
            valores[i] >= maximo * 0.8
              ? 'fill-white font-black'
              : valores[i] > 0
                ? 'fill-tinta-200 font-bold'
                : 'fill-tinta-600 font-medium';
          return (
            <text
              key={`texto-${i}`}
              x={xTexto}
              y={yTexto}
              textAnchor="middle"
              className={`text-[9px] uppercase tracking-widest ${resalte}`}
            >
              {etiquetas[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function SummaryScreen({ resumen, cargando = false, pendienteSync = 0 }) {
  const {
    faseActual,
    totales,
    claseActual,
    iniciarRutina,
    detenerRutina,
    perfectas,
    mejorCombo,
  } = useWorkoutStore();

  if (faseActual !== 'FIN') return null;

  const { reps, segundos } = separarTotales(totales);
  const totalReps = calcularTotal(totales);
  const totalSegundos = calcularSegundos(totales);
  const delta = diferenciaReps(resumen);
  const comparacion = textoComparacion(resumen);
  const arquetipo = obtenerArquetipo(claseActual.arquetipo);
  const colorGel = arquetipo?.color || '#ff6a2b';

  const grupos = claseActual.secciones
    ? claseActual.secciones.map((seccion, i) => ({
        id: seccion.id,
        nombre: seccion.nombre,
        ejercicios: [
          ...new Set(
            claseActual.bloques
              .filter((bloque) => bloque.seccionIndex === i)
              .map((bloque) => bloque.ejercicio)
          ),
        ],
      }))
    : [
        {
          id: 'clase',
          nombre: 'Ejercicios',
          ejercicios: [...new Set(claseActual.bloques.map((bloque) => bloque.ejercicio))],
        },
      ];

  const handleRepetir = () => {
    if (!esPantallaCompleta()) solicitarPantallaCompleta();
    iniciarRutina(claseActual.id);
  };

  const handleVolver = () => {
    salirDePantallaCompleta();
    detenerRutina();
  };

  return (
    <div
      style={estiloGel(claseActual.arquetipo)}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto overscroll-contain bg-fondo/80 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center text-tinta-100"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 gel" />
      <p className="relative text-[10px] font-black uppercase tracking-[0.18em] texto-gel">
        {arquetipo?.nombre}
      </p>
      <p className="relative fuente-display text-sm font-semibold text-tinta-200">{claseActual.nombre}</p>
      <h1 className="fuente-display mb-4 mt-1 text-3xl font-black md:text-4xl">Clase completada</h1>

      {pendienteSync > 0 && (
        <div
          role="status"
          className="relative mb-3 flex items-center gap-2 rounded-ficha border border-linea bg-tinta-800/60 px-3 py-2 text-left text-xs text-tinta-300"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-aviso-400" />
          <span>
            {pendienteSync === 1
              ? 'Sin conexión: tu sesión quedó guardada en el teléfono. Se sincronizará sola cuando vuelva internet.'
              : `Sin conexión: ${pendienteSync} sesiones esperan sincronizarse. Se mandarán solas cuando vuelva internet.`}
          </span>
        </div>
      )}

      {cargando && !resumen && (
        <div className="mb-4 w-full max-w-sm space-y-3 text-left">
          <EsqueletoTarjeta />
          <Esqueleto className="h-24 w-full" redondeado="rounded-ficha" />
        </div>
      )}

      {resumen && (
        <div className="mb-4 w-full max-w-sm rounded-ficha border border-linea bg-tinta-800/60 p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tinta-400">Racha</p>
              <p className="text-2xl font-black text-racha-300">
                {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-tinta-400">Semana</p>
              <p className="text-2xl font-black text-marca-300">
                {resumen.dias_semana}/{resumen.meta_semanal}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            {resumen.semana.map((dia) => (
              <div key={dia.fecha} className="flex flex-col items-center gap-1" title={dia.fecha}>
                <span
                  className={`h-3 w-3 rounded-full ${
                    dia.hecha ? 'bg-marca-400' : 'bg-tinta-700/60'
                  } ${dia.hoy ? 'ring-2 ring-tinta-100/70' : ''}`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    dia.hoy ? 'text-tinta-100' : 'text-tinta-500'
                  }`}
                >
                  {dia.etiqueta}
                </span>
              </div>
            ))}
          </div>
          <p
            className={`mt-3 text-sm font-semibold ${
              delta > 0 ? 'text-marca-300' : delta < 0 ? 'text-aviso-300' : 'text-tinta-300'
            }`}
          >
            {comparacion}
          </p>
        </div>
      )}

      <div className="mb-4 grid w-full max-w-sm grid-cols-2 gap-2 text-left">
        <div className="rounded-panel bg-tinta-800/60 p-3">
          <p className="text-xs text-tinta-400">Mejor combo</p>
          <p className="text-2xl font-black text-racha-300">{mejorCombo}</p>
        </div>
        <div className="rounded-panel bg-tinta-800/60 p-3">
          <p className="text-xs text-tinta-400">Repeticiones perfectas</p>
          <p className="text-2xl font-black text-marca-300">{perfectas}</p>
        </div>
      </div>

      <RadarFatiga totales={totales} color={colorGel} />

      <div className="w-full max-w-sm space-y-3 text-left">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="rounded-panel border border-linea bg-tinta-900/60 p-3">
            <p className="mb-1.5 text-sm font-bold text-tinta-100">{grupo.nombre}</p>
            <ul className="space-y-0.5">
              {grupo.ejercicios.map((ejercicio) => (
                <li key={ejercicio} className="flex justify-between text-sm text-tinta-200">
                  <span>{nombreEjercicio(ejercicio)}</span>
                  <span className="font-bold text-tinta-100">{valorDe(ejercicio, reps, segundos)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 w-full max-w-sm space-y-1 border-t border-linea pt-3 text-left">
        <p className="flex justify-between text-sm">
          <span className="text-tinta-300">Repeticiones totales</span>
          <span className="font-black text-aviso-300">{totalReps}</span>
        </p>
        {totalSegundos > 0 && (
          <p className="flex justify-between text-sm">
            <span className="text-tinta-300">Tiempo sostenido</span>
            <span className="font-black text-aviso-300">{formatearDuracion(totalSegundos)}</span>
          </p>
        )}
      </div>

      <div className="mt-5 flex w-full max-w-sm gap-3">
        <button
          onClick={handleRepetir}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha bg-marca-500 px-5 text-lg font-bold text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="reproducir" tamano={18} />
          Repetir clase
        </button>
        <button
          onClick={handleVolver}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha border border-linea bg-tinta-800/60 px-5 text-lg font-bold text-tinta-100 transition hover:bg-tinta-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="casa" tamano={18} />
          Volver
        </button>
      </div>
    </div>
  );
}
