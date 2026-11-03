import React, { useCallback, useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, getFirestore } from 'firebase/firestore';
import app from '../firebase';

const db = getFirestore(app);
const TAMANO_PAGINA = 10;

function formatearFecha(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function FeedbackList() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [hayMas, setHayMas] = useState(true);

  const cargarPagina = useCallback(async (cursor = null) => {
    const esPrimera = cursor === null;
    if (esPrimera) setCargando(true);
    else setCargandoMas(true);
    try {
      const base = query(collection(db, 'comentarios'), orderBy('fecha', 'desc'), limit(TAMANO_PAGINA));
      const q = cursor ? query(collection(db, 'comentarios'), orderBy('fecha', 'desc'), startAfter(cursor), limit(TAMANO_PAGINA)) : base;
      const snap = await getDocs(q);
      const nuevos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems((prev) => (esPrimera ? nuevos : [...prev, ...nuevos]));
      setUltimoDoc(snap.docs[snap.docs.length - 1] || cursor);
      setHayMas(snap.docs.length === TAMANO_PAGINA);
    } catch (e) {
      console.error('Error cargando comentarios', e);
    } finally {
      if (esPrimera) setCargando(false);
      else setCargandoMas(false);
    }
  }, []);

  useEffect(() => {
    cargarPagina();
  }, [cargarPagina]);

  if (cargando) return null;
  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-panel border border-linea bg-panel p-3 text-left" aria-labelledby="comentarios-titulo">
      <p id="comentarios-titulo" className="text-xs font-bold text-marca-400">Comentarios de usuarios</p>
      <ul className="mt-2 space-y-2 max-h-64 overflow-y-auto">
        {items.map((c) => (
          <li key={c.id} className="rounded-boton bg-tinta-900/60 p-2 text-xs text-tinta-200">
            <p className="whitespace-pre-wrap break-words">{c.texto}</p>
            <p className="mt-1 text-[11px] text-tinta-500">
              {c.autor || 'Anónimo'} · {formatearFecha(c.fecha)}
            </p>
          </li>
        ))}
      </ul>
      {hayMas && (
        <button
          type="button"
          onClick={() => cargarPagina(ultimoDoc)}
          disabled={cargandoMas}
          className="mt-2 min-h-[44px] w-full rounded-boton border border-linea bg-tinta-900 text-xs font-bold text-tinta-200 disabled:opacity-50"
        >
          {cargandoMas ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </section>
  );
}
