import { describe, it, expect } from 'vitest';
import { sincronizarPendientes, generarId } from './guardadoOffline';

describe('generarId', () => {
  it('genera ids unicos', () => {
    const ids = new Set([generarId(), generarId(), generarId(), generarId(), generarId()]);
    expect(ids.size).toBe(5);
  });
});

function crearColaMemoria(listaInicial = []) {
  const almacen = {
    lista: [...listaInicial],
    eliminados: [],
    envios: [],
  };
  return {
    almacen,
    listar: async () => almacen.lista,
    eliminar: async (id) => {
      almacen.eliminados.push(id);
      almacen.lista = almacen.lista.filter((registro) => registro.id !== id);
    },
    enviar: async (registro) => {
      almacen.envios.push(registro);
    },
  };
}

describe('sincronizarPendientes', () => {
  it('manda todos los registros y los borra al salir bien', async () => {
    const cola = crearColaMemoria([
      { id: 'a', cuerpo: { clase: 'core' } },
      { id: 'b', cuerpo: { clase: 'full' } },
    ]);

    const resultado = await sincronizarPendientes({
      listar: cola.listar,
      eliminar: cola.eliminar,
      enviar: cola.enviar,
    });

    expect(resultado).toEqual({ enviados: 2, pendientes: 0, fallo: false });
    expect(cola.almacen.envios.map((r) => r.id)).toEqual(['a', 'b']);
    expect(cola.almacen.eliminados).toEqual(['a', 'b']);
    expect(cola.almacen.lista).toHaveLength(0);
  });

  it('se detiene en el primer fallo y deja el resto pendiente', async () => {
    const cola = crearColaMemoria([
      { id: 'a', cuerpo: { clase: 'core' } },
      { id: 'b', cuerpo: { clase: 'full' } },
      { id: 'c', cuerpo: { clase: 'tabata' } },
    ]);
    cola.enviar = async (registro) => {
      if (registro.id === 'b') throw new Error('sin red');
      cola.almacen.envios.push(registro);
    };

    const resultado = await sincronizarPendientes({
      listar: cola.listar,
      eliminar: cola.eliminar,
      enviar: cola.enviar,
    });

    expect(resultado).toEqual({ enviados: 1, pendientes: 2, fallo: true });
    expect(cola.almacen.eliminados).toEqual(['a']);
    expect(cola.almacen.lista.map((r) => r.id)).toEqual(['b', 'c']);

    // Reintento con la red de vuelta: la cola se vacia completa.
    cola.enviar = async (registro) => {
      cola.almacen.envios.push(registro);
    };
    const pendientes = cola.almacen.lista.slice();
    const reintento = await sincronizarPendientes({
      listar: async () => pendientes,
      eliminar: cola.eliminar,
      enviar: cola.enviar,
    });
    expect(reintento).toEqual({ enviados: 2, pendientes: 0, fallo: false });
    expect(cola.almacen.lista).toHaveLength(0);
  });

  it('trata como pendiente un registro enviado si no se pudo borrar localmente', async () => {
    const cola = crearColaMemoria([{ id: 'unico', cuerpo: { clase: 'core' } }]);
    cola.eliminar = async () => {
      throw new Error('idb cayo');
    };

    const resultado = await sincronizarPendientes({
      listar: cola.listar,
      eliminar: cola.eliminar,
      enviar: cola.enviar,
    });

    expect(resultado).toEqual({ enviados: 0, pendientes: 1, fallo: true });
    expect(cola.almacen.envios).toHaveLength(1); // el POST sí salió
    expect(cola.almacen.lista).toHaveLength(1); // sigue en cola, no se pierde
  });

  it('devuelve cero con la cola vacia', async () => {
    const cola = crearColaMemoria([]);
    const resultado = await sincronizarPendientes({
      listar: cola.listar,
      eliminar: cola.eliminar,
      enviar: cola.enviar,
    });
    expect(resultado).toEqual({ enviados: 0, pendientes: 0, fallo: false });
    expect(cola.almacen.envios).toHaveLength(0);
  });
});
