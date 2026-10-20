import React, { useRef, useEffect, useState } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { Esqueleto } from './Esqueleto';
import Icono from './Icono';

function mensajeDeError(err) {
  if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
    return 'Permiso de cámara bloqueado. Habilítalo desde el candado del navegador y reintenta.';
  }
  if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
    return 'No encontré una cámara disponible en este dispositivo.';
  }
  if (err?.name === 'NotReadableError' || err?.name === 'AbortError') {
    return 'La cámara está siendo usada por otra aplicación.';
  }
  return 'No se pudo activar la cámara. Revisa los permisos y reintenta.';
}

export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [errorCamara, setErrorCamara] = useState(null);
  const [activa, setActiva] = useState(false);
  const [reintento, setReintento] = useState(0);
  const { isLoaded } = useMediaPipe(videoRef, canvasRef);

  useEffect(() => {
    let stream = null;
    let activo = true;
    setErrorCamara(null);
    setActiva(false);

    const video = videoRef.current;
    if (!video) return undefined;

    const alCargar = () => {
      if (activo) setActiva(true);
    };
    video.addEventListener('loadeddata', alCargar);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorCamara('Tu navegador no permite acceder a la cámara. Usa Chrome o Safari actualizado.');
      return () => video.removeEventListener('loadeddata', alCargar);
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        if (!activo) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        video.srcObject = s;
        const reproduccion = video.play();
        if (reproduccion) {
          reproduccion.catch(() => {
            if (!activo) return;
            setErrorCamara('La cámara está lista. Toca "Reintentar" para activar la imagen.');
          });
        }
      })
      .catch((err) => {
        console.error('No se pudo acceder a la cámara:', err);
        if (activo) setErrorCamara(mensajeDeError(err));
      });

    return () => {
      activo = false;
      video.removeEventListener('loadeddata', alCargar);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [reintento]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ajustar = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    ajustar();
    video.addEventListener('loadedmetadata', ajustar);
    window.addEventListener('resize', ajustar);
    return () => {
      video.removeEventListener('loadedmetadata', ajustar);
      window.removeEventListener('resize', ajustar);
    };
  }, [isLoaded]);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      {!activa && !errorCamara && (
        <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-chip border border-linea bg-tinta-950/85 px-4 py-2 text-sm text-tinta-200 backdrop-blur">
          <Icono nombre="camara" tamano={16} className="text-marca-400" />
          Activando cámara
          <Esqueleto className="h-2 w-12" redondeado="rounded-chip" />
        </div>
      )}
      {errorCamara && (
        <div className="absolute top-4 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 flex-col items-center gap-2 rounded-panel border border-error-500/40 bg-tinta-950/95 px-4 py-3 text-center text-tinta-100">
          <p className="flex items-start gap-2 text-sm">
            <Icono nombre="alerta" tamano={16} className="mt-0.5 shrink-0 text-error-300" />
            {errorCamara}
          </p>
          <button
            onClick={() => setReintento((valor) => valor + 1)}
            className="flex min-h-11 items-center gap-2 rounded-boton bg-marca-500 px-4 text-sm font-bold text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
          >
            <Icono nombre="reproducir" tamano={16} />
            Reintentar
          </button>
        </div>
      )}
    </>
  );
}
