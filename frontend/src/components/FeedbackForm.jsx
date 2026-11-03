import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import app from '../firebase';

const db = getFirestore(app);
const MAX_CARACTERES = 500;

export default function FeedbackForm() {
  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const enviar = async () => {
    const texto = comentario.trim();
    if (!texto) return;
    setEnviando(true);
    setMensaje('');
    try {
      const credencial = await signInAnonymously(auth);
      await addDoc(collection(db, 'comentarios'), {
        texto,
        autor: (nombre.trim() || 'Anónimo').slice(0, 60),
        fecha: new Date().toISOString(),
        uid: credencial.user.uid,
      });
      setComentario('');
      setMensaje('¡Gracias por tu comentario!');
    } catch (error) {
      console.error('Error enviando feedback:', error);
      setMensaje('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="mt-4 rounded-panel border border-linea bg-panel p-3 text-left" aria-labelledby="feedback-titulo">
      <p id="feedback-titulo" className="text-xs font-bold text-marca-400">¿Qué te parece la app?</p>
      <label className="mt-2 block text-[11px] text-tinta-400" htmlFor="feedback-nombre">
        Nombre (opcional)
      </label>
      <input
        id="feedback-nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        disabled={enviando}
        maxLength={60}
        placeholder="Anónimo"
        className="mt-1 w-full rounded-boton border border-linea bg-tinta-900 p-2 text-xs text-tinta-100 outline-none focus:border-marca-400"
      />
      <label className="mt-2 block text-[11px] text-tinta-400" htmlFor="feedback-texto">
        Comentario
      </label>
      <textarea
        id="feedback-texto"
        value={comentario}
        onChange={(e) => setComentario(e.target.value.slice(0, MAX_CARACTERES))}
        disabled={enviando}
        placeholder="Escribe tus comentarios aquí..."
        aria-describedby="feedback-contador"
        className="mt-1 w-full rounded-boton border border-linea bg-tinta-900 p-2 text-xs text-tinta-100 outline-none focus:border-marca-400"
        rows="3"
      />
      <p id="feedback-contador" className="mt-1 text-right text-[11px] text-tinta-500">
        {comentario.length}/{MAX_CARACTERES}
      </p>
      <button
        type="button"
        onClick={enviar}
        disabled={enviando || !comentario.trim()}
        className="mt-2 min-h-[44px] w-full rounded-boton bg-marca-500 text-xs font-black text-black disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar comentario'}
      </button>
      {mensaje && (
        <p className="mt-2 text-[11px] text-tinta-200" role="status" aria-live="polite">
          {mensaje}
        </p>
      )}
    </section>
  );
}
