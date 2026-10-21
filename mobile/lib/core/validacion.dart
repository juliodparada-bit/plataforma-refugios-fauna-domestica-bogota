final _correoRe = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

String? validarNombre(String? v) {
  if (v == null || v.trim().length < 2) return 'Escribe un nombre (mínimo 2 caracteres).';
  return null;
}

String? validarCorreo(String? v) {
  final t = v?.trim() ?? '';
  if (t.isEmpty) return 'Escribe tu correo.';
  if (!_correoRe.hasMatch(t)) return 'Correo no válido.';
  return null;
}

String? validarContrasena(String? v) {
  if (v == null || v.isEmpty) return 'Escribe tu contraseña.';
  return null;
}

String? validarContrasenaNueva(String? v) {
  if (v == null || v.length < 8) return 'Mínimo 8 caracteres.';
  return null;
}

String? validarLocalidad(String? v) {
  if (v == null || v.isEmpty) return 'Elige una localidad.';
  return null;
}

String? validarHistoria(String? v) {
  if (v == null || v.trim().length < 20) return 'La historia es obligatoria (mínimo 20 caracteres).';
  return null;
}

String? validarDescripcionDeseo(String? v) {
  final t = v?.trim() ?? '';
  if (t.length < 4) return 'Describe el ítem (mínimo 4 caracteres).';
  if (t.length > 200) return 'La descripción no puede superar 200 caracteres.';
  return null;
}

String? validarUnidad(String? v) {
  final t = v?.trim() ?? '';
  if (t.isEmpty) return 'Indica la unidad (bulto, caja, frasco…).';
  if (t.length > 30) return 'La unidad es demasiado larga.';
  return null;
}

String? validarContactoEntrega(String? v) {
  final t = v?.trim() ?? '';
  if (t.length < 5) return 'Deja un contacto de al menos 5 caracteres.';
  if (t.length > 120) return 'El contacto no puede superar 120 caracteres.';
  return null;
}

int? cantidadEntera(String? v) {
  final n = int.tryParse(v?.trim() ?? '');
  if (n == null || n < 1) return null;
  return n;
}
