import { type RefObject, useEffect } from 'react';

const SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focables(raiz: HTMLElement) {
  return [...raiz.querySelectorAll<HTMLElement>(SELECTOR)].filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/** Atrapa el Tab dentro del diálogo y cierra con Escape. */
export function useFocoDialogo(
  abierto: boolean,
  contenedor: RefObject<HTMLElement | null>,
  alCerrar: () => void,
) {
  useEffect(() => {
    if (!abierto) return;
    const raiz = contenedor.current;
    if (!raiz) return;

    const anterior = document.activeElement as HTMLElement | null;
    const items = focables(raiz);
    items[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        alCerrar();
        return;
      }
      if (e.key !== 'Tab' || !raiz) return;
      const lista = focables(raiz);
      if (lista.length === 0) return;
      const i = lista.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        lista[lista.length - 1].focus();
      } else if (!e.shiftKey && (i === lista.length - 1 || i === -1)) {
        e.preventDefault();
        lista[0].focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      anterior?.focus();
    };
  }, [abierto, contenedor, alCerrar]);
}
