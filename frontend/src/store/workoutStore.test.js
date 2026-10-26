import { beforeEach, describe, it, expect } from 'vitest';
import { useWorkoutStore } from './workoutStore';
import { estadoInicialCircuito } from '../engine/circuito';
import { CLASE_INICIAL, duracionClase } from '../engine/clases';

beforeEach(() => {
  useWorkoutStore.getState().detenerRutina();
  useWorkoutStore.setState({
    camaraHabilitada: true,
    camaraActiva: false,
    errorCamara: null,
    pausado: false,
    pausadoPor: null,
    repeticiones: 0,
    combo: 0,
    facingMode: 'user',
  });
});

describe('setCamaraHabilitada', () => {
  it('apaga la camara y limpia el error', () => {
    useWorkoutStore.setState({ camaraActiva: true, errorCamara: 'sin permiso' });
    useWorkoutStore.getState().setCamaraHabilitada(false);

    const estado = useWorkoutStore.getState();
    expect(estado.camaraHabilitada).toBe(false);
    expect(estado.camaraActiva).toBe(false);
    expect(estado.errorCamara).toBe(null);
  });

  it('la vuelve a activar', () => {
    useWorkoutStore.getState().setCamaraHabilitada(false);
    useWorkoutStore.getState().setCamaraHabilitada(true);
    expect(useWorkoutStore.getState().camaraHabilitada).toBe(true);
  });
});

describe('quitarRepeticion', () => {
  it('resta una repeticion y reinicia el combo', () => {
    useWorkoutStore.setState({ repeticiones: 5, combo: 4 });
    useWorkoutStore.getState().quitarRepeticion();

    const estado = useWorkoutStore.getState();
    expect(estado.repeticiones).toBe(4);
    expect(estado.combo).toBe(0);
  });

  it('no baja de cero', () => {
    useWorkoutStore.setState({ repeticiones: 0, combo: 7 });
    useWorkoutStore.getState().quitarRepeticion();

    expect(useWorkoutStore.getState().repeticiones).toBe(0);
    expect(useWorkoutStore.getState().combo).toBe(0);
  });
});

describe('toggleFacingMode', () => {
  it('parte de la camara frontal', () => {
    expect(useWorkoutStore.getState().facingMode).toBe('user');
  });

  it('alterna entre frontal y trasera', () => {
    useWorkoutStore.getState().toggleFacingMode();
    expect(useWorkoutStore.getState().facingMode).toBe('environment');

    useWorkoutStore.getState().toggleFacingMode();
    expect(useWorkoutStore.getState().facingMode).toBe('user');
  });
});

describe('sincronizarReloj', () => {
  it('avanza todas las fases vencidas hasta FIN si la clase termino en segundo plano', () => {
    const clase = CLASE_INICIAL;
    const inicioAtrasado = Date.now() - (duracionClase(clase) + 5) * 1000;
    useWorkoutStore.setState({
      ...estadoInicialCircuito(inicioAtrasado, clase),
      claseActual: clase,
      pausado: false,
    });

    useWorkoutStore.getState().sincronizarReloj();

    const estado = useWorkoutStore.getState();
    expect(estado.faseActual).toBe('FIN');
    expect(estado.finFaseEn).toBe(null);
  });

  it('toma el relevo en la fase siguiente cuando solo paso un tramo en segundo plano', () => {
    const clase = CLASE_INICIAL;
    const haceUnTramo = Date.now() - 5 * 1000;
    useWorkoutStore.setState({
      ...estadoInicialCircuito(haceUnTramo, clase),
      claseActual: clase,
      pausado: false,
    });

    useWorkoutStore.getState().sincronizarReloj();

    const estado = useWorkoutStore.getState();
    const avanzadoLaFase =
      estado.faseActual !== 'TRABAJO' || estado.bloqueActual !== 0 || estado.repeticiones === 0;
    expect(avanzadoLaFase).toBe(true);
    expect(estado.finFaseEn).toBeGreaterThan(Date.now());
    expect(estado.tiempoRestante).toBeGreaterThan(0);
  });

  it('no adelanta el reloj si la rutina esta pausada', () => {
    const clase = CLASE_INICIAL;
    const haceUnTramo = Date.now() - 5 * 1000;
    useWorkoutStore.setState({
      ...estadoInicialCircuito(haceUnTramo, clase),
      claseActual: clase,
      pausado: true,
      pausadoPor: 'manual',
    });

    useWorkoutStore.getState().sincronizarReloj();

    const estado = useWorkoutStore.getState();
    expect(estado.faseActual).toBe('TRABAJO');
    expect(estado.finFaseEn).not.toBe(null);
  });

  it('no hace nada en CALIBRACION', () => {
    useWorkoutStore.getState().sincronizarReloj();
    expect(useWorkoutStore.getState().faseActual).toBe('CALIBRACION');
  });
});
