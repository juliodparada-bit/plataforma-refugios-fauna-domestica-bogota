const nombreMarca = 'Mestizo';
const eslogan = 'Por convivencia, no por raza.';
const esloganHero = 'No busca una raza. Busca un hogar.';

const selloEtiqueta = <String, String>{
  'nivel_1': 'Sello Nivel 1',
  'nivel_2': 'Sello Nivel 2',
  'en_revision': 'En revisión',
  'rechazada': 'Rechazada',
  'aprobada': 'Aprobada',
  'complemento': 'Piden complemento',
};

const tallaEtiqueta = <String, String>{
  'pequeno': 'pequeño',
  'mediano': 'mediano',
  'grande': 'grande',
};

const estadoAnimalEtiqueta = <String, String>{
  'publicado': 'Publicado (en catálogo)',
  'reservado': 'Reservado (preselección)',
  'adoptado': 'Adoptado (cupo liberado)',
  'archivado': 'Archivado',
  'borrador': 'Borrador',
};

const evidenciaEtiqueta = <String, String>{
  'rut': 'RUT',
  'camara_comercio': 'Cámara de Comercio',
  'representacion_legal': 'Representación legal',
  'evidencia_idpyba': 'Evidencia IDPYBA',
  'carta_comvezcol': 'Carta COMVEZCOL',
  'en_revision': 'En revisión',
  'complemento': 'Complemento',
  'nivel_1': 'Nivel 1',
  'nivel_2': 'Nivel 2',
};

String etiquetaEspecie(String especie) =>
    especie == 'canino' ? 'Canino' : 'Felino';

String etiquetaSello(String valor) => selloEtiqueta[valor] ?? valor;

String etiquetaTalla(String valor) => tallaEtiqueta[valor] ?? valor;

String etiquetaCategoria(String valor) {
  switch (valor) {
    case 'alimento':
      return 'Alimento';
    case 'medicina':
      return 'Medicina';
    case 'aseo':
      return 'Aseo';
    default:
      return valor;
  }
}

String iconoCategoria(String valor) {
  switch (valor) {
    case 'alimento':
      return '🌾';
    case 'medicina':
      return '💊';
    case 'aseo':
      return '🧼';
    default:
      return '✦';
  }
}

String etiquetaRol(String rol) {
  switch (rol) {
    case 'adoptante':
      return 'Adoptante';
    case 'donante':
      return 'Donante de insumos';
    case 'entidad':
      return 'Entidad';
    case 'validador':
      return 'Validador';
    default:
      return rol;
  }
}

const estadoPostulacionEtiqueta = <String, String>{
  'enviada': 'Enviada',
  'en_revision': 'En revisión',
  'preseleccionada': 'Preseleccionada',
  'rechazada': 'Rechazada',
  'entregada': 'Entregada',
  'seguimiento': 'Seguimiento',
  'caida': 'Preselección caída',
};

const prioridadEtiqueta = <String, String>{
  'alta': 'Alta',
  'media': 'Media',
  'baja': 'Baja',
};

String etiquetaEstadoAnimal(String? estado) =>
    estadoAnimalEtiqueta[estado] ?? (estado ?? '');

String etiquetaEstadoPostulacion(String? estado) =>
    estadoPostulacionEtiqueta[estado] ?? (estado ?? '');

String etiquetaPrioridad(String valor) => prioridadEtiqueta[valor] ?? valor;

String iniciales(String nombre) {
  final partes = nombre.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
  final lista = partes.toList();
  final letras = '${lista.isNotEmpty ? lista.first[0] : ''}'
      '${lista.length > 1 ? lista[1][0] : ''}';
  return letras.toUpperCase().isEmpty ? '?' : letras.toUpperCase();
}

String fechaCorta(String? iso) {
  if (iso == null || iso.isEmpty) return '';
  final fecha = DateTime.tryParse(iso);
  if (fecha == null) return iso;
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  return '${fecha.day} de ${meses[fecha.month - 1]} de ${fecha.year}';
}
