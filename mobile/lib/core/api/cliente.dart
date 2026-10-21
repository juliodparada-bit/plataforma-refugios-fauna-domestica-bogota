import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config.dart';
import '../modelos/modelos.dart';
import 'error_api.dart';
import 'token.dart';

class TokenPagina {
  CancelToken _token = CancelToken();

  CancelToken get actual => _token;

  CancelToken renovar() {
    if (!_token.isCancelled) _token.cancel();
    _token = CancelToken();
    return _token;
  }

  void dispose() {
    if (!_token.isCancelled) _token.cancel();
  }
}

class ApiCliente {
  ApiCliente({
    required FlutterSecureStorage almacen,
    this.onNoAutorizado,
    String? baseUrl,
  })  : _almacen = almacen,
        dio = Dio(
          BaseOptions(
            baseUrl: baseUrl ?? urlBaseApi(),
            connectTimeout: const Duration(seconds: 12),
            receiveTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(seconds: 20),
            headers: const {'Accept': 'application/json'},
            validateStatus: (code) => code != null && code < 600,
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _almacen.read(key: _claveToken);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.next(error);
        },
      ),
    );
  }

  static const _claveToken = 'sid_jwt';

  final FlutterSecureStorage _almacen;
  final Dio dio;
  void Function()? onNoAutorizado;
  String? _ultimoSid;

  Future<void> guardarToken(String token) {
    return _almacen.write(key: _claveToken, value: token);
  }

  Future<void> borrarToken() => _almacen.delete(key: _claveToken);

  Future<T> _pedir<T>(
    String ruta, {
    String metodo = 'GET',
    Object? datos,
    Map<String, dynamic>? query,
    T Function(Object? cuerpo)? leer,
    bool aceptarNulo = false,
    CancelToken? cancelar,
  }) async {
    try {
      final res = await dio.request<Object>(
        ruta,
        data: datos,
        queryParameters: query,
        cancelToken: cancelar,
        options: Options(
          method: metodo,
          contentType: datos is FormData ? null : Headers.jsonContentType,
        ),
      );
      _ultimoSid = sidDeCabeceras(res.headers.map) ?? _ultimoSid;
      final codigo = res.statusCode ?? 0;
      if (codigo == 401) {
        final esLogin =
            ruta.contains('/auth/entrar') || ruta.contains('/auth/registro');
        if (!esLogin) {
          await borrarToken();
          onNoAutorizado?.call();
        }
        throw ErrorApi(
          mensajeDeCuerpo(res.data, 'Debes iniciar sesión.'),
          status: 401,
        );
      }
      if (codigo < 200 || codigo >= 300) {
        final fallback = (codigo == 502 || codigo == 503 || codigo == 504)
            ? 'La API no responde. ¿Está encendida en el puerto 3000?'
            : 'No se pudo completar la operación.';
        throw ErrorApi(mensajeDeCuerpo(res.data, fallback), status: codigo);
      }
      final cuerpo = res.data;
      if (cuerpo == null || cuerpo == '') {
        if (aceptarNulo) return null as T;
        throw ErrorApi('La API respondió vacío.');
      }
      if (leer != null) {
        try {
          return leer(cuerpo);
        } on ErrorApi {
          rethrow;
        } catch (_) {
          throw ErrorApi('La API respondió un formato inesperado.');
        }
      }
      return cuerpo as T;
    } on ErrorApi {
      rethrow;
    } on PeticionCancelada {
      rethrow;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel || CancelToken.isCancel(e)) {
        throw const PeticionCancelada();
      }
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        throw ErrorApi(mensajeConexion(e.message ?? e.error));
      }
      throw ErrorApi(mensajeConexion(e.message ?? e.error));
    }
  }

  List<T> Function(Object? c) _listaDe<T>(T Function(Map<String, dynamic>) leer) {
    return (c) {
      if (c is! List) return <T>[];
      return c
          .whereType<Map>()
          .map((e) => leer(Map<String, dynamic>.from(e)))
          .toList();
    };
  }

  T Function(Object? c) _objeto<T>(T Function(Map<String, dynamic>) leer) {
    return (c) {
      if (c is Map<String, dynamic>) return leer(c);
      if (c is Map) return leer(Map<String, dynamic>.from(c));
      throw ErrorApi('La API respondió un formato inesperado.');
    };
  }

  Future<List<Localidad>> localidades({CancelToken? cancelar}) {
    return _pedir(
      '/localidades',
      cancelar: cancelar,
      leer: _listaDe(Localidad.fromJson),
    );
  }

  Future<Usuario?> yo({CancelToken? cancelar}) async {
    try {
      return await _pedir<Usuario?>(
        '/auth/yo',
        aceptarNulo: true,
        cancelar: cancelar,
        leer: (c) {
          if (c == null) return null;
          if (c is Map<String, dynamic>) return Usuario.fromJson(c);
          if (c is Map) return Usuario.fromJson(Map<String, dynamic>.from(c));
          return null;
        },
      );
    } on ErrorApi catch (e) {
      if (e.status == 401) return null;
      rethrow;
    }
  }

  Future<SesionAuth> registro({
    required String nombre,
    required String correo,
    required String contrasena,
    required String localidadId,
    required String rol,
    required bool consentimientoDatos,
  }) {
    return _sesionAuth('/auth/registro', {
      'nombre': nombre,
      'correo': correo,
      'contrasena': contrasena,
      'localidadId': localidadId,
      'rol': rol,
      'consentimientoDatos': consentimientoDatos,
    });
  }

  Future<SesionAuth> entrar(String correo, String contrasena) {
    return _sesionAuth('/auth/entrar', {'correo': correo, 'contrasena': contrasena});
  }

  Future<SesionAuth> _sesionAuth(String ruta, Map<String, dynamic> datos) async {
    final sesion = await _pedir(
      ruta,
      metodo: 'POST',
      datos: datos,
      leer: _objeto(SesionAuth.fromJson),
    );
    final token = tokenDeSesion(
      {'token': sesion.token},
      sidCookie: _ultimoSid,
    );
    if (token != null && token.isNotEmpty) {
      return SesionAuth(usuario: sesion.usuario, token: token);
    }
    return sesion;
  }

  Future<void> salir() async {
    try {
      await _pedir('/auth/salir', metodo: 'POST', leer: (_) => true);
    } catch (_) {
      /* limpiamos el token local igual */
    }
    await borrarToken();
  }

  Future<Usuario> actualizarCuenta({
    required String nombre,
    required String localidadId,
    String? entidadNombre,
  }) {
    return _pedir(
      '/auth/yo',
      metodo: 'PATCH',
      datos: {
        'nombre': nombre,
        'localidadId': localidadId,
        ?entidadNombre: entidadNombre,
      },
      leer: _objeto(Usuario.fromJson),
    );
  }

  Future<Usuario> subirFotoPerfil(String rutaArchivo, String nombreArchivo) {
    return _pedir(
      '/auth/yo/foto',
      metodo: 'POST',
      datos: FormData.fromMap({
        'foto': MultipartFile.fromFileSync(rutaArchivo, filename: nombreArchivo),
      }),
      leer: _objeto(Usuario.fromJson),
    );
  }

  Future<List<int>> bytesAutenticados(String rutaAbsoluta, {CancelToken? cancelar}) async {
    try {
      final res = await dio.get<List<int>>(
        rutaAbsoluta,
        cancelToken: cancelar,
        options: Options(responseType: ResponseType.bytes),
      );
      if (res.statusCode != null && res.statusCode! >= 200 && res.statusCode! < 300) {
        return res.data ?? const [];
      }
      throw ErrorApi('No pude cargar la imagen.', status: res.statusCode);
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel || CancelToken.isCancel(e)) {
        throw const PeticionCancelada();
      }
      throw ErrorApi('No pude cargar la imagen.');
    }
  }

  Future<MiVerificacion> miVerificacion({CancelToken? cancelar}) {
    return _pedir(
      '/verificaciones/mia',
      cancelar: cancelar,
      leer: _objeto(MiVerificacion.fromJson),
    );
  }

  Future<SolicitudVerificacion> enviarVerificacion(FormData datos) {
    return _pedir(
      '/verificaciones',
      metodo: 'POST',
      datos: datos,
      leer: _objeto(SolicitudVerificacion.fromJson),
    );
  }

  Future<List<ColaItem>> colaVerificacion({CancelToken? cancelar}) {
    return _pedir(
      '/verificaciones',
      cancelar: cancelar,
      leer: _listaDe(ColaItem.fromJson),
    );
  }

  Future<SolicitudVerificacion> detalleVerificacion(String id, {CancelToken? cancelar}) {
    return _pedir(
      '/verificaciones/$id',
      cancelar: cancelar,
      leer: _objeto(SolicitudVerificacion.fromJson),
    );
  }

  Future<SolicitudVerificacion> resolverVerificacion(
    String id, {
    required String accion,
    String? motivo,
    bool visitaNecesaria = false,
  }) {
    return _pedir(
      '/verificaciones/$id/resolver',
      metodo: 'POST',
      datos: {
        'accion': accion,
        if (motivo != null && motivo.isNotEmpty) 'motivo': motivo,
        'visitaNecesaria': visitaNecesaria,
      },
      leer: _objeto(SolicitudVerificacion.fromJson),
    );
  }

  String urlEvidencia(String verificacionId, String evidenciaId) {
    return urlMedio('/api/verificaciones/$verificacionId/evidencias/$evidenciaId');
  }

  Future<List<TarjetaAnimal>> catalogo({
    String? especie,
    String? localidadId,
    CancelToken? cancelar,
  }) {
    return _pedir(
      '/animales',
      query: {
        if (especie != null && especie.isNotEmpty) 'especie': especie,
        if (localidadId != null && localidadId.isNotEmpty) 'localidadId': localidadId,
      },
      cancelar: cancelar,
      leer: _listaDe(TarjetaAnimal.fromJson),
    );
  }

  Future<List<TarjetaAnimal>> misAnimales({CancelToken? cancelar}) {
    return _pedir(
      '/animales/mios',
      cancelar: cancelar,
      leer: _listaDe(TarjetaAnimal.fromJson),
    );
  }

  Future<DetalleAnimal> animal(String id, {CancelToken? cancelar}) {
    return _pedir(
      '/animales/$id',
      cancelar: cancelar,
      leer: _objeto(DetalleAnimal.fromJson),
    );
  }

  Future<DetalleAnimal> publicarAnimal(FormData datos) {
    return _pedir(
      '/animales',
      metodo: 'POST',
      datos: datos,
      leer: _objeto(DetalleAnimal.fromJson),
    );
  }

  Future<PerfilAdoptante?> perfil({CancelToken? cancelar}) {
    return _pedir(
      '/perfil',
      aceptarNulo: true,
      cancelar: cancelar,
      leer: (c) {
        if (c == null) return null;
        if (c is Map<String, dynamic>) return PerfilAdoptante.fromJson(c);
        if (c is Map) return PerfilAdoptante.fromJson(Map<String, dynamic>.from(c));
        return null;
      },
    );
  }

  Future<PerfilAdoptante> guardarPerfil(PerfilAdoptante datos) {
    return _pedir(
      '/perfil',
      metodo: 'PUT',
      datos: datos.toJson(),
      leer: _objeto(PerfilAdoptante.fromJson),
    );
  }

  Future<void> postular(
    String animalId, {
    required bool mayorDeEdad,
    required bool viveEnBogota,
  }) {
    return _pedir(
      '/animales/$animalId/postulaciones',
      metodo: 'POST',
      datos: {'mayorDeEdad': mayorDeEdad, 'viveEnBogota': viveEnBogota},
      leer: (_) => true,
    );
  }

  Future<List<PostulacionMia>> misPostulaciones({CancelToken? cancelar}) {
    return _pedir(
      '/postulaciones/mias',
      cancelar: cancelar,
      leer: _listaDe(PostulacionMia.fromJson),
    );
  }

  Future<DetallePostulaciones> postulacionesDe(String animalId, {CancelToken? cancelar}) {
    return _pedir(
      '/animales/$animalId/postulaciones',
      cancelar: cancelar,
      leer: _objeto(DetallePostulaciones.fromJson),
    );
  }

  Future<void> resolverPostulacion(
    String id, {
    required String accion,
    String? seguimientoResultado,
    bool? requiereEvidenciaHogar,
  }) {
    return _pedir(
      '/postulaciones/$id/resolver',
      metodo: 'POST',
      datos: {
        'accion': accion,
        ?seguimientoResultado: seguimientoResultado,
        ?requiereEvidenciaHogar: requiereEvidenciaHogar,
      },
      leer: (_) => true,
    );
  }

  Future<List<TarjetaEntidad>> entidades({CancelToken? cancelar}) {
    return _pedir(
      '/entidades',
      cancelar: cancelar,
      leer: _listaDe(TarjetaEntidad.fromJson),
    );
  }

  Future<PerfilEntidadPublico> entidadPublica(String id, {CancelToken? cancelar}) {
    return _pedir(
      '/entidades/$id',
      cancelar: cancelar,
      leer: _objeto(PerfilEntidadPublico.fromJson),
    );
  }

  Future<void> publicarDeseo({
    required String categoria,
    required String descripcion,
    required int cantidad,
    required String unidad,
    required String prioridad,
  }) {
    return _pedir(
      '/deseos',
      metodo: 'POST',
      datos: {
        'categoria': categoria,
        'descripcion': descripcion,
        'cantidad': cantidad,
        'unidad': unidad,
        'prioridad': prioridad,
      },
      leer: (_) => true,
    );
  }

  Future<List<DeseoPropio>> misDeseos({CancelToken? cancelar}) {
    return _pedir(
      '/deseos/mios',
      cancelar: cancelar,
      leer: _listaDe(DeseoPropio.fromJson),
    );
  }

  Future<void> reservarDeseo(String id, String contactoEntrega) {
    return _pedir(
      '/deseos/$id/reservar',
      metodo: 'POST',
      datos: {'contactoEntrega': contactoEntrega},
      leer: (_) => true,
    );
  }

  Future<void> confirmarReserva(
    String id, {
    required bool checkRecibido,
    String? rutaFoto,
    String? nombreFoto,
  }) {
    final mapa = <String, dynamic>{
      'checkRecibido': checkRecibido ? 'true' : 'false',
    };
    if (rutaFoto != null && nombreFoto != null) {
      mapa['foto'] = MultipartFile.fromFileSync(rutaFoto, filename: nombreFoto);
    }
    return _pedir(
      '/reservas/$id/confirmar',
      metodo: 'POST',
      datos: FormData.fromMap(mapa),
      leer: (_) => true,
    );
  }
}
