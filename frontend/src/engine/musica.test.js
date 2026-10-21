import { describe, it, expect } from 'vitest';
import { bpmSeccion, BPM_POR_SECCION, BPM_POR_INTENCIDAD, BPM_POR_DEFECTO } from './musica';

describe('bpmSeccion', () => {
  it('define un BPM por tipo de sección', () => {
    expect(bpmSeccion('calentamiento')).toBe(BPM_POR_SECCION.calentamiento);
    expect(bpmSeccion('metabolico')).toBe(BPM_POR_SECCION.metabolico);
    expect(bpmSeccion('enfriamiento')).toBe(BPM_POR_SECCION.enfriamiento);
  });

  it('usa un BPM por defecto para secciones desconocidas', () => {
    expect(bpmSeccion('no-existe')).toBe(126);
  });

  it('cae a la intensidad cuando no hay sección (formato express)', () => {
    expect(bpmSeccion(undefined, 'alta')).toBe(BPM_POR_INTENCIDAD.alta);
    expect(bpmSeccion(undefined, 'suave')).toBe(BPM_POR_INTENCIDAD.suave);
    expect(bpmSeccion(undefined, 'media')).toBe(BPM_POR_INTENCIDAD.media);
  });

  it('la sección manda sobre la intensidad', () => {
    expect(bpmSeccion('enfriamiento', 'alta')).toBe(BPM_POR_SECCION.enfriamiento);
  });

  it('usa el BPM por defecto si no hay sección ni intensidad', () => {
    expect(bpmSeccion(undefined, '')).toBe(BPM_POR_DEFECTO);
  });

  it('sube el pulso en el pico metabólico y baja al enfriar', () => {
    expect(BPM_POR_SECCION.metabolico).toBeGreaterThan(BPM_POR_SECCION.calentamiento);
    expect(BPM_POR_SECCION.enfriamiento).toBeLessThan(BPM_POR_SECCION.calentamiento);
  });
});
