import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/etiquetas.dart';
import 'core/providers.dart';
import 'core/router.dart';
import 'core/tema/tema.dart';

class MestizoApp extends ConsumerWidget {
  const MestizoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final modo = ref.watch(temaControladorProvider.select((t) => t.modo));
    return MaterialApp.router(
      title: '$nombreMarca — $eslogan',
      debugShowCheckedModeBanner: false,
      theme: temaClaro(),
      darkTheme: temaOscuro(),
      themeMode: modo,
      routerConfig: router,
    );
  }
}
