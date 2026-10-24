import { beforeEach, describe, it, expect } from 'vitest';
import { useWorkoutStore } from './workoutStore';

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
