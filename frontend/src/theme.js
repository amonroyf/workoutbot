import { obtenerArquetipo } from './engine/clases';

const GEL_POR_DEFECTO = '#ff6a2b';

export function colorArquetipo(id) {
  return obtenerArquetipo(id)?.color || GEL_POR_DEFECTO;
}

export function estiloGel(id) {
  return { '--gel': colorArquetipo(id) };
}
