typedef Rol = String;

class EntidadSesion {
  const EntidadSesion({
    required this.id,
    required this.nombre,
    required this.estadoVerificacion,
    required this.puedePublicar,
  });

  final String id;
  final String nombre;
  final String estadoVerificacion;
  final bool puedePublicar;

  factory EntidadSesion.fromJson(Map<String, dynamic> json) {
    return EntidadSesion(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      estadoVerificacion: _texto(json['estadoVerificacion']),
      puedePublicar: _bool(json['puedePublicar']),
    );
  }
}

class Usuario {
  const Usuario({
    required this.id,
    required this.nombre,
    required this.correo,
    required this.rol,
    this.localidadId,
    required this.localidad,
    this.fotoUrl,
    this.consentimientoEn,
    this.tienePerfilAdoptante = false,
    this.demo = false,
    this.entidad,
  });

  final String id;
  final String nombre;
  final String correo;
  final Rol rol;
  final String? localidadId;
  final String localidad;
  final String? fotoUrl;
  final String? consentimientoEn;
  final bool tienePerfilAdoptante;
  final bool demo;
  final EntidadSesion? entidad;

  bool get esDonante => rol == 'donante';
  bool get esAdoptante => rol == 'adoptante';
  bool get esEntidad => rol == 'entidad';
  bool get esValidador => rol == 'validador';
  bool get puedePublicar => entidad?.puedePublicar ?? false;

  factory Usuario.fromJson(Map<String, dynamic> json) {
    final entidadJson = _mapa(json['entidad']);
    return Usuario(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      correo: _texto(json['correo']),
      rol: _texto(json['rol']),
      localidadId: _textoOpcional(json['localidadId']),
      localidad: _texto(json['localidad']),
      fotoUrl: _textoOpcional(json['fotoUrl']),
      consentimientoEn: _textoOpcional(json['consentimientoEn']),
      tienePerfilAdoptante: _bool(json['tienePerfilAdoptante']),
      demo: _bool(json['demo']),
      entidad: entidadJson == null ? null : EntidadSesion.fromJson(entidadJson),
    );
  }
}

class Localidad {
  const Localidad({
    required this.id,
    required this.nombre,
    required this.codigo,
  });

  final String id;
  final String nombre;
  final String codigo;

  factory Localidad.fromJson(Map<String, dynamic> json) {
    return Localidad(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      codigo: _texto(json['codigo']),
    );
  }
}

class NecesidadResumen {
  const NecesidadResumen({
    required this.id,
    required this.categoria,
    required this.descripcion,
    required this.cantidad,
    required this.unidad,
    required this.prioridad,
  });

  final String id;
  final String categoria;
  final String descripcion;
  final int cantidad;
  final String unidad;
  final String prioridad;

  factory NecesidadResumen.fromJson(Map<String, dynamic> json) {
    return NecesidadResumen(
      id: _texto(json['id']),
      categoria: _texto(json['categoria']),
      descripcion: _texto(json['descripcion']),
      cantidad: _entero(json['cantidad']),
      unidad: _texto(json['unidad']),
      prioridad: _texto(json['prioridad']),
    );
  }
}

class TarjetaEntidad {
  const TarjetaEntidad({
    required this.id,
    required this.nombre,
    required this.localidad,
    required this.badge,
    required this.pendientes,
    required this.necesidades,
  });

  final String id;
  final String nombre;
  final String localidad;
  final String badge;
  final int pendientes;
  final List<NecesidadResumen> necesidades;

  factory TarjetaEntidad.fromJson(Map<String, dynamic> json) {
    return TarjetaEntidad(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      localidad: _texto(json['localidad']),
      badge: _texto(json['badge']),
      pendientes: _entero(json['pendientes']),
      necesidades: _lista(json['necesidades']).map(NecesidadResumen.fromJson).toList(),
    );
  }
}

