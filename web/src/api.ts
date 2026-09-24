export type Rol = 'adoptante' | 'donante' | 'entidad' | 'validador';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  localidadId?: string;
  localidad: string;
  fotoUrl?: string | null;
  consentimientoEn?: string;
  tienePerfilAdoptante?: boolean;
  demo?: boolean;
  entidad: {
    id: string;
    nombre: string;
    estadoVerificacion: string;
    puedePublicar: boolean;
  } | null;
};

export type Localidad = { id: string; nombre: string; codigo: string };

export type TarjetaEntidad = {
  id: string;
  nombre: string;
  localidad: string;
  badge: string;
  pendientes: number;
  necesidades: Array<{
    id: string;
    categoria: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    prioridad: string;
  }>;
};

export type EvidenciaResumen = {
  id: string;
  tipoDocumento: string;
  mime: string;
  pesoBytes: number;
};

export type SolicitudVerificacion = {
  id: string;
  tipoNivel: string;
  estado: string;
  motivo: string | null;
  creadoEn: string;
  evidencias: EvidenciaResumen[];
  entidad?: {
    id: string;
    nombre: string;
    localidad?: string;
    estadoVerificacion?: string;
  };
};

export type TarjetaAnimal = {
  id: string;
  nombre: string;
  especie: string;
  localidad: string;
  historia: string;
  necesidadEspecial: boolean;
  raza: string | null;
  edadAprox: string;
  badge: string;
  entidadId: string;
  entidadNombre: string;
  fotoUrl: string | null;
  puntaje?: number;
  fraseExplicable?: string;
  estado?: string;
  postulaciones?: number;
  demo?: boolean;
};

export type DetalleAnimal = {
  id: string;
  nombre: string;
  especie: string;
  sexo: string;
  talla: string;
  edadAprox: string;
  energia: string;
  historia: string;
  raza: string | null;
  necesidadEspecial: boolean;
  conviveNinos: boolean;
  conviveOtrosAnimales: boolean;
  esterilizado: boolean | null;
  estado: string;
  localidad: string;
  entidad: { id: string; nombre: string; badge: string; localidad: string };
  fotos: { id: string; url: string; esPortada: boolean }[];
  tienePerfil: boolean;
  demo?: boolean;
  puntaje?: number;
  fraseExplicable?: string;
};

export type PerfilAdoptante = {
  tipoVivienda: string;
  horasCompania: number;
  ninosEnHogar: boolean;
  otrosAnimales: string;
  energiaSostenible: string;
};

export type ColaItem = {
  id: string;
  tipoNivel: string;
  estado: string;
  creadoEn: string;
  evidencias: EvidenciaResumen[];
  entidad: { nombre: string; localidad: { nombre: string } };
};

const API = '/api';

