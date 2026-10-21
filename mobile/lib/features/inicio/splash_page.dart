import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/etiquetas.dart';
import '../../core/providers.dart';
import '../../core/tema/tema.dart';
import '../../core/widgets/comun.dart';

class SplashPage extends ConsumerWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(sesionProvider);
    final error = async.valueOrNull?.errorArranque;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(nombreMarca, style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 8),
                Text(eslogan, style: estiloLeyenda(Theme.of(context).colorScheme.secondary)),
                const SizedBox(height: 32),
                if (error != null)
                  EstadoError(
                    mensaje: error,
                    permitirCambiarApi: true,
                    alReintentar: () => ref.read(sesionProvider.notifier).reintentar(),
                  )
                else
                  const EstadoCarga(mensaje: 'Abriendo tu sesión…'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
