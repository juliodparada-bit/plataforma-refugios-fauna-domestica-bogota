import 'package:flutter_test/flutter_test.dart';
import 'package:mestizo/core/api/error_api.dart';
import 'package:mestizo/core/api/token.dart';
import 'package:mestizo/core/config.dart';
import 'package:mestizo/core/etiquetas.dart';
import 'package:mestizo/core/modelos/modelos.dart';
import 'package:mestizo/core/validacion.dart';

void main() {
  test('parsea un usuario como lo entrega la API', () {
    final u = Usuario.fromJson({
      'id': 'u1',
      'nombre': 'Luna Pilot',
      'correo': 'adoptante.ejemplo@local.test',
      'rol': 'adoptante',
      'localidadId': 'loc1',
      'localidad': 'Teusaquillo',
      'fotoUrl': '/api/auth/yo/foto?t=1',
      'consentimientoEn': '2026-01-01T00:00:00.000Z',
      'tienePerfilAdoptante': true,
      'demo': true,
      'entidad': null,
    });
    expect(u.esAdoptante, isTrue);
    expect(u.puedePublicar, isFalse);
    expect(urlMedio(u.fotoUrl).contains('/auth/yo/foto'), isTrue);
    expect(etiquetaRol(u.rol), 'Adoptante');
  });

  test('no se estrella si la API omite campos', () {
    final u = Usuario.fromJson({
      'id': null,
      'nombre': null,
      'rol': 'entidad',
      'entidad': {'puedePublicar': 'true'},
    });
    expect(u.id, '');
    expect(u.nombre, '');
    expect(u.correo, '');
    expect(u.esEntidad, isTrue);
    expect(u.puedePublicar, isTrue);
  });

  test('urlMedio quita el prefijo /api del JSON de la web', () {
    expect(urlMedio('/api/animales/1/fotos/2').endsWith('/animales/1/fotos/2'), isTrue);
  });

  test('tokenDeSesion prefiere el JWT del cuerpo y cae a la cookie sid', () {
    expect(tokenDeSesion({'token': 'abc.def'}, sidCookie: 'cookie'), 'abc.def');
    expect(tokenDeSesion({'token': ''}, sidCookie: 'sid-jwt'), 'sid-jwt');
    expect(tokenDeSesion(null, sidCookie: null), isNull);
  });

  test('sidDeCabeceras lee Set-Cookie sid', () {
    expect(
      sidDeCabeceras({
        'set-cookie': ['sid=hola%20mundo; Path=/; HttpOnly', 'otro=1'],
      }),
      'hola mundo',
    );
    expect(sidDeCabeceras({'set-cookie': ['tema=oscuro']}), isNull);
  });

  test('mensajeDeCuerpo resume listas, ignora HTML y usa fallback', () {
    expect(mensajeDeCuerpo({'message': ['A', 'B']}, 'x'), 'A B');
    expect(mensajeDeCuerpo({'message': 'Correo o contraseña incorrectos.'}, 'x'),
        'Correo o contraseña incorrectos.');
    expect(mensajeDeCuerpo('<html>error</html>', 'La API no responde.'), 'La API no responde.');
    expect(mensajeDeCuerpo(null, 'fallback'), 'fallback');
  });

  test('validación de formularios coincide con los DTO', () {
    expect(validarCorreo('mal'), isNotNull);
    expect(validarCorreo('a@b.co'), isNull);
    expect(validarContrasenaNueva('corta'), isNotNull);
    expect(validarHistoria('muy corta'), isNotNull);
    expect(validarContactoEntrega('1234'), isNotNull);
    expect(validarContactoEntrega('3001234567'), isNull);
    expect(cantidadEntera('0'), isNull);
    expect(cantidadEntera('3'), 3);
  });
}
