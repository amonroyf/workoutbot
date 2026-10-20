function reps(n) {
  return `${n} ${n === 1 ? 'repetición' : 'repeticiones'}`;
}

export function diferenciaReps(resumen) {
  if (!resumen?.ultima || !resumen?.anterior) return null;
  return resumen.ultima.total_reps - resumen.anterior.total_reps;
}

export function textoComparacion(resumen) {
  const delta = diferenciaReps(resumen);
  if (delta == null) return 'Primera sesión registrada en tu historial.';
  if (delta > 0) return `Mejoraste ${reps(delta)} frente a tu sesión anterior.`;
  if (delta < 0) return `Quedaste ${reps(Math.abs(delta))} por debajo de tu sesión anterior.`;
  return 'Igualaste las reps de tu sesión anterior.';
}

export function textoNarrado(resumen) {
  if (!resumen?.ultima) return '';
  const { total_reps, perfectas, mejor_combo } = resumen.ultima;
  const racha = resumen.racha;
  const partes = [
    `Resumen: ${reps(total_reps)}`,
    `${perfectas} perfectas`,
    `mejor combo de ${mejor_combo}`,
    `racha de ${racha} ${racha === 1 ? 'día' : 'días'}`,
  ];
  return `${partes.join(', ')}. ${textoComparacion(resumen)}`;
}