class TarjetaAnimal {
  const TarjetaAnimal({
    required this.id,
    required this.nombre,
    required this.especie,
    required this.localidad,
    required this.historia,
    required this.necesidadEspecial,
    this.raza,
    required this.edadAprox,
    required this.badge,
    required this.entidadId,
    required this.entidadNombre,
    this.fotoUrl,
    this.puntaje,
    this.fraseExplicable,
    this.estado,
    this.postulaciones,
  });

  final String id;
  final String nombre;
  final String especie;
  final String localidad;
  final String historia;
  final bool necesidadEspecial;
  final String? raza;
  final String edadAprox;
  final String badge;
  final String entidadId;
  final String entidadNombre;
  final String? fotoUrl;
  final int? puntaje;
  final String? fraseExplicable;
  final String? estado;
  final int? postulaciones;

  factory TarjetaAnimal.fromJson(Map<String, dynamic> json) {
    return TarjetaAnimal(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      especie: _texto(json['especie']),
      localidad: _texto(json['localidad']),
      historia: _texto(json['historia']),
      necesidadEspecial: _bool(json['necesidadEspecial']),
      raza: _textoOpcional(json['raza']),
      edadAprox: _texto(json['edadAprox']),
      badge: _texto(json['badge']),
      entidadId: _texto(json['entidadId']),
      entidadNombre: _texto(json['entidadNombre']),
      fotoUrl: _textoOpcional(json['fotoUrl']),
      puntaje: json['puntaje'] == null ? null : _entero(json['puntaje']),
      fraseExplicable: _textoOpcional(json['fraseExplicable']),
      estado: _textoOpcional(json['estado']),
      postulaciones: json['postulaciones'] == null ? null : _entero(json['postulaciones']),
    );
  }
}

class FotoAnimal {
  const FotoAnimal({
    required this.id,
    required this.url,
    required this.esPortada,
  });

  final String id;
  final String url;
  final bool esPortada;

  factory FotoAnimal.fromJson(Map<String, dynamic> json) {
    return FotoAnimal(
      id: _texto(json['id']),
      url: _texto(json['url']),
      esPortada: _bool(json['esPortada']),
    );
  }
}

class EntidadAnimal {
  const EntidadAnimal({
    required this.id,
    required this.nombre,
    required this.badge,
    required this.localidad,
  });

  final String id;
  final String nombre;
  final String badge;
  final String localidad;

  factory EntidadAnimal.fromJson(Map<String, dynamic> json) {
    return EntidadAnimal(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      badge: _texto(json['badge']),
      localidad: _texto(json['localidad']),
    );
  }
}

class DetalleAnimal {
  const DetalleAnimal({
    required this.id,
    required this.nombre,
    required this.especie,
    required this.sexo,
    required this.talla,
    required this.edadAprox,
    required this.energia,
    required this.historia,
    this.raza,
    required this.necesidadEspecial,
    required this.conviveNinos,
    required this.conviveOtrosAnimales,
    this.esterilizado,
    required this.estado,
    required this.localidad,
    required this.entidad,
    required this.fotos,
    required this.tienePerfil,
    this.puntaje,
    this.fraseExplicable,
  });

  final String id;
  final String nombre;
  final String especie;
  final String sexo;
  final String talla;
  final String edadAprox;
  final String energia;
  final String historia;
  final String? raza;
  final bool necesidadEspecial;
  final bool conviveNinos;
  final bool conviveOtrosAnimales;
  final bool? esterilizado;
  final String estado;
  final String localidad;
  final EntidadAnimal entidad;
  final List<FotoAnimal> fotos;
  final bool tienePerfil;
  final int? puntaje;
  final String? fraseExplicable;

