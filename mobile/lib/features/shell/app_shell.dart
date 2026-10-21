import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    final errorArranque = ref.watch(
      sesionProvider.select((a) => a.valueOrNull?.errorArranque),
    );
    final loc = GoRouterState.of(context).uri.path;
    final destinos = destinosRol(usuario);
    final idx = destinos.indexWhere((d) => loc == d.ruta || loc.startsWith('${d.ruta}/'));
    final seleccionado = idx >= 0 ? idx : 0;
    final estrecho = MediaQuery.sizeOf(context).width < 400;

    return GestureDetector(
      onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
      child: Scaffold(
        resizeToAvoidBottomInset: true,
        appBar: AppBar(
          title: Semantics(
            header: true,
            child: const Text(nombreMarca),
          ),
          actions: [
            IconButton(
              tooltip: Theme.of(context).brightness == Brightness.dark
                  ? 'Cambiar a modo claro'
                  : 'Cambiar a modo oscuro',
              onPressed: () {
                ref.read(temaControladorProvider).alternar(
                      MediaQuery.platformBrightnessOf(context),
                    );
              },
              icon: Icon(
                Theme.of(context).brightness == Brightness.dark
                    ? Icons.wb_sunny_outlined
                    : Icons.dark_mode_outlined,
              ),
            ),
            if (usuario != null)
              IconButton(
                tooltip: 'Cerrar sesión',
                onPressed: () => ref.read(sesionProvider.notifier).salir(),
                icon: const Icon(Icons.logout),
              ),
          ],
        ),
        body: SafeArea(
          top: false,
          bottom: false,
          child: Column(
            children: [
              if (errorArranque != null)
                Material(
                  color: Theme.of(context).colorScheme.errorContainer,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            errorArranque,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onErrorContainer,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => ref.read(sesionProvider.notifier).reintentar(),
                          child: const Text('Reintentar'),
                        ),
                        TextButton(
                          onPressed: () => cambiarUrlApi(context, ref),
                          child: const Text('API'),
                        ),
                      ],
                    ),
                  ),
                ),
              Expanded(child: child),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: seleccionado.clamp(0, destinos.length - 1),
          labelBehavior: destinos.length > 4 || estrecho
              ? NavigationDestinationLabelBehavior.onlyShowSelected
              : NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (i) {
            context.go(destinos[i].ruta);
          },
          destinations: [
            for (final d in destinos)
              NavigationDestination(
                icon: d.esAvatar && usuario != null
                    ? AvatarCuenta(nombre: usuario.nombre, fotoUrl: usuario.fotoUrl, lado: 28)
                    : Icon(d.icono),
                selectedIcon: d.esAvatar && usuario != null
                    ? AvatarCuenta(nombre: usuario.nombre, fotoUrl: usuario.fotoUrl, lado: 28)
                    : Icon(d.iconoSeleccionado ?? d.icono),
                label: d.etiqueta,
              ),
          ],
        ),
      ),
    );
  }
}

List<DestinoNav> destinosRol(Usuario? usuario) {
  if (usuario == null) {
    return const [
      DestinoNav('/inicio', 'Inicio', Icons.home_outlined, iconoSeleccionado: Icons.home),
      DestinoNav('/catalogo', 'Catálogo', Icons.pets_outlined, iconoSeleccionado: Icons.pets),
      DestinoNav('/entrar', 'Entrar', Icons.login_outlined, iconoSeleccionado: Icons.login),
      DestinoNav('/registro', 'Crear', Icons.person_add_outlined, iconoSeleccionado: Icons.person_add),
    ];
  }
  return [
    if (usuario.esDonante)
      const DestinoNav(
        '/necesidades',
        'Necesidades',
        Icons.volunteer_activism_outlined,
        iconoSeleccionado: Icons.volunteer_activism,
      ),
    const DestinoNav('/catalogo', 'Catálogo', Icons.pets_outlined, iconoSeleccionado: Icons.pets),
    if (usuario.esAdoptante)
      const DestinoNav(
        '/mis-postulaciones',
        'Postulaciones',
        Icons.assignment_outlined,
        iconoSeleccionado: Icons.assignment,
      ),
    if (usuario.esEntidad && usuario.puedePublicar) ...const [
      DestinoNav(
        '/postulaciones',
        'Postulaciones',
        Icons.assignment_outlined,
        iconoSeleccionado: Icons.assignment,
      ),
      DestinoNav('/deseos', 'Deseos', Icons.inventory_2_outlined, iconoSeleccionado: Icons.inventory_2),
      DestinoNav('/alta', 'Publicar', Icons.add_circle_outline, iconoSeleccionado: Icons.add_circle),
    ],
    if (usuario.esValidador)
      const DestinoNav('/cola', 'Cola', Icons.fact_check_outlined, iconoSeleccionado: Icons.fact_check),
    const DestinoNav(
      '/cuenta',
      'Cuenta',
      Icons.account_circle_outlined,
      iconoSeleccionado: Icons.account_circle,
      esAvatar: true,
    ),
  ];
}

class DestinoNav {
  const DestinoNav(
    this.ruta,
    this.etiqueta,
    this.icono, {
    this.iconoSeleccionado,
    this.esAvatar = false,
  });

  final String ruta;
  final String etiqueta;
  final IconData icono;
  final IconData? iconoSeleccionado;
  final bool esAvatar;
}
