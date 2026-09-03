import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type DetalleAnimal, type Usuario } from '../api';
import { etiquetaEspecie, etiquetaSello, etiquetaTalla } from '../etiquetas';
import { SelloFicha } from '../componentes/SelloFicha';
import { esFichaDemo, historiaVisible, marcaDiagonal, nombreVisible } from '../demo';

export function PerfilAnimal({
  id,
  usuario,
  alVolver,
  alCuestionario,
  alEntidad,
  alEntrar,
}: {
  id: string;
  usuario: Usuario | null;
  alVolver: () => void;
  alCuestionario: () => void;
  alEntidad: (id: string) => void;
  alEntrar: () => void;
}) {
  const [animal, setAnimal] = useState<DetalleAnimal | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mayorDeEdad, setMayorDeEdad] = useState(false);
  const [viveEnBogota, setViveEnBogota] = useState(false);

  useEffect(() => {
    void api.animal(id).then(setAnimal).catch((e) => setError(e instanceof Error ? e.message : 'No encontré el perfil.'));
  }, [id]);

  async function postular() {
    setError('');
    if (!mayorDeEdad || !viveEnBogota) {
      setError('Debes confirmar que eres mayor de edad y vives en Bogotá.');
      return;
    }
    setEnviando(true);
    try {
      await api.postular(id, { mayorDeEdad, viveEnBogota });
      setOk('Tu postulación voló. El refugio la recibirá con tu historia y tu puntaje. Hiciste algo hermoso hoy.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo postular.');
    } finally {
      setEnviando(false);
    }
  }

  if (!animal && !error) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>← Catálogo</button>
        <div className="esqueleto esqueleto-foto" style={{ height: '22rem', borderRadius: '1.25rem', marginBottom: '1rem' }} aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="esqueleto esqueleto-linea" style={{ width: '40%', height: '0.75rem' }} />
          <div className="esqueleto esqueleto-linea" style={{ width: '65%', height: '1.8rem' }} />
          <div className="esqueleto esqueleto-linea" style={{ width: '90%' }} />
          <div className="esqueleto esqueleto-linea" style={{ width: '75%' }} />
        </div>
      </main>
    );
  }

  if (!animal) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>
          ← Catálogo
        </button>
        <p className="error" role="alert">{error}</p>
      </main>
    );
  }

  return (
    <motion.main
      className="hoja"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.button
        type="button"
        className="enlace"
        onClick={alVolver}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ x: -3 }}
      >
        ← Catálogo
      </motion.button>
      {animal.fotos[0] && (
        <SelloFicha
          activo={esFichaDemo({ demo: animal.demo, nombre: animal.nombre, entidadNombre: animal.entidad.nombre, historia: animal.historia })}
          texto={marcaDiagonal(animal.nombre)}
        >
          <motion.img
            className="portada"
            src={animal.fotos[0].url}
            alt={`Foto de ${nombreVisible(animal.nombre)}`}
            loading="lazy"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </SelloFicha>
      )}
      <motion.p
        className="ojo"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {etiquetaEspecie(animal.especie)} · {animal.localidad}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {nombreVisible(animal.nombre)}
      </motion.h1>
      <p className="lema-suave">Si algo dentro de ti ya respondió al leer su nombre, escúchalo.</p>
      <motion.ul
        className="chips"
        aria-label="Características"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <li>{animal.edadAprox}</li>
        <li>{etiquetaTalla(animal.talla)}</li>
        <li>{animal.sexo}</li>
        <li>Energía {animal.energia}</li>
        {animal.necesidadEspecial && <li>Necesidad especial</li>}
      </motion.ul>
      <button type="button" className="enlace" onClick={() => alEntidad(animal.entidad.id)}>
        <span className="etiqueta etiqueta-sello">
          {etiquetaSello(animal.entidad.badge)}
        </span>{' '}
        {nombreVisible(animal.entidad.nombre)} · {animal.entidad.localidad}
      </button>
      <h2>Su historia</h2>
      <p className="historia">{historiaVisible(animal.historia)}</p>
      <h2>¿Cómo es vivir juntos?</h2>
      <p>
        {animal.conviveNinos ? 'Ama a los niños.' : 'Prefiere adultos o adolescentes.'}{' '}
        {animal.conviveOtrosAnimales ? 'Convive bien con otros animales.' : 'Prefiere ser el único peludo en casa.'}{' '}
        {animal.raza ? `Su raza es ${animal.raza}, aunque eso dice poco de su corazón.` : ''}
      </p>
      {usuario?.rol === 'adoptante' && animal.puntaje != null && (
        <motion.div
          className="puntaje"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="puntaje-fila">
            <motion.span
              className="puntaje-numero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {animal.puntaje}
            </motion.span>
            <div
              className="puntaje-barra-cont"
              role="meter"
              aria-label="Afinidad"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={animal.puntaje}
            >
              <motion.div
                className="puntaje-barra"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(animal.puntaje, 100)}%` }}
                transition={{ delay: 0.65, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          <p className="puntaje-frase">{animal.fraseExplicable}</p>
        </motion.div>
      )}
      {ok && (
        <aside className="aviso" role="status">
          <p>{ok}</p>
        </aside>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {animal.estado === 'publicado' && (
        <div className="acciones">
          {!usuario && (
            <button type="button" className="primario" onClick={alEntrar}>
              Entrar y dar el primer paso 🐾
            </button>
          )}
          {usuario?.rol === 'adoptante' && !animal.tienePerfil && (
            <button type="button" className="primario" onClick={alCuestionario}>
              Cuéntanos cómo es tu hogar (5 preguntas)
            </button>
          )}
          {usuario?.rol === 'adoptante' && animal.tienePerfil && !ok && (
            <>
              <label className="radio">
                <input
                  type="checkbox"
                  checked={mayorDeEdad}
                  onChange={(e) => setMayorDeEdad(e.target.checked)}
                />{' '}
                Soy mayor de edad y tomo esta decisión con responsabilidad
              </label>
              <label className="radio">
                <input
                  type="checkbox"
                  checked={viveEnBogota}
                  onChange={(e) => setViveEnBogota(e.target.checked)}
                />{' '}
                Vivo en Bogotá y puedo coordinar la entrega
              </label>
              <button type="button" className="primario" disabled={enviando} onClick={() => void postular()}>
                {enviando ? 'Enviando tu corazón…' : 'Postularme — quiero que llegue a casa'}
              </button>
              <p className="ayuda">
                El refugio verá tu puntaje y tus respuestas. Tu correo nunca aparece en el catálogo.
                Solo tú, ellos, y este animal que ya te está esperando.
              </p>
            </>
          )}
        </div>
      )}
    </motion.main>
  );
}
