import 'package:image_picker/image_picker.dart';

import 'api/error_api.dart';

/// El API rechaza archivos de más de 5 MiB (misma cota que Nest).
const pesoMaximoFoto = 5 * 1024 * 1024;

Future<XFile?> elegirFotoGaleria() {
  return ImagePicker().pickImage(
    source: ImageSource.gallery,
    imageQuality: 82,
    maxWidth: 1600,
    maxHeight: 1600,
  );
}

Future<void> asegurarPesoFoto(XFile archivo) async {
  final bytes = await archivo.length();
  if (bytes > pesoMaximoFoto) {
    throw ErrorApi('La imagen supera 5 MB. Elige otra más liviana.');
  }
}
