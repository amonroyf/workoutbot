// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import CameraFeed from './CameraFeed';
import { useWorkoutStore } from '../store/workoutStore';

vi.mock('../hooks/useMediaPipe', () => ({
  useMediaPipe: () => ({ isLoaded: true, modeloActivo: 'lite' }),
}));

let getUserMedia;

beforeEach(() => {
  getUserMedia = vi.fn(() =>
    Promise.resolve({ getTracks: () => [{ stop: vi.fn() }] })
  );
  Object.defineProperty(window.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
  useWorkoutStore.setState({
    camaraHabilitada: true,
    camaraActiva: false,
    errorCamara: null,
    reintentoCamara: 0,
    facingMode: 'user',
  });
});

afterEach(() => {
  cleanup();
});

describe('CameraFeed — orientación de la cámara', () => {
  it('pide la cámara frontal por defecto', async () => {
    render(<CameraFeed />);
    await waitFor(() =>
      expect(getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' },
        audio: false,
      })
    );
  });

  it('pide la cámara trasera al alternar facingMode', async () => {
    useWorkoutStore.getState().toggleFacingMode();
    render(<CameraFeed />);
    await waitFor(() =>
      expect(getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'environment' },
        audio: false,
      })
    );
  });
});
