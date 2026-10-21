import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/cliente.dart';
import '../config.dart';
import '../etiquetas.dart';
import '../providers.dart';
import '../tema/tema.dart';

export '../api/error_api.dart' show ErrorApi, PeticionCancelada, textoError;

class HojaPagina extends StatelessWidget {
  const HojaPagina({
    super.key,
    required this.kicker,
    required this.titulo,
    required this.proposito,
    required this.hijo,
    this.acciones,
    this.padding = const EdgeInsets.fromLTRB(20, 16, 20, 32),
  });

  final String kicker;
  final String titulo;
  final String proposito;
  final Widget hijo;
  final Widget? acciones;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final tema = Theme.of(context);
    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: padding,
      children: [
        Semantics(
          header: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(kicker.toUpperCase(), style: estiloLeyenda(tema.colorScheme.secondary)),
              const SizedBox(height: 6),
              Text(titulo, style: tema.textTheme.headlineMedium),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          proposito,
          style: tema.textTheme.bodyMedium?.copyWith(
            color: tema.colorScheme.onSurfaceVariant,
          ),
        ),
        if (acciones != null) ...[const SizedBox(height: 12), acciones!],
        const SizedBox(height: 20),
        hijo,
      ],
    );
  }
}

class EstadoCarga extends StatelessWidget {
  const EstadoCarga({super.key, this.mensaje = 'Cargando…'});

  final String mensaje;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: mensaje,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(mensaje),
            ],
          ),
        ),
      ),
    );
  }
}

class EstadoError extends ConsumerWidget {
  const EstadoError({
    super.key,
    required this.mensaje,
    this.alReintentar,
    this.permitirCambiarApi = false,
  });

