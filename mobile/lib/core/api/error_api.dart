class ErrorApi implements Exception {
  ErrorApi(this.mensaje, {this.status});

  final String mensaje;
  final int? status;

  @override
  String toString() => mensaje;
}

/// La petición se canceló a propósito (cambio de filtro o dispose). No es un error de UI.
class PeticionCancelada implements Exception {
  const PeticionCancelada();
}

String mensajeDeCuerpo(Object? cuerpo, String fallback) {
  if (cuerpo is Map) {
    final msg = cuerpo['message'];
    if (msg is List) {
      final partes = msg.map((e) => '$e'.trim()).where((e) => e.isNotEmpty);
      if (partes.isNotEmpty) return partes.join(' ');
    }
    if (msg is String && msg.trim().isNotEmpty) return msg.trim();
  }
  if (cuerpo is String) {
    final texto = cuerpo.trim();
    if (texto.isEmpty) return fallback;
    // HTML u otro no-JSON: no lo mostramos crudo.
    if (texto.startsWith('<') || texto.length > 280) return fallback;
    return texto;
  }
  return fallback;
}

String mensajeConexion(Object? causa) {
  final crudo = causa?.toString().toLowerCase() ?? '';
  if (crudo.contains('connection refused') ||
      crudo.contains('failed host lookup') ||
      crudo.contains('network is unreachable') ||
      crudo.contains('connection error')) {
    return 'No pude conectar con la API. ¿Está encendida en el puerto 3000? '
        'En un teléfono físico usa --dart-define=API_URL=http://IP-LAN:3000.';
  }
  return 'No pude conectar con la API. ¿Está encendida en el puerto 3000?';
}

String textoError(Object error) {
  if (error is ErrorApi) return error.mensaje;
  return error.toString().replaceFirst('Exception: ', '');
}
