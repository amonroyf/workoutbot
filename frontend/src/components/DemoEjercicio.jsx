import React, { useEffect, useRef } from 'react';
import { HUESOS, obtenerDemo, poseEnTiempo } from '../engine/demos';

function dibujarPose(ctx, pose, ancho, alto) {
  const lado = Math.min(ancho, alto);
  const offsetX = (ancho - lado) / 2;
  const offsetY = (alto - lado) / 2;
  const x = (punto) => offsetX + punto.x * lado;
  const y = (punto) => offsetY + punto.y * lado;

  ctx.clearRect(0, 0, ancho, alto);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(offsetX + lado * 0.12, offsetY + lado * 0.95);
  ctx.lineTo(offsetX + lado * 0.88, offsetY + lado * 0.95);
  ctx.stroke();

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = Math.max(3, lado * 0.018);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [a, b] of HUESOS) {
    ctx.beginPath();
    ctx.moveTo(x(pose[a]), y(pose[a]));
    ctx.lineTo(x(pose[b]), y(pose[b]));
    ctx.stroke();
  }

  const cabeza = pose.cabeza;
  ctx.beginPath();
  ctx.arc(x(cabeza), y(cabeza), lado * 0.055, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  for (const articulacion of ['hombroI', 'hombroD', 'codoI', 'codoD', 'rodillaI', 'rodillaD']) {
    ctx.beginPath();
    ctx.arc(x(pose[articulacion]), y(pose[articulacion]), Math.max(1.8, lado * 0.011), 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function DemoEjercicio({ ejercicio, compacto = false, esquina = false, pequena = false }) {
  const canvasRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0 }); // Cache de tamaño
  const demo = obtenerDemo(ejercicio);

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
    let frame = null;
    const inicio = performance.now();

    const dibujar = (ahora) => {
      const dpr = window.devicePixelRatio || 1;
      // LECTURA DESDE EL CACHE (Sin Layout Thrashing)
      const ancho = sizeRef.current.width;
      const alto = sizeRef.current.height;

      if (ancho > 0 && alto > 0) {
        const anchoFisico = Math.round(ancho * dpr);
        const altoFisico = Math.round(alto * dpr);
        if (canvas.width !== anchoFisico || canvas.height !== altoFisico) {
          canvas.width = anchoFisico;
          canvas.height = altoFisico;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dibujarPose(ctx, poseEnTiempo(demo, ahora - inicio), ancho, alto);
      }
      frame = requestAnimationFrame(dibujar);
    };
    
    frame = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(frame);
  }, [demo]);

  const tamano = pequena
    ? 'h-16 w-16'
    : esquina
      ? 'h-24 w-24 md:h-28 md:w-28'
      : compacto
        ? 'h-36 w-36'
        : 'aspect-square w-full max-w-xs';

  return (
    <div className={tamano}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Demostración de ${demo.nombre}`}
        className="h-full w-full block"
      />
    </div>
  );
}
