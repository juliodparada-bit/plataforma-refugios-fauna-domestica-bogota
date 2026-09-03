export type Rol = 'adoptante' | 'donante' | 'entidad' | 'validador';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  localidad: string;
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

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const esFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (!esFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API}${ruta}`, {
    credentials: 'include',
    ...init,
    headers,
  });
  const texto = await res.text();
  const cuerpo = texto ? (JSON.parse(texto) as unknown) : null;
  if (!res.ok) {
    const mensaje =
      cuerpo &&
      typeof cuerpo === 'object' &&
      'message' in cuerpo &&
      cuerpo.message
        ? Array.isArray(cuerpo.message)
          ? cuerpo.message.join(' ')
          : String(cuerpo.message)
        : 'No se pudo completar la operación.';
    throw new Error(mensaje);
  }
  return cuerpo as T;
}

export const api = {
  localidades: () => pedir<Localidad[]>('/localidades'),
  yo: () => pedir<Usuario>('/auth/yo'),
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
  catalogo: (q?: { especie?: string; localidadId?: string }) => {
    const p = new URLSearchParams();
    if (q?.especie) p.set('especie', q.especie);
    if (q?.localidadId) p.set('localidadId', q.localidadId);
    const qs = p.toString();
    return pedir<TarjetaAnimal[]>(`/animales${qs ? `?${qs}` : ''}`);
  },
  misAnimales: () => pedir<TarjetaAnimal[]>('/animales/mios'),
  animal: (id: string) => pedir<DetalleAnimal>(`/animales/${id}`),
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
  entidadPublica: (id: string) =>
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
    }>(`/entidades/${id}`),
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