export class ErrorApi extends Error {
  status: number;
  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

function esAbortado(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

function mensajeDeCuerpo(cuerpo: unknown, fallback: string) {
  if (cuerpo && typeof cuerpo === 'object' && 'message' in cuerpo && cuerpo.message) {
    return Array.isArray(cuerpo.message) ? cuerpo.message.join(' ') : String(cuerpo.message);
  }
  return fallback;
}

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const esFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (!esFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${API}${ruta}`, {
      credentials: 'include',
      ...init,
      headers,
    });
  } catch (err) {
    if (esAbortado(err)) throw err;
    throw new Error('No pude conectar con la API. ¿Está encendida en el puerto 3000?');
  }

  const texto = await res.text();
  let cuerpo: unknown = null;
  if (texto) {
    try {
      cuerpo = JSON.parse(texto) as unknown;
    } catch {
      cuerpo = null;
    }
  }

  if (!res.ok) {
    const fallback =
      res.status === 502 || res.status === 503 || res.status === 504
        ? 'La API no responde. ¿Está encendida en el puerto 3000?'
        : 'No se pudo completar la operación.';
    throw new ErrorApi(mensajeDeCuerpo(cuerpo, fallback), res.status);
  }

  return cuerpo as T;
}

export const api = {
  localidades: (init?: RequestInit) => pedir<Localidad[]>('/localidades', init),
  yo: async (init?: RequestInit) => {
    try {
      return await pedir<Usuario | null>('/auth/yo', init);
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 401) return null;
      throw err;
    }
  },
  registro: (datos: {
    nombre: string;
    correo: string;
    contrasena: string;
    localidadId: string;
    rol: Exclude<Rol, 'validador'>;
    consentimientoDatos: boolean;
  }) =>
    pedir<{ usuario: Usuario }>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
  entrar: (correo: string, contrasena: string) =>
    pedir<{ usuario: Usuario }>('/auth/entrar', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    }),
  salir: () => pedir<{ ok: boolean }>('/auth/salir', { method: 'POST' }),
  actualizarCuenta: (datos: {
    nombre: string;
    localidadId: string;
    entidadNombre?: string;
  }) =>
    pedir<Usuario>('/auth/yo', {
      method: 'PATCH',
      body: JSON.stringify(datos),
    }),
  subirFotoPerfil: (archivo: File) => {
    const datos = new FormData();
    datos.append('foto', archivo);
    return pedir<Usuario>('/auth/yo/foto', { method: 'POST', body: datos });
  },
  miVerificacion: () =>
    pedir<{
      entidad: {
        id: string;
        nombre: string;
        localidadId: string;
        nivelSolicitado: string;
        estadoVerificacion: string;
        puedePublicar: boolean;
      };
      solicitud: SolicitudVerificacion | null;
    }>('/verificaciones/mia'),
  enviarVerificacion: (datos: FormData) =>
    pedir<SolicitudVerificacion>('/verificaciones', { method: 'POST', body: datos }),
  colaVerificacion: () => pedir<ColaItem[]>('/verificaciones'),
  detalleVerificacion: (id: string) => pedir<SolicitudVerificacion>(`/verificaciones/${id}`),
  resolverVerificacion: (
    id: string,
    cuerpo: { accion: 'aprobar' | 'rechazar' | 'complemento'; motivo?: string; visitaNecesaria?: boolean },
  ) =>
    pedir<SolicitudVerificacion>(`/verificaciones/${id}/resolver`, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  urlEvidencia: (verificacionId: string, evidenciaId: string) =>
    `/api/verificaciones/${verificacionId}/evidencias/${evidenciaId}`,
  catalogo: (q?: { especie?: string; localidadId?: string }, init?: RequestInit) => {
    const p = new URLSearchParams();
    if (q?.especie) p.set('especie', q.especie);
    if (q?.localidadId) p.set('localidadId', q.localidadId);
    const qs = p.toString();
    return pedir<TarjetaAnimal[]>(`/animales${qs ? `?${qs}` : ''}`, init);
  },
  misAnimales: () => pedir<TarjetaAnimal[]>('/animales/mios'),
  animal: (id: string, init?: RequestInit) => pedir<DetalleAnimal>(`/animales/${id}`, init),
  publicarAnimal: (datos: FormData) => pedir<DetalleAnimal>('/animales', { method: 'POST', body: datos }),
  perfil: () => pedir<PerfilAdoptante | null>('/perfil'),
  guardarPerfil: (datos: PerfilAdoptante) =>
    pedir<PerfilAdoptante>('/perfil', { method: 'PUT', body: JSON.stringify(datos) }),
  postular: (animalId: string, datos: { mayorDeEdad: boolean; viveEnBogota: boolean }) =>
    pedir<unknown>(`/animales/${animalId}/postulaciones`, {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
  misPostulaciones: () => pedir<unknown[]>('/postulaciones/mias'),
  postulacionesDe: (animalId: string) =>
    pedir<{
      animal: { id: string; nombre: string; estado: string; necesidadEspecial: boolean };
      postulaciones: Array<{
        id: string;
        puntaje: number;
        fraseExplicable: string;
        estado: string;
        requiereEvidenciaHogar: boolean;
        seguimientoResultado: string | null;
        adoptante: { nombre: string; localidad: string; perfil: PerfilAdoptante | null };
      }>;
    }>(`/animales/${animalId}/postulaciones`),
  resolverPostulacion: (
    id: string,
    cuerpo: {
      accion: 'abrir' | 'preseleccionar' | 'rechazar' | 'caer' | 'entregar' | 'seguimiento';
      seguimientoResultado?: string;
      requiereEvidenciaHogar?: boolean;
    },
  ) =>
    pedir<unknown>(`/postulaciones/${id}/resolver`, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    }),
  entidades: (init?: RequestInit) => pedir<TarjetaEntidad[]>('/entidades', init),
  entidadPublica: (id: string, init?: RequestInit) =>
    pedir<{
      id: string;
      nombre: string;
      localidad: string;
      badge: string;
      demo?: boolean;
      bitacora: Array<{ categoria: string; descripcion: string; cantidad: number; unidad: string; cubiertoEn: string }>;
      deseos: Array<{
        id: string;
        categoria: string;
        descripcion: string;
        cantidad: number;
        unidad: string;
        prioridad: string;
        estado: string;
      }>;
      animales: Array<{
        id: string;
        nombre: string;
        especie: string;
        localidad: string;
        historia: string;
        necesidadEspecial: boolean;
        fotoUrl: string | null;
        demo?: boolean;
      }>;
    }>(`/entidades/${id}`, init),
  publicarDeseo: (datos: {
    categoria: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    prioridad: string;
  }) => pedir<unknown>('/deseos', { method: 'POST', body: JSON.stringify(datos) }),
  misDeseos: () =>
    pedir<
      Array<{
        id: string;
        categoria: string;
        descripcion: string;
        cantidad: number;
        unidad: string;
        prioridad: string;
        estado: string;
        reservas: Array<{ id: string; estado: string; contactoEntrega: string }>;
      }>
    >('/deseos/mios'),
  reservarDeseo: (id: string, contactoEntrega: string) =>
    pedir<unknown>(`/deseos/${id}/reservar`, {
      method: 'POST',
      body: JSON.stringify({ contactoEntrega }),
    }),
  confirmarReserva: (id: string, datos: FormData) =>
    pedir<unknown>(`/reservas/${id}/confirmar`, { method: 'POST', body: datos }),
};