  final String mensaje;
  final VoidCallback? alReintentar;
  final bool permitirCambiarApi;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final url = ref.watch(apiUrlProvider);
    return Semantics(
      liveRegion: true,
      label: mensaje,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.wifi_off_rounded, size: 40, color: Theme.of(context).colorScheme.error),
            const SizedBox(height: 12),
            Text(
              mensaje,
              textAlign: TextAlign.center,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
            const SizedBox(height: 8),
            Text(
              'API: $url',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (alReintentar != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: alReintentar,
                child: const Text('Reintentar conexión'),
              ),
            ],
            if (permitirCambiarApi) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => cambiarUrlApi(context, ref),
                child: const Text('Cambiar dirección de la API'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

Future<void> cambiarUrlApi(BuildContext context, WidgetRef ref) async {
  final ctrl = TextEditingController(text: ref.read(apiUrlProvider));
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Dirección de la API'),
      content: TextField(
        controller: ctrl,
        keyboardType: TextInputType.url,
        autofillHints: const [AutofillHints.url],
        decoration: const InputDecoration(
          labelText: 'URL',
          hintText: 'http://10.90.41.52:3000',
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Guardar')),
      ],
    ),
  );
  if (ok == true && context.mounted) {
    final valor = ctrl.text.trim();
    if (valor.isEmpty) return;
    await ref.read(sesionProvider.notifier).guardarUrlApi(valor);
  }
}

class EstadoVacio extends StatelessWidget {
  const EstadoVacio({
    super.key,
    required this.titulo,
    required this.cuerpo,
    this.icono = '🐾',
  });

  final String titulo;
  final String cuerpo;
  final String icono;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 8),
      child: Column(
        children: [
          ExcludeSemantics(child: Text(icono, style: const TextStyle(fontSize: 36))),
          const SizedBox(height: 10),
          Text(titulo, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(cuerpo, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class ChipSello extends StatelessWidget {
  const ChipSello({super.key, required this.valor});

  final String valor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        etiquetaSello(valor),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class EtiquetaFlotante extends StatelessWidget {
  const EtiquetaFlotante({super.key, required this.texto});

  final String texto;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        texto,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSecondary,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class BarraPuntaje extends StatelessWidget {
  const BarraPuntaje({super.key, required this.puntaje, this.frase});

  final int puntaje;
  final String? frase;

  @override
  Widget build(BuildContext context) {
    final reducir = MediaQuery.of(context).disableAnimations;
    return Semantics(
      label: 'Afinidad $puntaje de 100',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('$puntaje', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(width: 10),
              Expanded(
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: reducir ? puntaje / 100 : 0, end: puntaje / 100),
                  duration: reducir ? Duration.zero : const Duration(milliseconds: 450),
                  builder: (context, valor, _) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        value: valor.clamp(0, 1),
                        minHeight: 8,
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          if (frase != null && frase!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(frase!, style: estiloLeyenda(Theme.of(context).colorScheme.onSurfaceVariant)),
          ],
        ],
      ),
    );
  }
}

class AvatarCuenta extends ConsumerWidget {
  const AvatarCuenta({
    super.key,
    required this.nombre,
    this.fotoUrl,
    this.lado = 40,
  });

  final String nombre;
  final String? fotoUrl;
  final double lado;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final url = urlMedio(fotoUrl);
    return Semantics(
      label: 'Cuenta de $nombre',
      child: ClipOval(
        child: SizedBox(
          width: lado,
          height: lado,
          child: url.isEmpty
              ? _iniciales(context)
              : ImagenAutenticada(url: url, fallback: _iniciales(context)),
        ),
      ),
    );
  }

  Widget _iniciales(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
      child: Center(
        child: Text(
          iniciales(nombre),
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: lado * 0.36,
          ),
        ),
      ),
    );
  }
}

class ImagenAutenticada extends ConsumerWidget {
  const ImagenAutenticada({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.fallback,
  });

  final String url;
  final BoxFit fit;
  final Widget? fallback;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(bytesImagenProvider(url));
    return async.when(
      data: (bytes) {
        if (bytes.isEmpty) return fallback ?? const ColoredBox(color: Color(0x33A85C52));
        return Image.memory(Uint8List.fromList(bytes), fit: fit, gaplessPlayback: true);
      },
      loading: () => const ColoredBox(color: Color(0x22A85C52)),
      error: (_, __) => fallback ?? const ColoredBox(color: Color(0x33A85C52)),
    );
  }
}

class ImagenRemota extends StatelessWidget {
  const ImagenRemota({
    super.key,
    required this.ruta,
    this.altura,
    this.fit = BoxFit.cover,
  });

  final String? ruta;
  final double? altura;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final url = urlMedio(ruta);
    if (url.isEmpty) {
      return ColoredBox(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: SizedBox(height: altura, width: double.infinity),
      );
    }
    return Image.network(
      url,
      height: altura,
      width: double.infinity,
      fit: fit,
      errorBuilder: (_, __, ___) => ColoredBox(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: SizedBox(height: altura ?? 160, width: double.infinity),
      ),
    );
  }
}

class AvisoCaja extends StatelessWidget {
  const AvisoCaja({super.key, required this.texto});

  final String texto;

  @override
  Widget build(BuildContext context) {
    final oscuro = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: oscuro ? ColoresMestizo.oscuroAviso : ColoresMestizo.claroAviso,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(texto),
    );
  }
}

class EnlaceTexto extends StatelessWidget {
  const EnlaceTexto({super.key, required this.texto, required this.onTap});

  final String texto;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: texto,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 48),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              texto,
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w700,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CampoDesplegable<T> extends StatelessWidget {
  const CampoDesplegable({
    super.key,
    required this.etiqueta,
    required this.valor,
    required this.items,
    required this.onChanged,
    this.validator,
  });

  final String etiqueta;
  final T? valor;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final String? Function(T?)? validator;

  @override
  Widget build(BuildContext context) {
    final existe = items.any((i) => i.value == valor);
    return DropdownButtonFormField<T>(
      initialValue: existe ? valor : null,
      isExpanded: true,
      decoration: InputDecoration(labelText: etiqueta),
      items: items,
      validator: validator,
      onChanged: onChanged,
    );
  }
}

DropdownMenuItem<String> itemLista(String valor, String etiqueta) {
  return DropdownMenuItem(
    value: valor,
    child: Text(etiqueta, maxLines: 1, overflow: TextOverflow.ellipsis),
  );
}

class AvisoMensaje extends StatelessWidget {
  const AvisoMensaje({super.key, required this.texto, this.error = false});

  final String texto;
  final bool error;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Text(
          texto,
          style: TextStyle(
            color: error ? Theme.of(context).colorScheme.error : null,
          ),
        ),
      ),
    );
  }
}

extension ApiEnRef on WidgetRef {
  ApiCliente get api => read(apiProvider);
}