  factory DetalleAnimal.fromJson(Map<String, dynamic> json) {
    return DetalleAnimal(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      especie: _texto(json['especie']),
      sexo: _texto(json['sexo']),
      talla: _texto(json['talla']),
      edadAprox: _texto(json['edadAprox']),
      energia: _texto(json['energia']),
      historia: _texto(json['historia']),
      raza: _textoOpcional(json['raza']),
      necesidadEspecial: _bool(json['necesidadEspecial']),
      conviveNinos: _bool(json['conviveNinos']),
      conviveOtrosAnimales: _bool(json['conviveOtrosAnimales']),
      esterilizado: json['esterilizado'] == null ? null : _bool(json['esterilizado']),
      estado: _texto(json['estado']),
      localidad: _texto(json['localidad']),
      entidad: EntidadAnimal.fromJson(_mapa(json['entidad']) ?? const {}),
      fotos: _lista(json['fotos']).map(FotoAnimal.fromJson).toList(),
      tienePerfil: _bool(json['tienePerfil']),
      puntaje: json['puntaje'] == null ? null : _entero(json['puntaje']),
      fraseExplicable: _textoOpcional(json['fraseExplicable']),
    );
  }
}

class PerfilAdoptante {
  const PerfilAdoptante({
    required this.tipoVivienda,
    required this.horasCompania,
    required this.ninosEnHogar,
    required this.otrosAnimales,
    required this.energiaSostenible,
  });

  final String tipoVivienda;
  final int horasCompania;
  final bool ninosEnHogar;
  final String otrosAnimales;
  final String energiaSostenible;

  factory PerfilAdoptante.fromJson(Map<String, dynamic> json) {
    return PerfilAdoptante(
      tipoVivienda: _texto(json['tipoVivienda']),
      horasCompania: _entero(json['horasCompania']).clamp(0, 24),
      ninosEnHogar: _bool(json['ninosEnHogar']),
      otrosAnimales: _texto(json['otrosAnimales']),
      energiaSostenible: _texto(json['energiaSostenible']),
    );
  }

  Map<String, dynamic> toJson() => {
        'tipoVivienda': tipoVivienda,
        'horasCompania': horasCompania,
        'ninosEnHogar': ninosEnHogar,
        'otrosAnimales': otrosAnimales,
        'energiaSostenible': energiaSostenible,
      };
}

class EvidenciaResumen {
  const EvidenciaResumen({
    required this.id,
    required this.tipoDocumento,
    required this.mime,
    required this.pesoBytes,
  });

  final String id;
  final String tipoDocumento;
  final String mime;
  final int pesoBytes;

  factory EvidenciaResumen.fromJson(Map<String, dynamic> json) {
    return EvidenciaResumen(
      id: _texto(json['id']),
      tipoDocumento: _texto(json['tipoDocumento']),
      mime: _texto(json['mime']),
      pesoBytes: _entero(json['pesoBytes']),
    );
  }
}

class SolicitudVerificacion {
  const SolicitudVerificacion({
    required this.id,
    required this.tipoNivel,
    required this.estado,
    this.motivo,
    required this.creadoEn,
    required this.evidencias,
    this.entidadNombre,
    this.entidadLocalidad,
  });

  final String id;
  final String tipoNivel;
  final String estado;
  final String? motivo;
  final String creadoEn;
  final List<EvidenciaResumen> evidencias;
  final String? entidadNombre;
  final String? entidadLocalidad;

  factory SolicitudVerificacion.fromJson(Map<String, dynamic> json) {
    final entidad = _mapa(json['entidad']);
    String? nombre;
    String? localidad;
    if (entidad != null) {
      nombre = _textoOpcional(entidad['nombre']);
      final loc = entidad['localidad'];
      if (loc is String) {
        localidad = loc;
      } else {
        localidad = _textoOpcional(_mapa(loc)?['nombre']);
      }
    }
    return SolicitudVerificacion(
      id: _texto(json['id']),
      tipoNivel: _texto(json['tipoNivel']),
      estado: _texto(json['estado']),
      motivo: _textoOpcional(json['motivo']),
      creadoEn: _texto(json['creadoEn']),
      evidencias: _lista(json['evidencias']).map(EvidenciaResumen.fromJson).toList(),
      entidadNombre: nombre,
      entidadLocalidad: localidad,
    );
  }
}

