import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const URL_WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

let poseLandmarker = null;

self.onmessage = async (evento) => {
  const { tipo, payload } = evento.data;

  if (tipo === 'INIT') {
    const { modelos, delegate } = payload;
    try {
      const vision = await FilesetResolver.forVisionTasks(URL_WASM);

      // Misma cadena de respaldo que el hilo principal: cada modelo con el
      // delegate pedido y, si falla, con CPU. Se queda el primero que cargue.
      for (const modelUrl of modelos) {
        for (const d of [delegate || 'GPU', 'CPU']) {
          try {
            poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: modelUrl, delegate: d },
              runningMode: 'VIDEO',
              numPoses: 1,
            });
            self.postMessage({ tipo: 'READY' });
            return;
          } catch (err) {
            console.warn('poseWorker: fallo cargando', modelUrl, d, err);
          }
        }
      }
      self.postMessage({
        tipo: 'ERROR',
        fase: 'INIT',
        error: 'Ningún modelo pose pudo cargarse en el worker',
      });
    } catch (err) {
      self.postMessage({ tipo: 'ERROR', fase: 'INIT', error: err.message });
    }
  }

  if (tipo === 'DETECT') {
    if (!poseLandmarker) return;
    const { bitmap, timestampMs } = payload;
    try {
      // Procesamos la imagen en el hilo secundario
      const results = poseLandmarker.detectForVideo(bitmap, timestampMs);
      // Enviamos landmarks de vuelta al hilo principal de React
      self.postMessage({
        tipo: 'RESULTADOS',
        landmarks: results.landmarks,
        timestampMs,
      });
    } catch (err) {
      // Desbloqueamos al hilo principal aunque la inferencia falle
      self.postMessage({ tipo: 'ERROR', fase: 'DETECT', error: err.message });
    } finally {
      // Liberamos la memoria del ImageBitmap procesado
      bitmap.close();
    }
  }
};
