// Cola offline-first para guardar entrenamientos.
// Si el POST a /api/v1/workout/finish falla (sin internet, server caído, cambio de red),
// el cuerpo del request se encola en IndexedDB y se reintenta silenciosamente
// al abrir la app o al recuperar la conexión (evento `online`).

const NOMBRE_DB = 'workoutbot';
const VERSION_DB = 1;
const TIENDA = 'guardados-pendientes';

function abrirConexion() {
  return new Promise((resolver, rechazar) => {
    if (!globalThis.indexedDB) {
      rechazar(new Error('indexedDB no disponible'));
      return;
    }
    const peticion = globalThis.indexedDB.open(NOMBRE_DB, VERSION_DB);
    peticion.onupgradeneeded = () => {
      const db = peticion.result;
      if (!db.objectStoreNames.contains(TIENDA)) {
        db.createObjectStore(TIENDA, { keyPath: 'id' });
      }
    };
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () =>
      rechazar(peticion.error || new Error('No se pudo abrir la base de datos local'));
    peticion.onblocked = () => rechazar(new Error('Base de datos local bloqueada'));
  });
}

// Ejecuta `operacion` sobre la tienda y resuelve con el resultado del request.
function conTienda(modo, operacion) {
  return abrirConexion().then(
    (db) =>
      new Promise((resolver, rechazar) => {
        let resuelto = false;
        const terminar = (valor, error) => {
          if (resuelto) return;
          resuelto = true;
          db.close();
          if (error) rechazar(error);
          else resolver(valor);
        };
        try {
          const transaccion = db.transaction(TIENDA, modo);
          const peticion = operacion(transaccion.objectStore(TIENDA));
          if (peticion) {
            peticion.onsuccess = () => terminar(peticion.result);
            peticion.onerror = () =>
              terminar(null, peticion.error || new Error('Error en IndexedDB'));
          } else {
            terminar(null, new Error('Operación inválida en IndexedDB'));
          }
          transaccion.oncomplete = () => db.close();
        } catch (error) {
          terminar(null, error);
        }
      })
  );
}

export function generarId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `pendiente-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Encola el cuerpo del request y devuelve el registro encolado.
export function encolarGuardado(cuerpo) {
  const registro = { id: generarId(), creadoEn: Date.now(), cuerpo };
  return conTienda('readwrite', (tienda) => tienda.put(registro)).then(() => registro);
}

// Lista los entrenamientos guardados localmente esperando sincronización,
// ordenados por fecha de creación (los más viejos viajan primero).
export function listarGuardadosPendientes() {
  return conTienda('readonly', (tienda) => tienda.getAll()).then((lista) =>
    (lista || []).sort((a, b) => (a.creadoEn || 0) - (b.creadoEn || 0))
  );
}

export function eliminarGuardadoPendiente(id) {
  return conTienda('readwrite', (tienda) => tienda.delete(id)).then(() => undefined);
}

// Flushea la cola: envía cada registro, borra los que salieron y se detiene
// en el primer fallo para no quemar batería ni conexiones. Recibe sus
// dependencias inyectadas para poder testearla sin IndexedDB.
export async function sincronizarPendientes({ listar, eliminar, enviar }) {
  const lista = (await listar()) || [];
  let enviados = 0;
  let fallo = false;

  for (const registro of lista) {
    let bien = true;
    try {
      await enviar(registro);
    } catch {
      bien = false;
    }
    if (bien) {
      try {
        await eliminar(registro.id);
      } catch {
        // Si el POST salió pero no se pudo borrar localmente, se marca pendiente
        // para no perder el registro (puede reenviarse: el servidor deduplica).
        bien = false;
      }
    }
    if (!bien) {
      fallo = true;
      return { enviados, pendientes: lista.length - enviados, fallo };
    }
    enviados += 1;
  }

  return { enviados, pendientes: 0, fallo };
}
