import { esDeTiempo } from './ejercicios';

export function separarTotales(totales) {
  const reps = {};
  const segundos = {};
  for (const [ejercicio, valor] of Object.entries(totales || {})) {
    if (esDeTiempo(ejercicio)) segundos[ejercicio] = valor || 0;
    else reps[ejercicio] = valor || 0;
  }
  return { reps, segundos };
}

export function calcularTotal(totales) {
  return Object.entries(totales || {}).reduce(
    (acc, [ejercicio, valor]) => acc + (esDeTiempo(ejercicio) ? 0 : valor || 0),
    0
  );
}

export function calcularSegundos(totales) {
  return Object.entries(totales || {}).reduce(
    (acc, [ejercicio, valor]) => acc + (esDeTiempo(ejercicio) ? valor || 0 : 0),
    0
  );
}
