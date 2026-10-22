import React, { useEffect, useState } from 'react';
import Marca from './Marca';
import Icono from './Icono';
import { guardarConsentimiento, leerConsentimiento } from '../engine/analytics';

const CONTACTO = 'https://github.com/amonroyf/workoutbot/issues';
const ACTUALIZADO = '22 de octubre de 2026';

const RUTAS = {
  '/privacidad': 'privacidad',
  '/terminos': 'terminos',
};

export function rutaLegal(pathname) {
  return RUTAS[pathname] || null;
}

function Enlace({ href, children }) {
  return (
    <a
      href={href}
      className="font-bold text-marca-300 underline underline-offset-2 hover:text-marca-400"
    >
      {children}
    </a>
  );
}

function Bloque({ titulo, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-black text-tinta-100">{titulo}</h2>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-tinta-300">
        {children}
      </div>
    </section>
  );
}

function PreferenciasAnalitica() {
  const [estado, setEstado] = useState(() => leerConsentimiento());
  const [mensaje, setMensaje] = useState('');

  const cambiar = (permitido) => {
    guardarConsentimiento(permitido);
    setEstado(permitido ? 'si' : 'no');
    setMensaje(
      permitido
        ? 'Analítica activada. Gracias por ayudar a mejorar WorkoutBot.'
        : 'Analítica desactivada y cookies de medición eliminadas.'
    );
  };

  return (
    <div className="mt-3 rounded-panel border border-linea bg-panel p-3">
      <p className="text-xs font-bold text-tinta-200">Tus preferencias de analítica</p>
      <p className="mt-1 text-xs text-tinta-400">
        Estado actual:{' '}
        <span className="font-bold text-tinta-200">
          {estado === 'si' ? 'activada' : estado === 'no' ? 'desactivada' : 'sin decidir'}
        </span>
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => cambiar(false)}
          className="min-h-10 flex-1 rounded-boton border border-linea text-xs font-bold text-tinta-300 hover:bg-tinta-800"
        >
          Desactivar
        </button>
        <button
          type="button"
          onClick={() => cambiar(true)}
          className="min-h-10 flex-1 rounded-boton bg-marca-500 text-xs font-black text-black hover:bg-marca-400"
        >
          Activar
        </button>
      </div>
      {mensaje && <p className="mt-2 text-[11px] text-marca-300">{mensaje}</p>}
    </div>
  );
}

