export const CLAVE_RESUMEN = 'workoutbot:resumen_local';

export function cargarResumenLocal() {
  try {
    const guardado = localStorage.getItem(CLAVE_RESUMEN);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {}
  
  // Estructura por defecto si es usuario nuevo
  return { 
    racha: 0, 
    meta_semanal: 3, 
    dias_semana: 0, 
    semana: Array.from({length: 7}).map((_, i) => ({
      fecha: String(i), 
      etiqueta: ['L','M','X','J','V','S','D'][i], 
      hecha: false, 
      hoy: i === (new Date().getDay() + 6) % 7
    })), 
    ultima: null, 
    anterior: null 
  };
}

export function guardarEntrenamientoLocal(nuevoEntrenamiento) {
  const resumen = cargarResumenLocal();
  const hoy = new Date().toISOString().split('T')[0];
  
  resumen.anterior = resumen.ultima;
  resumen.ultima = nuevoEntrenamiento;
  
  if (resumen.ultimaFecha !== hoy) {
     resumen.racha += 1;
     resumen.dias_semana = Math.min(resumen.meta_semanal, resumen.dias_semana + 1);
     resumen.ultimaFecha = hoy;
  }
  
  const diaIndice = (new Date().getDay() + 6) % 7;
  if (resumen.semana[diaIndice]) {
    resumen.semana[diaIndice].hecha = true;
  }

  localStorage.setItem(CLAVE_RESUMEN, JSON.stringify(resumen));
  return resumen;
}

