import { describe, it, expect } from 'vitest';
import { EJERCICIOS } from './circuito';
import {
  DEMOS,
  ARTICULACIONES,
  HUESOS,
  obtenerDemo,
  guionDemo,
  interpolarPose,
  poseEnTiempo,
} from './demos';

describe('DEMOS', () => {
  it('tiene una demo para cada ejercicio', () => {
    for (const ejercicio of EJERCICIOS) {
      const demo = DEMOS[ejercicio];
      expect(demo).toBeTruthy();
      expect(demo.nombre.length).toBeGreaterThan(0);
      expect(demo.cicloMs).toBeGreaterThan(0);
      expect(demo.pistas.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('usa keyframes ordenados de 0 a 1', () => {
    for (const ejercicio of EJERCICIOS) {
      const { keyframes } = DEMOS[ejercicio];
      expect(keyframes[0].t).toBe(0);
      expect(keyframes[keyframes.length - 1].t).toBe(1);
      for (let i = 1; i < keyframes.length; i += 1) {
        expect(keyframes[i].t).toBeGreaterThan(keyframes[i - 1].t);
      }
    }
  });

  it('define todas las articulaciones dentro del lienzo', () => {
    for (const ejercicio of EJERCICIOS) {
      for (const keyframe of DEMOS[ejercicio].keyframes) {
        for (const articulacion of ARTICULACIONES) {
          const punto = keyframe.pose[articulacion];
          expect(punto, `${ejercicio}.${articulacion}`).toBeTruthy();
          expect(punto.x).toBeGreaterThanOrEqual(0);
          expect(punto.x).toBeLessThanOrEqual(1);
          expect(punto.y).toBeGreaterThanOrEqual(0);
          expect(punto.y).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('conecta solo articulaciones existentes', () => {
    for (const [a, b] of HUESOS) {
      expect(ARTICULACIONES).toContain(a);
      expect(ARTICULACIONES).toContain(b);
    }
  });

  it('cae en la primera demo si el ejercicio no existe', () => {
    expect(obtenerDemo('NO_EXISTE')).toBe(DEMOS.SENTADILLAS);
  });

  it('arma un guion con nombre y pistas', () => {
    const guion = guionDemo('FLEXIONES');
    expect(guion).toContain('Flexión');
    for (const pista of DEMOS.FLEXIONES.pistas) {
      expect(guion).toContain(pista);
    }
  });
});

describe('interpolarPose', () => {
  it('devuelve los extremos sin cambios', () => {
    const inicio = DEMOS.SENTADILLAS.keyframes[0].pose;
    const fin = DEMOS.SENTADILLAS.keyframes[1].pose;
    expect(interpolarPose(inicio, fin, 0)).toEqual(inicio);
    expect(interpolarPose(inicio, fin, 1)).toEqual(fin);
  });

  it('calcula el punto medio', () => {
    const a = { ...DEMOS.SENTADILLAS.keyframes[0].pose };
    const b = { ...DEMOS.SENTADILLAS.keyframes[1].pose };
    const medio = interpolarPose(a, b, 0.5);
    expect(medio.cabeza.x).toBeCloseTo((a.cabeza.x + b.cabeza.x) / 2, 6);
    expect(medio.cabeza.y).toBeCloseTo((a.cabeza.y + b.cabeza.y) / 2, 6);
  });

  it('recorta valores fuera de rango', () => {
    const inicio = DEMOS.SENTADILLAS.keyframes[0].pose;
    const fin = DEMOS.SENTADILLAS.keyframes[1].pose;
    expect(interpolarPose(inicio, fin, -3)).toEqual(inicio);
    expect(interpolarPose(inicio, fin, 4)).toEqual(fin);
  });
});

describe('poseEnTiempo', () => {
  it('empieza y termina en la pose inicial del ciclo', () => {
    const demo = DEMOS.SENTADILLAS;
    const primera = demo.keyframes[0].pose;
    expect(poseEnTiempo(demo, 0)).toEqual(primera);
    expect(poseEnTiempo(demo, demo.cicloMs)).toEqual(primera);
  });

  it('llega a la pose baja en su keyframe', () => {
    const demo = DEMOS.JUMPING_JACKS;
    const abierto = poseEnTiempo(demo, demo.cicloMs * 0.35);
    expect(abierto.munecaI.y).toBeCloseTo(demo.keyframes[1].pose.munecaI.y, 6);
    expect(abierto.tobilloD.x).toBeCloseTo(demo.keyframes[1].pose.tobilloD.x, 6);
  });

  it('maneja tiempos negativos', () => {
    const demo = DEMOS.FLEXIONES;
    expect(poseEnTiempo(demo, -demo.cicloMs)).toEqual(demo.keyframes[0].pose);
  });
});