class ColaItem {
  const ColaItem({
    required this.id,
    required this.tipoNivel,
    required this.estado,
    required this.creadoEn,
    required this.evidencias,
    required this.entidadNombre,
    required this.localidad,
  });

  final String id;
  final String tipoNivel;
  final String estado;
  final String creadoEn;
  final List<EvidenciaResumen> evidencias;
  final String entidadNombre;
  final String localidad;

  factory ColaItem.fromJson(Map<String, dynamic> json) {
    final entidad = _mapa(json['entidad']) ?? const {};
    final loc = entidad['localidad'];
    return ColaItem(
      id: _texto(json['id']),
      tipoNivel: _texto(json['tipoNivel']),
      estado: _texto(json['estado']),
      creadoEn: _texto(json['creadoEn']),
      evidencias: _lista(json['evidencias']).map(EvidenciaResumen.fromJson).toList(),
      entidadNombre: _texto(entidad['nombre']),
      localidad: loc is Map
          ? _texto(loc['nombre'])
          : _texto(loc),
    );
  }
}

class MiVerificacion {
  const MiVerificacion({
    required this.entidadId,
    required this.nombre,
    required this.localidadId,
    required this.nivelSolicitado,
    required this.estadoVerificacion,
    required this.puedePublicar,
    this.solicitud,
  });

  final String entidadId;
  final String nombre;
  final String localidadId;
  final String nivelSolicitado;
  final String estadoVerificacion;
  final bool puedePublicar;
  final SolicitudVerificacion? solicitud;

  factory MiVerificacion.fromJson(Map<String, dynamic> json) {
    final entidad = _mapa(json['entidad']) ?? const {};
    final sol = _mapa(json['solicitud']);
    return MiVerificacion(
      entidadId: _texto(entidad['id']),
      nombre: _texto(entidad['nombre']),
      localidadId: _texto(entidad['localidadId']),
      nivelSolicitado: _texto(entidad['nivelSolicitado']),
      estadoVerificacion: _texto(entidad['estadoVerificacion']),
      puedePublicar: _bool(entidad['puedePublicar']),
      solicitud: sol == null ? null : SolicitudVerificacion.fromJson(sol),
    );
  }
}

class PostulacionMia {
  const PostulacionMia({
    required this.id,
    required this.puntaje,
    required this.fraseExplicable,
    required this.estado,
    required this.animalId,
    required this.animalNombre,
    required this.animalEstado,
  });

  final String id;
  final int puntaje;
  final String fraseExplicable;
  final String estado;
  final String animalId;
  final String animalNombre;
  final String animalEstado;

  factory PostulacionMia.fromJson(Map<String, dynamic> json) {
    final animal = _mapa(json['animal']) ?? const {};
    return PostulacionMia(
      id: _texto(json['id']),
      puntaje: _entero(json['puntaje']),
      fraseExplicable: _texto(json['fraseExplicable']),
      estado: _texto(json['estado']),
      animalId: _texto(animal['id']),
      animalNombre: _texto(animal['nombre']),
      animalEstado: _texto(animal['estado']),
    );
  }
}

class PostulacionDeAnimal {
  const PostulacionDeAnimal({
    required this.id,
    required this.puntaje,
    required this.fraseExplicable,
    required this.estado,
    required this.requiereEvidenciaHogar,
    this.seguimientoResultado,
    required this.adoptanteNombre,
    required this.adoptanteLocalidad,
    this.perfil,
  });

  final String id;
  final int puntaje;
  final String fraseExplicable;
  final String estado;
  final bool requiereEvidenciaHogar;
  final String? seguimientoResultado;
  final String adoptanteNombre;
  final String adoptanteLocalidad;
  final PerfilAdoptante? perfil;

