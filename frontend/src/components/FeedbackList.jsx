import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, getFirestore } from 'firebase/firestore';
import app from '../firebase';

const db = getFirestore(app);

export default function FeedbackList() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const q = query(collection(db, 'comentarios'), orderBy('fecha', 'desc'), limit(20));
        const snap = await getDocs(q);
        if (!activo) return;
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Error cargando comentarios', e);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  if (cargando) return null;
  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-panel border border-linea bg-panel p-3 text-left">
      <p className="text-xs font-bold text-marca-400">Comentarios de usuarios</p>
      <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
        {items.map((c) => (
          <li key={c.id} className="rounded-boton bg-tinta-900/60 p-2 text-xs text-tinta-200">
            {c.texto}
          </li>
        ))}
      </ul>
    </section>
  );
}
