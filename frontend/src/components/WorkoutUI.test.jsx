// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import WorkoutUI from './WorkoutUI';
import { useWorkoutStore } from '../store/workoutStore';
import { CLASES } from '../engine/clases';

// El motor de música y MediaPipe no corren en jsdom: los sustituimos por stubs
vi.mock('../hooks/useMusica', () => ({ useMusica: () => {} }));
vi.mock('../hooks/useMediaPipe', () => ({
  useMediaPipe: () => ({ isLoaded: true, modeloActivo: 'lite' }),
}));

const clase = CLASES[0];

function preparar(overrides = {}) {
  useWorkoutStore.setState({
    faseActual: 'TRABAJO',
    claseActual: clase,
    claseSeleccionadaId: clase.id,
    bloqueActual: 0,
    ejercicioActual: 'SENTADILLAS',
    tiempoRestante: 30,
    repeticiones: 4,
    combo: 0,
    scoreForma: null,
    mensajeForma: null,
    subtitulo: null,
    pausado: false,
    pausadoPor: null,
    demoAbierta: false,
    demoEjercicio: null,
    camaraHabilitada: true,
    errorCamara: null,
    avisoMusica: null,
    flashPerfecta: 0,
    faseRepeticion: 'ARRIBA',
    vozActiva: false,
    musicaActiva: false,
    ...overrides,
  });
}

function claseConInclude(el, fragmento) {
  return (el && typeof el.className === 'string' && el.className.includes(fragmento)) || false;
}

