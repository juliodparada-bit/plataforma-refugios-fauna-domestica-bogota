import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/tema/tema.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class PerfilEntidadPage extends ConsumerStatefulWidget {
  const PerfilEntidadPage({super.key, required this.id});

  final String id;

  @override
  ConsumerState<PerfilEntidadPage> createState() => _PerfilEntidadPageState();
}

class _PerfilEntidadPageState extends ConsumerState<PerfilEntidadPage> {
  final _peticion = TokenPagina();
  PerfilEntidadPublico? _data;
  String? _error;
  String? _ok;

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
      _data = null;
      _error = null;
    });
    try {
      final perfil = await ref.read(apiProvider).entidadPublica(
            widget.id,
            cancelar: _peticion.renovar(),
          );
      if (mounted) setState(() => _data = perfil);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _reservar(String itemId, String contacto) async {
    final error = validarContactoEntrega(contacto);
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    setState(() => _error = null);
    try {
      await ref.read(apiProvider).reservarDeseo(itemId, contacto);
      if (mounted) {
        setState(() => _ok = 'Ítem reservado. Coordina la entrega por WhatsApp; no hay recaudo.');
      }
      await _cargar();
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    final atras = usuario?.esDonante == true ? '← Necesidades' : '← Catálogo';
    final rutaAtras = usuario?.esDonante == true ? '/necesidades' : '/catalogo';
    if (_data == null) {
      return ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          EnlaceTexto(texto: atras, onTap: () => context.go(rutaAtras)),
          if (_error != null)
            EstadoError(mensaje: _error!, alReintentar: _cargar)
          else
            const EstadoCarga(),
        ],
      );
    }
    final d = _data!;
    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        EnlaceTexto(texto: atras, onTap: () => context.go(rutaAtras)),
        Text('Refugio con sello a la vista', style: estiloLeyenda(Theme.of(context).colorScheme.secondary)),
        Text(d.nombre, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [ChipSello(valor: d.badge), Text(d.localidad)],
        ),
        const SizedBox(height: 8),
        const Text(
          'Un ítem cubierto aquí es un cupo que puede abrirse. Sin recaudo y sin datos del donante en la bitácora.',
        ),
        const SizedBox(height: 16),
        Text('Animales publicados', style: Theme.of(context).textTheme.titleLarge),
        if (d.animales.isEmpty) const Text('No hay animales publicados ahora.'),
        for (final a in d.animales)
          Card(
            margin: const EdgeInsets.only(top: 10),
            child: ListTile(
              minVerticalPadding: 12,
              leading: SizedBox(width: 56, height: 56, child: ImagenRemota(ruta: a.fotoUrl, altura: 56)),
              title: Text(a.nombre, maxLines: 1, overflow: TextOverflow.ellipsis),
              subtitle: Text('${etiquetaEspecie(a.especie)} · ${a.localidad}'),
              onTap: () => context.push('/animal/${a.id}'),
            ),
          ),
        const SizedBox(height: 16),
        Text('Insumos cubiertos', style: Theme.of(context).textTheme.titleLarge),
        if (d.bitacora.isEmpty) const Text('Aún no hay ítems cubiertos.'),
        for (final b in d.bitacora)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(b.descripcion),
            subtitle: Text('${b.cantidad} ${b.unidad} · ${fechaCorta(b.cubiertoEn)}'),
          ),
        const SizedBox(height: 12),
        Text('Lista de deseos', style: Theme.of(context).textTheme.titleLarge),
        if (_ok != null) AvisoCaja(texto: _ok!),
        if (_error != null) AvisoMensaje(texto: _error!, error: true),
        if (d.deseos.isEmpty) const Text('Este hogar no tiene ítems pendientes ahora.'),
        for (final deseo in d.deseos) _DeseoTile(deseo: deseo, usuarioRol: usuario?.rol, onReservar: _reservar),
      ],
    );
  }
}

class _DeseoTile extends StatefulWidget {
  const _DeseoTile({required this.deseo, required this.usuarioRol, required this.onReservar});

  final DeseoPublico deseo;
  final String? usuarioRol;
  final Future<void> Function(String id, String contacto) onReservar;

  @override
  State<_DeseoTile> createState() => _DeseoTileState();
}

class _DeseoTileState extends State<_DeseoTile> {
  final _contacto = TextEditingController();
  String? _errorCampo;

  @override
  void dispose() {
    _contacto.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.deseo;
    return Card(
      margin: const EdgeInsets.only(top: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              '${etiquetaCategoria(d.categoria)} · ${etiquetaPrioridad(d.prioridad)}',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            Text('${d.descripcion} · ${d.cantidad} ${d.unidad} · ${d.estado}'),
            if (d.estado == 'pendiente' && widget.usuarioRol == 'donante') ...[
              const SizedBox(height: 8),
              TextField(
                controller: _contacto,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: InputDecoration(
                  labelText: 'Contacto para entregar (no es público)',
                  errorText: _errorCampo,
                ),
              ),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () {
                  final c = _contacto.text.trim();
                  final err = validarContactoEntrega(c);
                  setState(() => _errorCampo = err);
                  if (err != null) return;
                  widget.onReservar(d.id, c);
                },
                child: const Text('Reservar este ítem'),
              ),
              const Text(
                'Este contacto solo lo ve la entidad. Tienes 7 días. No hay recaudo ni Nequi.',
              ),
            ],
            if (d.estado == 'pendiente' && widget.usuarioRol == null)
              FilledButton(
                onPressed: () => context.go('/entrar'),
                child: const Text('Entrar para reservar'),
              ),
          ],
        ),
      ),
    );
  }
}