  factory PostulacionDeAnimal.fromJson(Map<String, dynamic> json) {
    final adoptante = _mapa(json['adoptante']) ?? const {};
    final perfil = _mapa(adoptante['perfil']);
    return PostulacionDeAnimal(
      id: _texto(json['id']),
      puntaje: _entero(json['puntaje']),
      fraseExplicable: _texto(json['fraseExplicable']),
      estado: _texto(json['estado']),
      requiereEvidenciaHogar: _bool(json['requiereEvidenciaHogar']),
      seguimientoResultado: _textoOpcional(json['seguimientoResultado']),
      adoptanteNombre: _texto(adoptante['nombre']),
      adoptanteLocalidad: _texto(adoptante['localidad']),
      perfil: perfil == null ? null : PerfilAdoptante.fromJson(perfil),
    );
  }
}

class DetallePostulaciones {
  const DetallePostulaciones({
    required this.animalId,
    required this.animalNombre,
    required this.animalEstado,
    required this.necesidadEspecial,
    required this.postulaciones,
  });

  final String animalId;
  final String animalNombre;
  final String animalEstado;
  final bool necesidadEspecial;
  final List<PostulacionDeAnimal> postulaciones;

  factory DetallePostulaciones.fromJson(Map<String, dynamic> json) {
    final animal = _mapa(json['animal']) ?? const {};
    return DetallePostulaciones(
      animalId: _texto(animal['id']),
      animalNombre: _texto(animal['nombre']),
      animalEstado: _texto(animal['estado']),
      necesidadEspecial: _bool(animal['necesidadEspecial']),
      postulaciones: _lista(json['postulaciones']).map(PostulacionDeAnimal.fromJson).toList(),
    );
  }
}

class DeseoPublico {
  const DeseoPublico({
    required this.id,
    required this.categoria,
    required this.descripcion,
    required this.cantidad,
    required this.unidad,
    required this.prioridad,
    required this.estado,
  });

  final String id;
  final String categoria;
  final String descripcion;
  final int cantidad;
  final String unidad;
  final String prioridad;
  final String estado;

  factory DeseoPublico.fromJson(Map<String, dynamic> json) {
    return DeseoPublico(
      id: _texto(json['id']),
      categoria: _texto(json['categoria']),
      descripcion: _texto(json['descripcion']),
      cantidad: _entero(json['cantidad']),
      unidad: _texto(json['unidad']),
      prioridad: _texto(json['prioridad']),
      estado: _texto(json['estado']),
    );
  }
}

class BitacoraItem {
  const BitacoraItem({
    required this.categoria,
    required this.descripcion,
    required this.cantidad,
    required this.unidad,
    required this.cubiertoEn,
  });

  final String categoria;
  final String descripcion;
  final int cantidad;
  final String unidad;
  final String cubiertoEn;

  factory BitacoraItem.fromJson(Map<String, dynamic> json) {
    return BitacoraItem(
      categoria: _texto(json['categoria']),
      descripcion: _texto(json['descripcion']),
      cantidad: _entero(json['cantidad']),
      unidad: _texto(json['unidad']),
      cubiertoEn: _texto(json['cubiertoEn']),
    );
  }
}

class AnimalPublicoEntidad {
  const AnimalPublicoEntidad({
    required this.id,
    required this.nombre,
    required this.especie,
    required this.localidad,
    required this.historia,
    required this.necesidadEspecial,
    this.fotoUrl,
  });

  final String id;
  final String nombre;
  final String especie;
  final String localidad;
  final String historia;
  final bool necesidadEspecial;
  final String? fotoUrl;

  factory AnimalPublicoEntidad.fromJson(Map<String, dynamic> json) {
    return AnimalPublicoEntidad(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      especie: _texto(json['especie']),
      localidad: _texto(json['localidad']),
      historia: _texto(json['historia']),
      necesidadEspecial: _bool(json['necesidadEspecial']),
      fotoUrl: _textoOpcional(json['fotoUrl']),
    );
  }
}

