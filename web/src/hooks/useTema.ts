import { useEffect, useState } from 'react';

type Tema = 'claro' | 'oscuro';

const CLAVE = 'mestizo-tema';

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => {
    const guardado = localStorage.getItem(CLAVE) as Tema | null;
    if (guardado) return guardado;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'oscuro'
      : 'claro';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
    document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light';
    localStorage.setItem(CLAVE, tema);
  }, [tema]);

  function alternar() {
    setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'));
  }

  return { tema, alternar };
}
