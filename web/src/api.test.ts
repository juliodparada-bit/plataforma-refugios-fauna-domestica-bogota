import { api, ErrorApi } from './api';

/**
 * Doble: stub de fetch. No hay red.
 * Cubre el cliente HTTP que la semana 5 saca de la exclusión de cobertura.
 */
function responder(status: number, body: unknown, contentType = 'application/json') {
  const texto = typeof body === 'string' ? body : JSON.stringify(body);
  return Promise.resolve(
    new Response(texto, { status, headers: { 'Content-Type': contentType } }),
  );
}

describe('cliente HTTP', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('un 401 en /auth/yo es visitante, no un error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => responder(401, { message: 'no' })));
    await expect(api.yo()).resolves.toBeNull();
  });

  it('junta los mensajes de validación cuando el API manda un arreglo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => responder(400, { message: ['correo', 'clave'] })),
    );
    await expect(api.entrar('a@b.co', 'x')).rejects.toMatchObject({
      message: 'correo clave',
      status: 400,
    });
  });

  it('un cuerpo que no es JSON y un 503 tienen mensajes distintos', async () => {
    const fetchMock = vi.fn().mockImplementationOnce(() => responder(500, '<html>', 'text/html'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.salir()).rejects.toBeInstanceOf(ErrorApi);

    fetchMock.mockImplementationOnce(() => responder(503, { message: '' }));
    await expect(api.catalogo()).rejects.toThrow('no responde');
  });

  it('si el navegador no puede conectar, lo dice sin inventar un estado HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed')));
    await expect(api.localidades()).rejects.toThrow('No pude conectar');
  });

  it('reenvía el aborto y no lo convierte en error de red', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('abortado', 'AbortError')),
    );
    await expect(api.yo()).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('las operaciones de la web pegan a la ruta que el backend expone', async () => {
    const fetchMock = vi.fn().mockImplementation(() => responder(200, []));
    vi.stubGlobal('fetch', fetchMock);
    const archivo = new File(['x'], 'a.jpg', { type: 'image/jpeg' });

    await api.localidades();
    await api.registro({
      nombre: 'Ada',
      correo: 'ada@mestizo.test',
      contrasena: 'Correcta123',
      localidadId: 'loc',
      rol: 'adoptante',
      consentimientoDatos: true,
    });
    await api.actualizarCuenta({ nombre: 'Ada', localidadId: 'loc' });
    await api.subirFotoPerfil(archivo);
    await api.miVerificacion();
    await api.enviarVerificacion(new FormData());
    await api.colaVerificacion();
    await api.detalleVerificacion('v1');
    await api.resolverVerificacion('v1', { accion: 'aprobar' });
    await api.catalogo({ especie: 'felino', localidadId: 'loc' });
    await api.misAnimales();
    await api.animal('an1');
    await api.publicarAnimal(new FormData());
    await api.perfil();
    await api.guardarPerfil({
      tipoVivienda: 'casa',
      horasCompania: 4,
      ninosEnHogar: false,
      otrosAnimales: 'ninguno',
      energiaSostenible: 'baja',
    });
    await api.postular('an1', { mayorDeEdad: true, viveEnBogota: true });
    await api.misPostulaciones();
    await api.postulacionesDe('an1');
    await api.resolverPostulacion('p1', { accion: 'abrir' });
    await api.entidades();
    await api.entidadPublica('e1');
    await api.publicarDeseo({
      categoria: 'alimento',
      descripcion: 'arroz',
      cantidad: 1,
      unidad: 'kg',
      prioridad: 'alta',
    });
    await api.misDeseos();
    await api.reservarDeseo('i1', '300123');
    await api.confirmarReserva('r1', new FormData());

    const rutas = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(rutas).toContain('/api/animales?especie=felino&localidadId=loc');
    expect(rutas).toContain('/api/auth/yo/foto');
    expect(api.urlEvidencia('v1', 'ev1')).toBe('/api/verificaciones/v1/evidencias/ev1');
    const foto = fetchMock.mock.calls.find((call) => String(call[0]).endsWith('/auth/yo/foto'));
    expect(foto?.[1].body).toBeInstanceOf(FormData);
  });
});