class PerfilEntidadPublico {
  const PerfilEntidadPublico({
    required this.id,
    required this.nombre,
    required this.localidad,
    required this.badge,
    required this.bitacora,
    required this.deseos,
    required this.animales,
  });

  final String id;
  final String nombre;
  final String localidad;
  final String badge;
  final List<BitacoraItem> bitacora;
  final List<DeseoPublico> deseos;
  final List<AnimalPublicoEntidad> animales;

  factory PerfilEntidadPublico.fromJson(Map<String, dynamic> json) {
    return PerfilEntidadPublico(
      id: _texto(json['id']),
      nombre: _texto(json['nombre']),
      localidad: _texto(json['localidad']),
      badge: _texto(json['badge']),
      bitacora: _lista(json['bitacora']).map(BitacoraItem.fromJson).toList(),
      deseos: _lista(json['deseos']).map(DeseoPublico.fromJson).toList(),
      animales: _lista(json['animales']).map(AnimalPublicoEntidad.fromJson).toList(),
    );
  }
}

class ReservaDeseo {
  const ReservaDeseo({
    required this.id,
    required this.estado,
    required this.contactoEntrega,
  });

  final String id;
  final String estado;
  final String contactoEntrega;

  factory ReservaDeseo.fromJson(Map<String, dynamic> json) {
    return ReservaDeseo(
      id: _texto(json['id']),
      estado: _texto(json['estado']),
      contactoEntrega: _texto(json['contactoEntrega']),
    );
  }
}

class DeseoPropio {
  const DeseoPropio({
    required this.id,
    required this.categoria,
    required this.descripcion,
    required this.cantidad,
    required this.unidad,
    required this.prioridad,
    required this.estado,
    required this.reservas,
  });

  final String id;
  final String categoria;
  final String descripcion;
  final int cantidad;
  final String unidad;
  final String prioridad;
  final String estado;
  final List<ReservaDeseo> reservas;

  factory DeseoPropio.fromJson(Map<String, dynamic> json) {
    return DeseoPropio(
      id: _texto(json['id']),
      categoria: _texto(json['categoria']),
      descripcion: _texto(json['descripcion']),
      cantidad: _entero(json['cantidad']),
      unidad: _texto(json['unidad']),
      prioridad: _texto(json['prioridad']),
      estado: _texto(json['estado']),
      reservas: _lista(json['reservas']).map(ReservaDeseo.fromJson).toList(),
    );
  }
}

class SesionAuth {
  const SesionAuth({required this.usuario, this.token});

  final Usuario usuario;
  final String? token;

  factory SesionAuth.fromJson(Map<String, dynamic> json) {
    final u = _mapa(json['usuario']);
    if (u == null) {
      throw const FormatException('La API no devolvió la sesión.');
    }
    return SesionAuth(
      usuario: Usuario.fromJson(u),
      token: _textoOpcional(json['token']),
    );
  }
}

int _entero(Object? valor) {
  if (valor is int) return valor;
  if (valor is num) return valor.toInt();
  if (valor is String) return int.tryParse(valor) ?? 0;
  return 0;
}

bool _bool(Object? valor) {
  if (valor is bool) return valor;
  if (valor == 1 || valor == '1' || valor == 'true') return true;
  return false;
}

String _texto(Object? valor) {
  if (valor == null) return '';
  return valor.toString();
}

String? _textoOpcional(Object? valor) {
  if (valor == null) return null;
  final t = valor.toString().trim();
  return t.isEmpty ? null : t;
}

Map<String, dynamic>? _mapa(Object? valor) {
  if (valor is Map<String, dynamic>) return valor;
  if (valor is Map) return Map<String, dynamic>.from(valor);
  return null;
}

List<Map<String, dynamic>> _lista(Object? valor) {
  if (valor is! List) return const [];
  return valor.map(_mapa).whereType<Map<String, dynamic>>().toList();
}
