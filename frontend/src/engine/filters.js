export class OneEuroFilter {
  constructor({ minCutoff = 1, beta = 0.007, dCutoff = 1 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.lastValue = null;
    this.lastDerivative = null;
    this.lastTime = null;
  }

  static alpha(cutoff, deltaSeconds) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / deltaSeconds);
  }

  filter(value, timestampMs = Date.now()) {
    if (!Number.isFinite(value)) return value;
    if (this.lastValue == null || this.lastTime == null) {
      this.lastValue = value;
      this.lastTime = timestampMs;
      return value;
    }

    const deltaMs = timestampMs - this.lastTime;
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return this.lastValue;

    const deltaSeconds = Math.max(deltaMs / 1000, 1 / 240);
    const derivative = (value - this.lastValue) / deltaSeconds;
    const alphaDerivative = OneEuroFilter.alpha(this.dCutoff, deltaSeconds);
    const filteredDerivative =
      this.lastDerivative == null
        ? derivative
        : alphaDerivative * derivative + (1 - alphaDerivative) * this.lastDerivative;

    const cutoff = this.minCutoff + this.beta * Math.abs(filteredDerivative);
    const alpha = OneEuroFilter.alpha(cutoff, deltaSeconds);
    const filtered = alpha * value + (1 - alpha) * this.lastValue;

    this.lastValue = filtered;
    this.lastDerivative = filteredDerivative;
    this.lastTime = timestampMs;
    return filtered;
  }
}

const OPCIONES_LANDMARKS = Object.freeze({
  minCutoff: 1,
  beta: 0.05,
  dCutoff: 1,
});

export function crearFiltrosLandmarks(cantidad = 33, opciones = OPCIONES_LANDMARKS) {
  return Array.from({ length: cantidad }, () => ({
    x: new OneEuroFilter(opciones),
    y: new OneEuroFilter(opciones),
    z: new OneEuroFilter(opciones),
  }));
}

export function reiniciarFiltros(filtros) {
  for (const filtro of filtros) {
    filtro.x.reset();
    filtro.y.reset();
    filtro.z.reset();
  }
}

export function filtrarLandmarks(landmarks, filtros, timestampMs) {
  return landmarks.map((landmark, i) => {
    const filtro = filtros[i];
    if (!filtro) return landmark;
    return {
      ...landmark,
      x: filtro.x.filter(landmark.x, timestampMs),
      y: filtro.y.filter(landmark.y, timestampMs),
      z: filtro.z.filter(landmark.z ?? 0, timestampMs),
    };
  });
}
