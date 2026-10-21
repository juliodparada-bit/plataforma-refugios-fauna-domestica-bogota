import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api/cliente.dart';
import 'api/error_api.dart';
import 'cache_imagenes.dart';
import 'config.dart';
import 'modelos/modelos.dart';
import 'tema/tema.dart';

class SesionEstado {
  const SesionEstado({this.usuario, this.errorArranque});

  final Usuario? usuario;
  final String? errorArranque;

  bool get haySesion => usuario != null;
}

final almacenSeguroProvider = Provider<FlutterSecureStorage>((ref) {
  // EncryptedSharedPreferences tumba el arranque en varios Xiaomi/Redmi.
  // El Keystore por defecto basta para el JWT de este prototipo.
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: false),
  );
});

final prefsProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('prefsProvider se sobreescribe en main');
});

final temaControladorProvider = ChangeNotifierProvider<TemaControlador>((ref) {
  return TemaControlador(ref.watch(prefsProvider));
});

final cacheImagenesProvider = Provider<CacheImagenes>((ref) => CacheImagenes());

final apiUrlProvider = StateProvider<String>((ref) {
  final guardada = ref.watch(prefsProvider).getString(clavePrefsApiUrl);
  if (guardada != null && guardada.trim().isNotEmpty) {
    return sinBarraFinal(guardada.trim());
  }
  return urlBasePorDefecto();
});

final bytesImagenProvider = FutureProvider.family<List<int>, String>((ref, url) async {
  final cache = ref.read(cacheImagenesProvider);
  final cached = cache.obtener(url);
  if (cached != null && cached.isNotEmpty) return cached;
  try {
    final bytes = await ref.read(apiProvider).bytesAutenticados(url);
    if (bytes.isNotEmpty) cache.guardar(url, bytes);
    return bytes;
  } on PeticionCancelada {
    return const [];
  }
});

final apiProvider = Provider<ApiCliente>((ref) {
  final url = ref.watch(apiUrlProvider);
  ApiConfig.actual = url;
  final api = ApiCliente(
    almacen: ref.watch(almacenSeguroProvider),
    baseUrl: url,
  );
  api.onNoAutorizado = () {
    ref.read(sesionProvider.notifier).olvidarLocal();
  };
  return api;
});

final sesionProvider = AsyncNotifierProvider<SesionNotifier, SesionEstado>(
  SesionNotifier.new,
);

class SesionNotifier extends AsyncNotifier<SesionEstado> {
  @override
  Future<SesionEstado> build() => _cargar();

  Future<SesionEstado> _cargar() async {
    try {
      final yo = await ref.read(apiProvider).yo();
      return SesionEstado(usuario: yo);
    } on ErrorApi catch (e) {
      return SesionEstado(errorArranque: e.mensaje);
    } catch (e) {
      return SesionEstado(
        errorArranque: e is ErrorApi
            ? e.mensaje
            : 'No pude hablar con la API.',
      );
    }
  }

  Future<void> reintentar() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_cargar);
  }

  Future<Usuario> entrar(String correo, String contrasena) async {
    final api = ref.read(apiProvider);
    final sesion = await api.entrar(correo, contrasena);
    if (sesion.token != null && sesion.token!.isNotEmpty) {
      await api.guardarToken(sesion.token!);
    }
    state = AsyncData(SesionEstado(usuario: sesion.usuario));
    return sesion.usuario;
  }

  Future<Usuario> registrar({
    required String nombre,
    required String correo,
    required String contrasena,
    required String localidadId,
    required String rol,
  }) async {
    final api = ref.read(apiProvider);
    final sesion = await api.registro(
      nombre: nombre,
      correo: correo,
      contrasena: contrasena,
      localidadId: localidadId,
      rol: rol,
      consentimientoDatos: true,
    );
    if (sesion.token != null && sesion.token!.isNotEmpty) {
      await api.guardarToken(sesion.token!);
    }
    state = AsyncData(SesionEstado(usuario: sesion.usuario));
    return sesion.usuario;
  }

  Future<void> salir() async {
    await ref.read(apiProvider).salir();
    state = const AsyncData(SesionEstado());
  }

  void olvidarLocal() {
    state = const AsyncData(SesionEstado());
  }

  Future<void> aplicar(Usuario usuario) async {
    state = AsyncData(SesionEstado(usuario: usuario));
  }

  Future<void> refrescar() async {
    final actual = await _cargar();
    state = AsyncData(actual);
  }

  Future<void> guardarUrlApi(String url) async {
    final limpia = sinBarraFinal(url.trim());
    await ref.read(prefsProvider).setString(clavePrefsApiUrl, limpia);
    ref.read(apiUrlProvider.notifier).state = limpia;
    ApiConfig.actual = limpia;
    await reintentar();
  }
}

final localidadesProvider = FutureProvider<List<Localidad>>((ref) {
  return ref.watch(apiProvider).localidades();
});

String rutaInicioRol(Usuario? usuario) {
  if (usuario == null) return '/inicio';
  return usuario.esDonante ? '/necesidades' : '/catalogo';
}

/// Tras entrar o registrarse la web abre Cuenta (tablero), salvo donante → Necesidades.
String rutaTrasAuth(Usuario usuario) {
  return usuario.esDonante ? '/necesidades' : '/cuenta';
}
