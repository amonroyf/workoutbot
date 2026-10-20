import { describe, it, expect } from 'vitest';
import { bpmSeccion, BPM_POR_SECCION } from './musica';

describe('bpmSeccion', () => {
  it('define un BPM por tipo de sección', () => {
    expect(bpmSeccion('calentamiento')).toBe(BPM_POR_SECCION.calentamiento);
    expect(bpmSeccion('metabolico')).toBe(BPM_POR_SECCION.metabolico);
    expect(bpmSeccion('enfriamiento')).toBe(BPM_POR_SECCION.enfriamiento);
  });

  it('usa un BPM por defecto para secciones desconocidas', () => {
    expect(bpmSeccion('no-existe')).toBe(126);
  });
});
