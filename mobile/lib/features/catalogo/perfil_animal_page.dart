import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/tema/tema.dart';
import '../../core/widgets/comun.dart';

class PerfilAnimalPage extends ConsumerStatefulWidget {
  const PerfilAnimalPage({super.key, required this.id});

  final String id;

  @override
  ConsumerState<PerfilAnimalPage> createState() => _PerfilAnimalPageState();
}

class _PerfilAnimalPageState extends ConsumerState<PerfilAnimalPage> {
  final _peticion = TokenPagina();
  DetalleAnimal? _animal;
  String? _error;
  String? _ok;
  bool _enviando = false;
  bool _mayor = false;
  bool _bogota = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _cargar());
  }

  @override
  void dispose() {
    _peticion.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    setState(() {
      _animal = null;
      _error = null;
      _ok = null;
    });
    try {
      final detalle = await ref.read(apiProvider).animal(
            widget.id,
            cancelar: _peticion.renovar(),
          );
      if (mounted) setState(() => _animal = detalle);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _postular() async {
    if (!_mayor || !_bogota) {
      setState(() => _error = 'Debes confirmar que eres mayor de edad y vives en Bogotá.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
    });
    try {
      await ref.read(apiProvider).postular(widget.id, mayorDeEdad: _mayor, viveEnBogota: _bogota);
      if (mounted) {
        setState(() {
          _ok =
              'Tu postulación voló. El refugio la recibirá con tu historia y tu puntaje. Hiciste algo hermoso hoy.';
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    if (_animal == null && _error == null) return const EstadoCarga();
    if (_animal == null) {
      return ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          EnlaceTexto(texto: '← Catálogo', onTap: () => context.go('/catalogo')),
          EstadoError(mensaje: _error ?? 'No encontré el perfil.', alReintentar: _cargar),
        ],
      );
    }
    final a = _animal!;
    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        EnlaceTexto(texto: '← Catálogo', onTap: () => context.go('/catalogo')),
        if (a.fotos.isNotEmpty)
          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: ImagenRemota(ruta: a.fotos.first.url, altura: 240),
          ),
        const SizedBox(height: 12),
        Text(
          '${etiquetaEspecie(a.especie)} · ${a.localidad}',
          style: estiloLeyenda(Theme.of(context).colorScheme.secondary),
        ),
        Text(a.nombre, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        const Text('Historia primero. La raza, si aparece, va al final.'),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (a.edadAprox.isNotEmpty) Chip(label: Text(a.edadAprox)),
            if (a.talla.isNotEmpty) Chip(label: Text(etiquetaTalla(a.talla))),
            if (a.sexo.isNotEmpty) Chip(label: Text(a.sexo)),
            if (a.energia.isNotEmpty) Chip(label: Text('Energía ${a.energia}')),
            if (a.necesidadEspecial) const Chip(label: Text('Necesidad especial')),
          ],
        ),
        EnlaceTexto(
          texto: '${etiquetaSello(a.entidad.badge)} ${a.entidad.nombre} · ${a.entidad.localidad}',
          onTap: () => context.push('/entidad/${a.entidad.id}'),
        ),
        const SizedBox(height: 8),
        Text('Su historia', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 6),
        Text(a.historia, style: estiloHistoria(Theme.of(context).colorScheme.onSurface)),
        const SizedBox(height: 16),
        Text('¿Cómo es vivir juntos?', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 6),
        Text(
          '${a.conviveNinos ? 'Ama a los niños.' : 'Prefiere adultos o adolescentes.'} '
          '${a.conviveOtrosAnimales ? 'Convive bien con otros animales.' : 'Prefiere ser el único peludo en casa.'} '
          '${a.raza == null || a.raza!.isEmpty ? '' : 'Su raza es ${a.raza}, aunque eso dice poco de su corazón.'}',
        ),
        if (usuario?.esAdoptante == true && a.puntaje != null) ...[
          const SizedBox(height: 16),
          BarraPuntaje(puntaje: a.puntaje!, frase: a.fraseExplicable),
        ],
        if (_ok != null) ...[const SizedBox(height: 12), AvisoCaja(texto: _ok!)],
        if (_error != null) AvisoMensaje(texto: _error!, error: true),
        if (a.estado == 'publicado') ...[
          const SizedBox(height: 16),
          if (usuario == null)
            FilledButton(
              onPressed: () => context.go('/entrar'),
              child: const Text('Entrar y dar el primer paso 🐾'),
            ),
          if (usuario?.esAdoptante == true && !a.tienePerfil)
            FilledButton(
              onPressed: () => context.go('/cuestionario'),
              child: const Text('Cuéntanos cómo es tu hogar (5 preguntas)'),
            ),
          if (usuario?.esAdoptante == true && a.tienePerfil && _ok == null) ...[
            CheckboxListTile(
              value: _mayor,
              onChanged: (v) => setState(() => _mayor = v ?? false),
              title: const Text('Soy mayor de edad y tomo esta decisión con responsabilidad'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              value: _bogota,
              onChanged: (v) => setState(() => _bogota = v ?? false),
              title: const Text('Vivo en Bogotá y puedo coordinar la entrega'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            FilledButton(
              onPressed: _enviando || !_mayor || !_bogota ? null : _postular,
              child: Text(_enviando ? 'Enviando tu corazón…' : 'Postularme — quiero que llegue a casa'),
            ),
            const SizedBox(height: 8),
            const Text(
              'El refugio verá tu puntaje y tus respuestas. Tu correo nunca aparece en el catálogo.',
            ),
          ],
        ],
      ],
    );
  }
}