export default function PaginaLegal({ ruta }) {
  const esPrivacidad = ruta === 'privacidad';

  useEffect(() => {
    document.title = esPrivacidad
      ? 'Privacidad — WorkoutBot'
      : 'Términos — WorkoutBot';
    window.scrollTo(0, 0);
  }, [esPrivacidad]);

  return (
    <div className="min-h-dvh bg-fondo px-5 pb-12 pt-[calc(1.25rem+env(safe-area-inset-top))] text-tinta-100">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
        <a href="/" aria-label="Volver al inicio">
          <Marca />
        </a>
        <a
          href="/"
          className="flex min-h-10 items-center gap-1 rounded-boton border border-linea px-3 text-xs font-bold text-tinta-300 hover:bg-tinta-900"
        >
          <Icono nombre="chevronDerecha" tamano={14} className="rotate-180" />
          Volver
        </a>
      </header>

      <main className="mx-auto w-full max-w-2xl">
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-marca-400">
          Documentos legales
        </p>
        <h1 className="mt-1 text-3xl font-black">
          {esPrivacidad ? 'Política de privacidad' : 'Términos de uso'}
        </h1>
        <p className="mt-2 text-xs text-tinta-500">
          Última actualización: {ACTUALIZADO}
        </p>

        <nav className="mt-4 flex gap-2">
          <a
            href="/privacidad"
            className={`min-h-10 rounded-boton border px-3 py-2 text-xs font-bold ${
              esPrivacidad
                ? 'border-marca-400 bg-marca-500/15 text-marca-300'
                : 'border-linea text-tinta-400 hover:bg-tinta-900'
            }`}
          >
            Privacidad
          </a>
          <a
            href="/terminos"
            className={`min-h-10 rounded-boton border px-3 py-2 text-xs font-bold ${
              !esPrivacidad
                ? 'border-marca-400 bg-marca-500/15 text-marca-300'
                : 'border-linea text-tinta-400 hover:bg-tinta-900'
            }`}
          >
            Términos
          </a>
        </nav>

        {esPrivacidad ? (
          <>
            <Bloque titulo="Quién trata tus datos">
              <p>
                WorkoutBot es un proyecto personal operado desde Colombia. Para
                cualquier duda, solicitud o reclamo puedes abrir un caso en{' '}
                <Enlace href={CONTACTO}>el repositorio del proyecto</Enlace>.
              </p>
            </Bloque>

            <Bloque titulo="Qué datos usamos">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-tinta-200">Cuenta:</strong> nombre,
                  correo y foto pública que entrega Google al iniciar sesión.
                </li>
                <li>
                  <strong className="text-tinta-200">Entrenamiento:</strong>{' '}
                  clases realizadas, repeticiones, duración, racha y progreso
                  semanal.
                </li>
                <li>
                  <strong className="text-tinta-200">Plan:</strong> días y
                  objetivo que eliges. Se guarda en tu dispositivo y, cuando
                  esté disponible la sincronización, en tu cuenta.
                </li>
                <li>
                  <strong className="text-tinta-200">Cámara:</strong> el video se
                  procesa en tu dispositivo para detectar la pose. No se graba,
                  no se sube y no se comparte.
                </li>
                <li>
                  <strong className="text-tinta-200">Analítica:</strong> datos
                  técnicos y de uso agregados, solo si das tu consentimiento.
                </li>
              </ul>
            </Bloque>

            <Bloque titulo="Cámara y pose">
              <p>
                La cámara se activa únicamente cuando entrenas. Las imágenes se
                analizan localmente con MediaPipe y se descartan en el mismo
                dispositivo. WorkoutBot no almacena video ni audio.
              </p>
            </Bloque>

            <Bloque titulo="Analítica y cookies">
              <p>
                Usamos Firebase Analytics para entender qué clases se usan y
                dónde hay errores. Solo se activa si pulsas “Permitir”. No
                vendemos datos ni los usamos para publicidad.
              </p>
              <PreferenciasAnalitica />
            </Bloque>

            <Bloque titulo="Para qué usamos los datos">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Prestar el servicio y guardar tu progreso.</li>
                <li>Mejorar clases, pantallas y estabilidad.</li>
                <li>Responder solicitudes de soporte o eliminación.</li>
                <li>Cumplir obligaciones legales cuando corresponda.</li>
              </ul>
            </Bloque>

            <Bloque titulo="Con quién se comparten">
              <p>
                Usamos Google Firebase para autenticación, base de datos y
                hosting, y Google Cloud para el backend. Estos proveedores
                tratan datos por cuenta de WorkoutBot. No compartimos datos con
                terceros para publicidad.
              </p>
            </Bloque>

            <Bloque titulo="Cuánto tiempo se conservan">
              <p>
                Mientras exista tu cuenta. Si pides eliminarla, borramos tu
                perfil y tu historial en un plazo máximo de 30 días, salvo
                obligaciones legales de conservación.
              </p>
            </Bloque>

            <Bloque titulo="Eliminar tu cuenta">
              <p>
                En la pantalla de inicio, toca “Eliminar cuenta” en el pie de
                página. Confirma escribiendo ELIMINAR y vuelve a entrar con
                Google. Borramos tu perfil, tu historial y tus preferencias
                guardadas en este dispositivo. Si no puedes iniciar sesión, abre
                un caso en <Enlace href={CONTACTO}>el repositorio del proyecto</Enlace>.
              </p>
            </Bloque>

            <Bloque titulo="Tus derechos">
              <p>
                Puedes conocer, actualizar, corregir y solicitar la eliminación
                de tus datos. Para ejercer estos derechos, abre un caso en{' '}
                <Enlace href={CONTACTO}>el repositorio del proyecto</Enlace> con
                el correo con el que iniciaste sesión.
              </p>
            </Bloque>

            <Bloque titulo="Seguridad y cambios">
              <p>
                Aplicamos medidas razonables de seguridad, pero ningún sistema es
                infalible. Si cambiamos esta política, publicaremos la nueva
                versión en esta página con su fecha de actualización.
              </p>
            </Bloque>
          </>
        ) : (
          <>
            <Bloque titulo="Qué es WorkoutBot">
              <p>
                WorkoutBot es una aplicación web de entrenamiento en casa que
                ofrece clases guiadas por voz y, cuando la cámara está
                disponible, correcciones de postura y conteo de repeticiones.
              </p>
            </Bloque>

            <Bloque titulo="No es consejo médico">
              <p>
                WorkoutBot no sustituye la valoración de un profesional de la
                salud o del ejercicio. Consulta a un médico antes de empezar si
                tienes lesiones, embarazo, condiciones cardíacas o cualquier
                duda sobre tu salud.
              </p>
            </Bloque>

            <Bloque titulo="Tu responsabilidad">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Entrena en un espacio seguro, con piso firme y sin obstáculos.</li>
                <li>Detente si sientes dolor, mareo o falta de aire.</li>
                <li>Usa ropa cómoda y mantén agua cerca.</li>
                <li>No exijas a tu cuerpo más de lo que puedes controlar.</li>
              </ul>
            </Bloque>

            <Bloque titulo="Cámara y datos">
              <p>
                La cámara es opcional. El video se procesa en tu dispositivo y
                no se guarda. El tratamiento de datos se explica en la{' '}
                <Enlace href="/privacidad">política de privacidad</Enlace>.
              </p>
            </Bloque>

            <Bloque titulo="Cuenta y uso aceptable">
              <p>
                Debes usar una cuenta propia y no compartir el acceso. No está
                permitido intentar vulnerar la seguridad, extraer datos de otros
                usuarios, revender el servicio ni usar WorkoutBot para fines
                ilícitos.
              </p>
            </Bloque>

            <Bloque titulo="Disponibilidad y cambios">
              <p>
                El servicio es gratuito y puede cambiar, pausarse o
                descontinuarse. Haremos esfuerzos razonables por mantenerlo
                disponible, pero no garantizamos disponibilidad ininterrumpida.
              </p>
            </Bloque>

            <Bloque titulo="Propiedad intelectual">
              <p>
                El nombre, la marca, el diseño y el contenido de WorkoutBot
                pertenecen a su autor. No puedes copiarlos ni distribuirlos sin
                permiso.
              </p>
            </Bloque>

            <Bloque titulo="Limitación de responsabilidad">
              <p>
                En la medida permitida por la ley, WorkoutBot no responde por
                lesiones, daños o pérdidas derivadas del uso del servicio o de la
                inobservancia de estas condiciones. Nada aquí limita derechos
                irrenunciables del consumidor.
              </p>
            </Bloque>

            <Bloque titulo="Contacto">
              <p>
                Para preguntas sobre estos términos, abre un caso en{' '}
                <Enlace href={CONTACTO}>el repositorio del proyecto</Enlace>.
              </p>
            </Bloque>
          </>
        )}

        <footer className="mt-8 border-t border-linea pt-4 text-xs text-tinta-500">
          <div className="flex flex-wrap gap-3">
            <a className="hover:text-tinta-200" href="/">
              Inicio
            </a>
            <a className="hover:text-tinta-200" href="/privacidad">
              Privacidad
            </a>
            <a className="hover:text-tinta-200" href="/terminos">
              Términos
            </a>
          </div>
          <p className="mt-3">
            WorkoutBot se procesa en tu dispositivo. Tu video no se sube.
          </p>
        </footer>
      </main>
    </div>
  );
}
