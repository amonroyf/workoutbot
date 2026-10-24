import { describe, it, expect } from 'vitest';
import {
  bpmSeccion,
  BPM_POR_SECCION,
  BPM_POR_ARQUETIPO,
  BPM_POR_INTENCIDAD,
  BPM_POR_DEFECTO,
  MUSICA_POR_ARQUETIPO,
  PISTAS_POR_ARQUETIPO,
} from './musica';

describe('bpmSeccion', () => {
  it('define un BPM por tipo de sección', () => {
    expect(bpmSeccion('activacion')).toBe(BPM_POR_SECCION.activacion);
    expect(bpmSeccion('pico')).toBe(BPM_POR_SECCION.pico);
    expect(bpmSeccion('enfriamiento')).toBe(BPM_POR_SECCION.enfriamiento);
  });

  it('usa el BPM del arquetipo cuando no hay sección conocida', () => {
    expect(bpmSeccion('no-existe', '', 'hiit')).toBe(BPM_POR_ARQUETIPO.hiit);
    expect(bpmSeccion(undefined, '', 'combat')).toBe(BPM_POR_ARQUETIPO.combat);
  });

  it('usa un BPM por defecto para valores desconocidos', () => {
    expect(bpmSeccion('no-existe')).toBe(BPM_POR_DEFECTO);
  });

  it('cae a la intensidad cuando no hay sección ni arquetipo', () => {
    expect(bpmSeccion(undefined, 'alta')).toBe(BPM_POR_INTENCIDAD.alta);
    expect(bpmSeccion(undefined, 'suave')).toBe(BPM_POR_INTENCIDAD.suave);
    expect(bpmSeccion(undefined, 'media')).toBe(BPM_POR_INTENCIDAD.media);
  });

  it('la sección manda sobre el arquetipo y la intensidad', () => {
    expect(bpmSeccion('enfriamiento', 'alta', 'hiit')).toBe(BPM_POR_SECCION.enfriamiento);
  });

  it('sube el pulso en el pico y baja al enfriar', () => {
    expect(BPM_POR_SECCION.pico).toBeGreaterThan(BPM_POR_SECCION.activacion);
    expect(BPM_POR_SECCION.enfriamiento).toBeLessThan(BPM_POR_SECCION.activacion);
  });
});

describe('MUSICA_POR_ARQUETIPO', () => {
  it('define un patrón musical para cada arquetipo', () => {
    for (const arquetipo of Object.keys(BPM_POR_ARQUETIPO)) {
      expect(MUSICA_POR_ARQUETIPO[arquetipo], arquetipo).toBeTruthy();
    }
  });

  it('usa compases de 16 pasos bien formados', () => {
    for (const [arquetipo, patron] of Object.entries(MUSICA_POR_ARQUETIPO)) {
      for (const capa of ['bombo', 'caja', 'charles', 'bajo', 'lead']) {
        expect(patron[capa], `${arquetipo}.${capa}`).toHaveLength(16);
      }
      expect(patron.raiz).toBeGreaterThan(0);
      expect(patron.corte).toBeGreaterThan(0);
      expect(patron.escala.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('tiene pulso en los arquetipos con impacto', () => {
    for (const arquetipo of ['fuerza', 'hiit', 'combat']) {
      expect(MUSICA_POR_ARQUETIPO[arquetipo].bombo.some(Boolean)).toBe(true);
    }
  });

  it('empaqueta una pista CC0 para cada arquetipo', () => {
    for (const arquetipo of Object.keys(BPM_POR_ARQUETIPO)) {
      const ruta = PISTAS_POR_ARQUETIPO[arquetipo];
      expect(ruta, arquetipo).toMatch(/^\/musica\/.+\.mp3$/);
    }
  });
});
