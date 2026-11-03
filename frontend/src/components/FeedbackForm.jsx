import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import app from '../firebase';

const db = getFirestore(app);

export default function FeedbackForm() {
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(() => localStorage.getItem('feedback_enviado') === '1');

  if (enviado) return null;

  const enviar = async () => {
    if (!comentario.trim()) return;
    setEnviando(true);
    try {
      const credencial = await signInAnonymously(auth);
      await addDoc(collection(db, 'comentarios'), {
        texto: comentario,
        fecha: new Date().toISOString(),
        uid: credencial.user.uid,
      });
      localStorage.setItem('feedback_enviado', '1');
      setEnviado(true);
    } catch (error) {
      console.error('Error enviando feedback:', error);
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="mt-4 rounded-panel border border-linea bg-panel p-3 text-left">
      <p className="text-xs font-bold text-marca-400">¿Qué te parece la app?</p>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        disabled={enviando}
        placeholder="Escribe tus comentarios aquí..."
        className="mt-2 w-full rounded-boton border border-linea bg-tinta-900 p-2 text-xs text-tinta-100 outline-none focus:border-marca-400"
        rows="3"
      />
      <button
        onClick={enviar}
        disabled={enviando || !comentario.trim()}
        className="mt-2 min-h-9 w-full rounded-boton bg-marca-500 text-xs font-black text-black disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : 'Enviar comentario'}
      </button>
    </section>
  );
}
