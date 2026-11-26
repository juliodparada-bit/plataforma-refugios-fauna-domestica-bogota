import { NombreMarca } from './Marca';
import { ESLOGAN } from '../marca';

const CIFRAS = [
  { valor: '19', etiqueta: 'Localidades urbanas de Bogotá en el catálogo' },
  { valor: '2', etiqueta: 'Especies permitidas: canino y felino' },
  { valor: '5', etiqueta: 'Preguntas de convivencia, no de raza' },
  { valor: '2', etiqueta: 'Niveles de sello antes de publicar' },
] as const;

const COMPROMISOS = [
  'Donación en especie: alimento, medicina o aseo. Sin Nequi y sin recaudo.',
  'Un hogar de paso publica cuando el validador aprueba el sello (Nivel 1 o 2).',
  'La bitácora pública muestra el ítem cubierto, no el nombre del donante.',
  'El puntaje de adopción trae una frase: reglas, no inteligencia artificial.',
] as const;

export function PanelSesion({ modo }: { modo: 'entrar' | 'registro' }) {
  const titulo =
    modo === 'entrar' ? 'El circuito de Bogotá' : 'Para qué sirve tu cuenta';
  const lema =
    modo === 'entrar'
      ? 'Historias de caninos y felinos, hogares verificados y donaciones que se pueden seguir.'
      : 'Adoptante, donante o refugio: cada rol tiene un camino distinto y las mismas reglas.';

  return (
    <aside className="sesion-panel" aria-label="Cifras y compromisos de Mestizo">
      <p className="ojo">Bogotá</p>
      <h2>{titulo}</h2>
      <p className="sesion-panel-lema">{lema}</p>
      <p className="sesion-panel-eslogan">{ESLOGAN}</p>
      <ul className="cifras sesion-cifras">
        {CIFRAS.map((c) => (
          <li key={c.etiqueta} className="cifra">
            <strong>{c.valor}</strong>
            <span>{c.etiqueta}</span>
          </li>
        ))}
      </ul>
      <h3>Compromisos del prototipo</h3>
      <ul className="sesion-compromisos">
        {COMPROMISOS.map((texto) => (
          <li key={texto}>{texto}</li>
        ))}
      </ul>
      <p className="ayuda sesion-panel-pie">
        Las cifras son reglas de <NombreMarca className="es-en-linea" />, no un
        tablero de producción. Cuando haya piloto en campo se reemplazan por
        conteos reales.
      </p>
    </aside>
  );
}
