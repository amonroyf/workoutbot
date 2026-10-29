import React, { useEffect, useState, useRef } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import {
  ALTURA_TECHO_INICIO,
  CABEZA_Y,
  GROSOR_TECHO,
  TIEMPO_APLASTADO_MS,
  UMBRAL_SOSTEN,
  actualizarJuegoTecho,
  crearJuegoTecho,
  reintentarTecho,
  segundosSobrevividos,
} from '../engine/techo';

const COLOR_MARCA = '#4ade80';
const COLOR_AVISO = '#fbbf24';
const COLOR_ERROR = '#f87171';
const COLOR_TINTA = '#f1f5f9';

function rr(ctx, x, y, ancho, alto, radio) {
  const r = Math.min(radio, ancho / 2, alto / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, r);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, r);
  ctx.arcTo(x, y + alto, x, y, r);
  ctx.arcTo(x, y, x + ancho, y, r);
  ctx.closePath();
}

function colorTecho(progreso) {
  if (progreso < 0.4) return COLOR_MARCA;
  if (progreso < 0.7) return COLOR_AVISO;
  return COLOR_ERROR;
}

export default function MinijuegoTecho() {
  const canvasRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 }); // Cache de tamaño
  const juegoRef = useRef(crearJuegoTecho());
  const reaparicionRef = useRef(0);
  const sacudidaRef = useRef(0);
  const segundosPreviosRef = useRef(-1);
  const [panel, setPanel] = useState({ segundos: 0, mejor: 0, intentos: 1 });

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      sizeRef.current.width = entry.contentRect.width;
      sizeRef.current.height = entry.contentRect.height;
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let detenido = false;

    const dibujar = () => {
      if (detenido) return;
      raf = requestAnimationFrame(dibujar);
      const store = useWorkoutStore.getState();
      const ahora = performance.now();
      let juego = juegoRef.current;

      if (!store.pausado && juego.aplastado && ahora >= reaparicionRef.current) {
        juego = reintentarTecho(juego, ahora);
        juegoRef.current = juego;
      }

      if (!store.pausado && !juego.aplastado) {
        const r = actualizarJuegoTecho(juego, store.scoreForma, ahora);
        juegoRef.current = r.estado;
        juego = r.estado;
        if (r.aplasto) {
          reaparicionRef.current = ahora + TIEMPO_APLASTADO_MS;
          sacudidaRef.current = ahora + 420;
        }
      }

      const dpr = window.devicePixelRatio || 1;
      const ancho = sizeRef.current.width;
      const alto = sizeRef.current.height;
      const anchoPx = Math.round(ancho * dpr);
      const altoPx = Math.round(alto * dpr);

      if (anchoPx > 0 && altoPx > 0 && (canvas.width !== anchoPx || canvas.height !== altoPx)) {
        canvas.width = anchoPx;
        canvas.height = altoPx;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);

      const segundos = segundosSobrevividos(juego);
      if (segundos !== segundosPreviosRef.current) {
        segundosPreviosRef.current = segundos;
        setPanel({
          segundos,
          mejor: Math.floor(juego.mejorMs / 1000),
          intentos: juego.intentos,
        });
      }

      const sacudir = ahora < sacudidaRef.current;
      ctx.save();
      if (sacudir) {
        ctx.translate((Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 4);
      }

      rr(ctx, 0.5, 0.5, ancho - 1, alto - 1, 18);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const yTecho = juego.altura * alto;
      const grosor = GROSOR_TECHO * alto;
      const caidaTotal = CABEZA_Y - ALTURA_TECHO_INICIO;
      const progreso = Math.max(0, Math.min(1, (juego.altura - ALTURA_TECHO_INICIO) / caidaTotal));

      const baseTecho = juego.aplastado ? COLOR_ERROR : colorTecho(progreso);
      ctx.save();
      rr(ctx, 6, yTecho, ancho - 12, grosor, 8);
      ctx.fillStyle = baseTecho;
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 5;
      for (let x = -grosor; x < ancho; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, yTecho + grosor + 6);
        ctx.lineTo(x + grosor + 6, yTecho - 6);
        ctx.stroke();
      }
      ctx.restore();

      if (!juego.aplastado && progreso > 0.45) {
        ctx.fillStyle = '#0f172a';
        const cyOjos = yTecho + grosor / 2;
        [-1, 1].forEach((lado) => {
          const cxOjo = ancho / 2 + lado * ancho * 0.06;
          ctx.beginPath();
          ctx.arc(cxOjo, cyOjos, Math.min(5, grosor / 4), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      const soporte = juego.scoreSuavizado != null && juego.scoreSuavizado >= UMBRAL_SOSTEN;
      const colorCuerpo = juego.aplastado ? COLOR_ERROR : soporte ? COLOR_MARCA : COLOR_TINTA;
      const cx = ancho / 2;
      const cabezaCy = CABEZA_Y * alto + altop(alto);

      ctx.strokeStyle = colorCuerpo;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      [-1, 1].forEach((lado) => {
        ctx.beginPath();
        ctx.moveTo(cx + lado * 10, cabezaCy + altop(alto) * 1.4);
        ctx.lineTo(cx + lado * 14, yTecho + grosor * 0.5 + 10);
        ctx.lineTo(cx + lado * 10, yTecho + grosor + 2);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(cx, cabezaCy + altop(alto));
      ctx.lineTo(cx - 8, alto * 0.72);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 8, alto * 0.72);
      ctx.lineTo(cx + 18, alto * 0.72);
      ctx.lineTo(cx + 18, alto * 0.92);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 18, alto * 0.92);
      ctx.lineTo(cx + 26, alto * 0.92);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cabezaCy, altop(alto), 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = 'center';
      if (juego.aplastado) {
        ctx.fillStyle = COLOR_ERROR;
        ctx.font = '900 26px system-ui, sans-serif';
        ctx.fillText('¡APLASTADO!', cx, alto * 0.42);
      } else {
        ctx.fillStyle = COLOR_TINTA;
        ctx.font = '800 22px system-ui, sans-serif';
        ctx.fillText(`Aguanta ${segundos}s`, cx, alto * 0.82);
      }

      const ya = alto - 10;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      rr(ctx, 10, ya, ancho - 20, 5, 3);
      ctx.fill();

      if (juego.scoreSuavizado != null) {
        const soporteOK = juego.scoreSuavizado >= UMBRAL_SOSTEN;
        ctx.fillStyle = soporteOK ? COLOR_MARCA : COLOR_AVISO;
        rr(ctx, 10, ya, ((ancho - 20) * juego.scoreSuavizado) / 100, 5, 3);
        ctx.fill();
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(dibujar);
    return () => {
      detenido = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-tinta-300">
        <span>Aguanta {panel.segundos}s</span>
        <span>Intento {panel.intentos} • Mejor {panel.mejor}s</span>
      </div>
      <canvas ref={canvasRef} className="h-56 w-full rounded-panel border border-linea block" />
    </div>
  );
}

function altop(alto) {
  return alto * 0.045;
}