describe('WorkoutUI — cambios de UX sobre el feed de cámara', () => {
  beforeEach(() => preparar());
  afterEach(() => cleanup());

  it('protege el header con un scrim superior de degradado fuerte', () => {
    const { container } = render(<WorkoutUI />);
    const scrims = [...container.querySelectorAll('div')].filter((d) =>
      claseConInclude(d, 'from-tinta-950/90')
    );
    expect(scrims.length).toBe(1);
  });

  it('protege el pie con un scrim inferior antes de la barra de controles', () => {
    const { container } = render(<WorkoutUI />);
    const scrims = [...container.querySelectorAll('div')].filter((d) =>
      claseConInclude(d, 'from-tinta-950/95')
    );
    expect(scrims.length).toBe(1);
  });

  it('agrupa repeticiones y estado en la tarjeta flotante de alta contraste', () => {
    const { container } = render(<WorkoutUI />);
    expect(screen.getByText('Reps')).toBeTruthy();

    let panel = screen.getByText('Reps');
    while (panel && !claseConInclude(panel, 'backdrop-blur-xl')) {
      panel = panel.parentElement;
    }
    expect(panel).toBeTruthy();
    expect(claseConInclude(panel, 'bg-tinta-950/70')).toBe(true);
    expect(claseConInclude(panel, 'border-2')).toBe(true);

    // Interfaz 10-foot: los botones manuales -1/+1 quedan fuera de la tarjeta
    expect(screen.queryByLabelText('Sumar una repetición')).toBeNull();
    expect(screen.queryByLabelText('Quitar una repetición')).toBeNull();

    // El AnilloRep es grueso: trazos de 10 unidades
    expect(
      container.querySelectorAll('circle[stroke-width="10"]').length
    ).toBeGreaterThan(0);
  });

  it('usa un cronómetro gigante con dígitos tabulares', () => {
    render(<WorkoutUI />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('30');
    expect(claseConInclude(h1, 'tabular-nums')).toBe(true);
    expect(claseConInclude(h1, 'text-[130px]')).toBe(true);
    expect(claseConInclude(h1, 'text-white')).toBe(true);
  });

  it('oculta el panel de repeticiones en ejercicios de tiempo', () => {
    preparar({ ejercicioActual: 'PLANCHA' });
    const { container } = render(<WorkoutUI />);
    expect(screen.queryByText('Repeticiones')).toBeNull();
    expect(container).toBeTruthy();
  });

  it('destaca el botón Pausa con área táctil de 56px y apaga el estado visual de Voz', () => {
    render(<WorkoutUI />);
    const pausa = screen.getByText('Pausa').closest('button');
    expect(claseConInclude(pausa, 'min-h-14')).toBe(true);
    expect(claseConInclude(pausa, 'shadow-flotante')).toBe(true);

    const btnVoz = screen.getByLabelText('Activar la voz');
    expect(claseConInclude(btnVoz, 'h-14 w-14')).toBe(true);
    expect(claseConInclude(btnVoz, 'text-tinta-500')).toBe(true);
  });

  it('usa botones solo-ícono con estado activo en Voz y Música', () => {
    preparar({ vozActiva: true, musicaActiva: true });
    render(<WorkoutUI />);
    const btnVoz = screen.getByLabelText('Silenciar la voz');
    const btnMusica = screen.getByLabelText('Apagar la música');
    expect(claseConInclude(btnVoz, 'text-marca-300')).toBe(true);
    expect(claseConInclude(btnMusica, 'bg-marca-500/20')).toBe(true);
  });

  it('muestra el mensaje de corrección como toaster animado con borde de aviso', () => {
    preparar({ mensajeForma: 'Abre las rodillas hacia afuera', subtitulo: null });
    render(<WorkoutUI />);
    const mensaje = screen.getByText('Abre las rodillas hacia afuera');
    expect(claseConInclude(mensaje, 'border-aviso-400')).toBe(true);
    expect(claseConInclude(mensaje.parentElement, 'animate-pulse')).toBe(true);
  });

  it('los textos informativos usan el panel neutro sin borde de aviso', () => {
    preparar({ mensajeForma: null, subtitulo: 'Ronda 2 de 3' });
    render(<WorkoutUI />);
    const mensaje = screen.getByText('Ronda 2 de 3');
    expect(claseConInclude(mensaje, 'border-tinta-600')).toBe(true);
    expect(claseConInclude(mensaje, 'border-aviso-400')).toBe(false);
  });

  it('muestra el chip de orientación óptica para el ejercicio actual', () => {
    render(<WorkoutUI />);
    expect(screen.getByText('Ubica la cámara de lado (perfil)')).toBeTruthy();
  });

  it('enciende el viñeteado periférico rojo solo ante una corrección', () => {
    preparar({ mensajeForma: 'Abre las rodillas hacia afuera', subtitulo: null });
    const { container } = render(<WorkoutUI />);
    const viñeta = [...container.querySelectorAll('div')].filter((d) =>
      claseConInclude(d, 'shadow-[inset_0_0_120px_rgba(248,113,113,0.5)]')
    );
    expect(viñeta.length).toBe(1);
    expect(claseConInclude(viñeta[0], 'pointer-events-none')).toBe(true);
  });

  it('sin corrección no hay viñeteado de alerta', () => {
    preparar({ mensajeForma: null, subtitulo: 'Buen ritmo' });
    const { container } = render(<WorkoutUI />);
    const viñeta = [...container.querySelectorAll('div')].filter((d) =>
      claseConInclude(d, 'shadow-[inset_0_0_120px_rgba(248,113,113,0.5)]')
    );
    expect(viñeta.length).toBe(0);
  });

  it('el anillo se vuelve ámbar cuando la racha llega a 5 (On Fire)', () => {
    preparar({ combo: 5 });
    const { container } = render(<WorkoutUI />);
    expect(container.querySelector('circle[stroke="#f59e0b"]')).toBeTruthy();
    expect(screen.getByText(/ON FIRE/)).toBeTruthy();
  });

  it('el anillo usa el color del arquetipo sin racha', () => {
    preparar({ combo: 0 });
    const { container } = render(<WorkoutUI />);
    expect(container.querySelector('circle[stroke="#f59e0b"]')).toBeNull();
  });
});
