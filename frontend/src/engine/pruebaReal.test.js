import { describe, it, expect } from 'vitest';
import { cargarFixture, ejecutarDetector } from './pruebaReal';
import {
  detectarSentadilla,
  detectarZancada,
  detectarPesoMuerto,
  detectarRemo,
  detectarPlanchaLateral,
  detectarRotacionTorso,
  detectarDeadBug,
  detectarPuenteGluteo,
  detectarFlexion,
  detectarRodillasAltas,
  detectarPressHombro,
  detectarAbdominal,
  detectarJumpingJack,
  crearEstadoDetector,
} from './detectors';

const CASOS = [
  { fixture: 'squat.landmarks.json', detector: detectarSentadilla, nombre: 'squat' },
  { fixture: 'squatjump.landmarks.json', detector: detectarSentadilla, nombre: 'squat jump' },
  { fixture: 'rotatinglunge.landmarks.json', detector: detectarZancada, nombre: 'rotating lunge' },
  { fixture: 'reverselunge.landmarks.json', detector: detectarZancada, nombre: 'reverse lunge' },
  { fixture: 'singlelegdeadlift.landmarks.json', detector: detectarPesoMuerto, nombre: 'single-leg deadlift' },
  { fixture: 'suitcasedeadlift.landmarks.json', detector: detectarPesoMuerto, nombre: 'suitcase deadlift' },
  { fixture: 'kettlebell.landmarks.json', detector: detectarPesoMuerto, nombre: 'kettlebell' },
  { fixture: 'tbarrow.landmarks.json', detector: detectarRemo, nombre: 't-bar row' },
  { fixture: 'bentoverrow.landmarks.json', detector: detectarRemo, nombre: 'bent-over row' },
  { fixture: 'renegaderow.landmarks.json', detector: detectarRemo, nombre: 'renegade row' },
  { fixture: 'copenhagensideplank.landmarks.json', detector: detectarPlanchaLateral, nombre: 'copenhagen side plank' },
  { fixture: 'sideplank.landmarks.json', detector: detectarPlanchaLateral, nombre: 'side plank' },
  { fixture: 'antirotation.landmarks.json', detector: detectarRotacionTorso, nombre: 'anti-rotation' },
  { fixture: 'deadbug.landmarks.json', detector: detectarDeadBug, nombre: 'dead bug' },
  { fixture: 'bridge.landmarks.json', detector: detectarPuenteGluteo, nombre: 'bridge' },
  { fixture: 'manmaker.landmarks.json', detector: detectarFlexion, nombre: 'man maker' },
  { fixture: 'jumprope.landmarks.json', detector: detectarRodillasAltas, nombre: 'jump rope' },
  { fixture: 'landminepress.landmarks.json', detector: detectarPressHombro, nombre: 'landmine press' },
  { fixture: 'psoasmarch.landmarks.json', detector: detectarRodillasAltas, nombre: 'psoas march' },
  { fixture: 'pelvicfloor.landmarks.json', detector: detectarAbdominal, nombre: 'pelvic floor' },
  { fixture: 'jumpingjacks.landmarks.json', detector: detectarJumpingJack, nombre: 'jumping jacks' },
];

describe('pruebas reales - landmarks MediaPipe de videos CC', () => {
  for (const c of CASOS) {
    it(`procesa ${c.nombre} sin errores y cuenta repeticiones`, () => {
      const fixture = cargarFixture(c.fixture);
      const r = ejecutarDetector(c.detector, fixture, crearEstadoDetector);
      expect(r.framesConPose).toBeGreaterThan(0);
      expect(r.totalFrames).toBeGreaterThan(50);
      expect(typeof r.repeticiones).toBe('number');
    });
  }
});
