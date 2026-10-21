import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/entrar_page.dart';
import '../features/auth/legal_page.dart';
import '../features/auth/registro_page.dart';
import '../features/catalogo/catalogo_page.dart';
import '../features/catalogo/perfil_animal_page.dart';
import '../features/cuenta/cuenta_page.dart';
import '../features/entidad/alta_animal_page.dart';
import '../features/entidad/deseos_page.dart';
import '../features/entidad/tablero_postulaciones_page.dart';
import '../features/entidad/verificacion_page.dart';
import '../features/inicio/inicio_page.dart';
import '../features/inicio/splash_page.dart';
import '../features/necesidades/necesidades_page.dart';
import '../features/necesidades/perfil_entidad_page.dart';
import '../features/postulaciones/cuestionario_page.dart';
import '../features/postulaciones/mis_postulaciones_page.dart';
import '../features/shell/app_shell.dart';
import '../features/validador/cola_page.dart';
import 'providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = _SesionRefresh(ref);
  ref.onDispose(refresh.dispose);

  final router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: refresh,
    redirect: (context, state) {
      final async = ref.read(sesionProvider);
      final loc = state.matchedLocation;
      final cargando = async.isLoading && !async.hasValue;
      if (cargando) {
        return loc == '/splash' ? null : '/splash';
      }
      final sesion = async.valueOrNull ?? const SesionEstado();
      final usuario = sesion.usuario;
      final publicas = {
        '/splash',
        '/inicio',
        '/entrar',
        '/registro',
        '/catalogo',
        '/legal/terminos',
        '/legal/datos',
      };
      final esPublica = publicas.contains(loc) ||
          loc.startsWith('/animal/') ||
          loc.startsWith('/entidad/');

      if (usuario == null) {
        if (loc == '/splash') return '/inicio';
        if (!esPublica) return '/catalogo';
        return null;
      }

      if (loc == '/splash' || loc == '/inicio') {
        return rutaInicioRol(usuario);
      }
      if (loc == '/entrar' || loc == '/registro') {
        return rutaTrasAuth(usuario);
      }
      if (loc == '/necesidades' && !usuario.esDonante) return '/catalogo';
      if (loc == '/cola' || loc.startsWith('/cola/')) {
        if (!usuario.esValidador) return '/cuenta';
      }
      if (loc == '/verificacion' && !usuario.esEntidad) return '/cuenta';
      if ((loc == '/alta' || loc == '/postulaciones' || loc == '/deseos') &&
          (!usuario.esEntidad || !usuario.puedePublicar)) {
        return '/cuenta';
      }
      if ((loc == '/cuestionario' || loc == '/mis-postulaciones') && !usuario.esAdoptante) {
        return '/cuenta';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(
        path: '/legal/:doc',
        builder: (_, state) => LegalPage(doc: state.pathParameters['doc'] ?? 'terminos'),
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(path: '/inicio', builder: (_, __) => const InicioPage()),
          GoRoute(path: '/entrar', builder: (_, __) => const EntrarPage()),
          GoRoute(
            path: '/registro',
            builder: (_, state) => RegistroPage(rolInicial: state.uri.queryParameters['rol']),
          ),
          GoRoute(path: '/catalogo', builder: (_, __) => const CatalogoPage()),
          GoRoute(
            path: '/animal/:id',
            builder: (_, state) => PerfilAnimalPage(id: state.pathParameters['id']!),
          ),
          GoRoute(
            path: '/entidad/:id',
            builder: (_, state) => PerfilEntidadPage(id: state.pathParameters['id']!),
          ),
          GoRoute(path: '/cuenta', builder: (_, __) => const CuentaPage()),
          GoRoute(path: '/necesidades', builder: (_, __) => const NecesidadesPage()),
          GoRoute(path: '/cuestionario', builder: (_, __) => const CuestionarioPage()),
          GoRoute(path: '/mis-postulaciones', builder: (_, __) => const MisPostulacionesPage()),
          GoRoute(path: '/alta', builder: (_, __) => const AltaAnimalPage()),
          GoRoute(path: '/postulaciones', builder: (_, __) => const TableroPostulacionesPage()),
          GoRoute(path: '/deseos', builder: (_, __) => const DeseosPage()),
          GoRoute(path: '/verificacion', builder: (_, __) => const VerificacionPage()),
          GoRoute(
            path: '/cola',
            builder: (_, __) => const ColaPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) => ColaPage(idDetalle: state.pathParameters['id']),
              ),
            ],
          ),
        ],
      ),
    ],
  );
  return router;
});

class _SesionRefresh extends ChangeNotifier {
  _SesionRefresh(this._ref) {
    _ref.listen<AsyncValue<SesionEstado>>(sesionProvider, (_, __) {
      notifyListeners();
    });
  }

  final Ref _ref;
}
