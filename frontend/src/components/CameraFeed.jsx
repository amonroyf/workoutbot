import React, { useRef, useEffect, useState } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';

export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [errorCamara, setErrorCamara] = useState(null);
  const { isLoaded } = useMediaPipe(videoRef, canvasRef);

  useEffect(() => {
    let stream = null;
    let activo = true;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        if (!activo) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.error('No se pudo acceder a la cámara:', err);
        setErrorCamara('No se pudo acceder a la cámara. Revisa los permisos.');
      });

    return () => {
      activo = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

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
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      {errorCamara && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 text-white px-4 py-2 rounded">
          {errorCamara}
        </div>
      )}
    </>
  );
}
