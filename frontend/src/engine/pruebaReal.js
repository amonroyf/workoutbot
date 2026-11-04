import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export function cargarFixture(nombre) {
  const base = dirname(fileURLToPath(import.meta.url));
  const ruta = join(base, '__fixtures__', 'real', nombre);
  return JSON.parse(readFileSync(ruta, 'utf-8'));
}

export function ejecutarDetector(detector, fixture, crearEstado) {
  const estado0 = crearEstado ? crearEstado() : null;
  let estado = estado0;
  let repeticiones = 0;
  let framesConPose = 0;
  for (const f of fixture.frames) {
    if (!f.landmarks) continue;
    framesConPose++;
    const r = detector(f.landmarks, estado, (f.frame / (fixture.fps || 30)) * 1000);
    estado = r.estado;
    if (r.repeticion) repeticiones++;
  }
  return { estado, repeticiones, framesConPose, totalFrames: fixture.frames.length };
}
