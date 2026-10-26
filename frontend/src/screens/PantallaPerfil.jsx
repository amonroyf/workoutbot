import React, { useState } from 'react';
import Icono from '../components/Icono';
import EliminarCuenta from '../components/EliminarCuenta';

export default function PantallaPerfil({ user, onSalir }) {
  const [mostrarEliminar, setMostrarEliminar] = useState(false);

  const nombre = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email || '';
  const foto = user?.photoURL;

  return (
    <div className="relative flex h-full w-full flex-col items-center gap-3 overflow-y-auto p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] max-w-md mx-auto">
      <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-full border-2 border-linea bg-tinta-800">
        {foto ? (
          <img src={foto} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-marca-500/20 text-marca-300">
            <span className="text-3xl font-black">
              {nombre[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-tinta-100">{nombre}</h1>
        <p className="mt-1 text-sm text-tinta-400">{email}</p>
      </div>

      <div className="mt-2 w-full max-w-sm">
        <button
          type="button"
          onClick={onSalir}
          className="flex w-full items-center justify-center gap-2 rounded-boton border border-linea bg-tinta-900/60 px-4 py-3 text-base font-bold text-tinta-200 transition hover:bg-tinta-800"
        >
          <Icono nombre="salida" tamano={18} />
          Cerrar sesión
        </button>
        <button
          type="button"
          onClick={() => setMostrarEliminar(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-boton border border-error-400/40 bg-error-500/15 px-4 py-3 text-base font-bold text-error-300 transition hover:bg-error-500/25"
        >
          <Icono nombre="basura" tamano={18} />
          Eliminar cuenta
        </button>
      </div>

      {mostrarEliminar && (
        <EliminarCuenta onCerrar={() => setMostrarEliminar(false)} />
      )}
    </div>
  );
}