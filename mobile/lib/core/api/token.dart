/// Extrae el JWT del cuerpo de sesión o, si falta, de la cookie `sid`.
/// La web usa la cookie; el móvil guarda el Bearer en almacenamiento seguro.
String? tokenDeSesion(Object? cuerpo, {String? sidCookie}) {
  if (cuerpo is Map) {
    final token = cuerpo['token'];
    if (token is String && token.trim().isNotEmpty) return token.trim();
  }
  if (sidCookie != null && sidCookie.trim().isNotEmpty) return sidCookie.trim();
  return null;
}

String? sidDeCabeceras(Map<String, List<String>> headers) {
  final cookies =
      headers['set-cookie'] ?? headers['Set-Cookie'] ?? const <String>[];
  for (final crudo in cookies) {
    final m = RegExp(r'(?:^|,)\s*sid=([^;]+)').firstMatch(crudo);
    if (m != null) return Uri.decodeComponent(m.group(1)!);
  }
  return null;
}
