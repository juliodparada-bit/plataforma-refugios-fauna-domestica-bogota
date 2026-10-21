import 'dart:io';

const clavePrefsApiUrl = 'api_url';

/// URL efectiva (prefs o dart-define). Las fotos autenticadas usan esta misma base.
class ApiConfig {
  static String actual = urlBasePorDefecto();
}

/// Base de la API Nest (sin sufijo `/api`). El proxy de Vite solo existe en la web.
/// En un teléfono físico hay que apuntar a la IP LAN del PC, no a 10.0.2.2.
String urlBasePorDefecto() {
  const definido = String.fromEnvironment('API_URL');
  if (definido.trim().isNotEmpty) {
    return sinBarraFinal(definido.trim());
  }
  if (Platform.isAndroid) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://127.0.0.1:3000';
}

String urlBaseApi() => ApiConfig.actual;

/// Convierte rutas relativas del JSON (`/api/animales/…`) a URL absoluta del móvil.
String urlMedio(String? ruta) {
  if (ruta == null || ruta.isEmpty) return '';
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  final base = urlBaseApi();
  var limpia = ruta;
  if (limpia.startsWith('/api/')) {
    limpia = limpia.substring(4);
  } else if (limpia == '/api') {
    limpia = '';
  }
  if (!limpia.startsWith('/')) limpia = '/$limpia';
  return '$base$limpia';
}

String sinBarraFinal(String valor) {
  return valor.endsWith('/') ? valor.substring(0, valor.length - 1) : valor;
}
