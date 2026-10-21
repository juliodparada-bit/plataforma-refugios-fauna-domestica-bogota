import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/imagen.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class DeseosPage extends ConsumerStatefulWidget {
  const DeseosPage({super.key});

  @override
  ConsumerState<DeseosPage> createState() => _DeseosPageState();
}

class _DeseosPageState extends ConsumerState<DeseosPage> {
  final _peticion = TokenPagina();
  final _form = GlobalKey<FormState>();
  List<DeseoPropio> _items = const [];
  String? _error;
  String? _ok;
  final _descripcion = TextEditingController();
  final _unidad = TextEditingController(text: 'bulto');
  final _cantidad = TextEditingController(text: '1');
  String _categoria = 'alimento';
  String _prioridad = 'alta';
  bool _enviando = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _cargar());
  }

  @override
  void dispose() {
    _peticion.dispose();
    _descripcion.dispose();
    _unidad.dispose();
    _cantidad.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    try {
      final lista = await ref.read(apiProvider).misDeseos(cancelar: _peticion.renovar());
      if (mounted) setState(() => _items = lista);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _publicar() async {
    if (!_form.currentState!.validate()) return;
    final n = cantidadEntera(_cantidad.text);
    if (n == null) {
      setState(() => _error = 'La cantidad debe ser un entero de 1 o más.');
      return;
    }
    setState(() {
      _error = null;
      _enviando = true;
    });
    try {
      await ref.read(apiProvider).publicarDeseo(
            categoria: _categoria,
            descripcion: _descripcion.text.trim(),
            cantidad: n,
            unidad: _unidad.text.trim(),
            prioridad: _prioridad,
          );
      _descripcion.clear();
      _cantidad.text = '1';
      if (mounted) setState(() => _ok = 'Ítem publicado. No hay recaudo.');
      await _cargar();
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  Future<void> _confirmar(String reservaId, bool check, XFile? foto) async {
    try {
      if (foto != null) await asegurarPesoFoto(foto);
      await ref.read(apiProvider).confirmarReserva(
            reservaId,
            checkRecibido: check,
            rutaFoto: foto?.path,
            nombreFoto: foto?.name,
          );
      if (mounted) {
        setState(() => _ok = 'Ítem cubierto. Sale en la bitácora pública sin datos del donante.');
      }
      await _cargar();
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    if (usuario == null || !usuario.puedePublicar) {
      return HojaPagina(
        kicker: 'Entidad',
        titulo: 'Lista de deseos',
        proposito: 'Alimento, medicina o aseo. Sin recaudo ni Nequi.',
        hijo: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
            const AvisoCaja(texto: 'Aún no puedes publicar ítems: falta la verificación.'),
          ],
        ),
      );
    }
    return HojaPagina(
      kicker: 'Entidad',
      titulo: 'Lista de deseos',
      proposito: 'Alimento, medicina o aseo. Sin recaudo ni Nequi.',
      hijo: Form(
        key: _form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
            if (_ok != null) AvisoCaja(texto: _ok!),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Categoría',
              valor: _categoria,
              items: [
                itemLista('alimento', 'Alimento'),
                itemLista('medicina', 'Medicina'),
                itemLista('aseo', 'Aseo'),
              ],
              onChanged: (v) => setState(() => _categoria = v ?? 'alimento'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _descripcion,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Descripción'),
              validator: validarDescripcionDeseo,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _cantidad,
              keyboardType: TextInputType.number,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Cantidad'),
              validator: (v) => cantidadEntera(v) == null ? 'Indica una cantidad de 1 o más.' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _unidad,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Unidad'),
              validator: validarUnidad,
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Prioridad',
              valor: _prioridad,
              items: [
                itemLista('alta', 'Alta'),
                itemLista('media', 'Media'),
                itemLista('baja', 'Baja'),
              ],
              onChanged: (v) => setState(() => _prioridad = v ?? 'alta'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _enviando ? null : _publicar,
              child: Text(_enviando ? 'Publicando…' : 'Publicar ítem'),
            ),
            if (_error != null) AvisoMensaje(texto: _error!, error: true),
            if (_items.isEmpty)
              const EstadoVacio(
                icono: '🌾',
                titulo: 'Aún no hay ítems',
                cuerpo: 'Publica alimento, medicina o aseo. Sin recaudo ni Nequi.',
              ),
            for (final i in _items) _ItemDeseo(item: i, onConfirmar: _confirmar),
          ],
        ),
      ),
    );
  }
}

class _ItemDeseo extends StatefulWidget {
  const _ItemDeseo({required this.item, required this.onConfirmar});

  final DeseoPropio item;
  final Future<void> Function(String reservaId, bool check, XFile? foto) onConfirmar;

  @override
  State<_ItemDeseo> createState() => _ItemDeseoState();
}

class _ItemDeseoState extends State<_ItemDeseo> {
  bool _check = false;
  XFile? _foto;

  @override
  Widget build(BuildContext context) {
    final i = widget.item;
    final reserva = i.reservas.isEmpty ? null : i.reservas.first;
    return Card(
      margin: const EdgeInsets.only(top: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('${i.descripcion} · ${i.estado}', style: const TextStyle(fontWeight: FontWeight.w700)),
            Text('${i.cantidad} ${i.unidad} · ${etiquetaCategoria(i.categoria)} · ${etiquetaPrioridad(i.prioridad)}'),
            if (reserva?.estado == 'reservado') ...[
              Text('Contacto (solo tú lo ves): ${reserva!.contactoEntrega}'),
              CheckboxListTile(
                value: _check,
                onChanged: (v) => setState(() => _check = v ?? false),
                title: const Text('Recibido'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
              ),
              OutlinedButton(
                onPressed: () async {
                  final f = await elegirFotoGaleria();
                  if (f != null) setState(() => _foto = f);
                },
                child: Text(_foto == null ? 'Foto (opcional)' : _foto!.name),
              ),
              FilledButton(
                onPressed: () => widget.onConfirmar(reserva.id, _check, _foto),
                child: const Text('Confirmar cobertura'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
