// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class ColaPage extends ConsumerStatefulWidget {
  const ColaPage({super.key, this.idDetalle});

  final String? idDetalle;

  @override
  ConsumerState<ColaPage> createState() => _ColaPageState();
}

class _ColaPageState extends ConsumerState<ColaPage> {
  final _peticion = TokenPagina();
  List<ColaItem> _cola = const [];
  SolicitudVerificacion? _detalle;
  String? _error;
  bool _cargando = true;
  bool _enviando = false;
  String? _listo;
  String _accion = 'aprobar';
  final _motivo = TextEditingController();
  bool _visita = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _cargar();
      if (widget.idDetalle != null) await _abrir(widget.idDetalle!);
    });
  }

  @override
  void dispose() {
    _peticion.dispose();
    _motivo.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final lista = await ref.read(apiProvider).colaVerificacion(cancelar: _peticion.renovar());
      if (mounted) setState(() => _cola = lista);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _abrir(String id) async {
    try {
      final d = await ref.read(apiProvider).detalleVerificacion(id, cancelar: _peticion.renovar());
      if (mounted) {
        setState(() {
          _detalle = d;
          _listo = null;
        });
      }
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _resolver() async {
    final d = _detalle;
    if (d == null) return;
    if ((_accion == 'rechazar' || _accion == 'complemento') && _motivo.text.trim().isEmpty) {
      setState(() => _error = 'El motivo es obligatorio para rechazar o pedir complemento.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
    });
    try {
      await ref.read(apiProvider).resolverVerificacion(
            d.id,
            accion: _accion,
            motivo: _motivo.text.trim().isEmpty ? null : _motivo.text.trim(),
            visitaNecesaria: _visita,
          );
      if (mounted) {
        setState(() {
          _listo = _accion == 'aprobar'
              ? 'Aprobada. El sello queda visible. No se habilitó recaudo (este prototipo no recauda dinero).'
              : 'Respuesta registrada.';
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
    if (_detalle != null) return _detalleVista();
    return HojaPagina(
      kicker: 'Validador',
      titulo: 'Cola de verificación',
      proposito: 'Evidencias pendientes: aprobar, rechazar o pedir complemento.',
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
          if (_error != null) EstadoError(mensaje: _error!, alReintentar: _cargar),
          if (_cargando) const EstadoCarga(),
          if (!_cargando && _cola.isEmpty && _error == null)
            const EstadoVacio(
              icono: '✅',
              titulo: 'No hay solicitudes pendientes',
              cuerpo: 'Cuando un hogar envíe evidencias, aparecen aquí.',
            ),
          for (final item in _cola)
            Card(
              margin: const EdgeInsets.only(top: 10),
              child: ListTile(
                minVerticalPadding: 12,
                title: Text(item.entidadNombre, maxLines: 2, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  '${evidenciaEtiqueta[item.tipoNivel] ?? item.tipoNivel} · ${item.localidad} · ${evidenciaEtiqueta[item.estado] ?? item.estado}\nEvidencias: ${item.evidencias.length} archivo(s)',
                ),
                isThreeLine: true,
                onTap: () => _abrir(item.id),
              ),
            ),
        ],
      ),
    );
  }

  Widget _detalleVista() {
    final d = _detalle!;
    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        EnlaceTexto(
          texto: '← Cola',
          onTap: () {
            setState(() => _detalle = null);
            _cargar();
          },
        ),
        Text(d.entidadNombre ?? '', style: Theme.of(context).textTheme.headlineMedium),
        Text(
          '${evidenciaEtiqueta[d.tipoNivel] ?? d.tipoNivel} · ${d.entidadLocalidad ?? ''} · ${evidenciaEtiqueta[d.estado] ?? d.estado}',
        ),
        const SizedBox(height: 12),
        Text('Evidencias', style: Theme.of(context).textTheme.titleLarge),
        for (final ev in d.evidencias)
          ListTile(
            contentPadding: EdgeInsets.zero,
            minVerticalPadding: 12,
            title: Text(evidenciaEtiqueta[ev.tipoDocumento] ?? ev.tipoDocumento),
            subtitle: Text('${(ev.pesoBytes / 1024).toStringAsFixed(0)} KB'),
            onTap: () {
              final url = ref.read(apiProvider).urlEvidencia(d.id, ev.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Documento disponible en la API: $url')),
              );
            },
          ),
        if (_listo != null)
          AvisoCaja(texto: _listo!)
        else ...[
          RadioListTile<String>(
            value: 'aprobar',
            groupValue: _accion,
            onChanged: (v) => setState(() => _accion = v!),
            title: const Text('Aprobar este nivel'),
          ),
          RadioListTile<String>(
            value: 'complemento',
            groupValue: _accion,
            onChanged: (v) => setState(() => _accion = v!),
            title: const Text('Pedir complemento'),
          ),
          RadioListTile<String>(
            value: 'rechazar',
            groupValue: _accion,
            onChanged: (v) => setState(() => _accion = v!),
            title: const Text('Rechazar'),
          ),
          TextField(
            controller: _motivo,
            scrollPadding: const EdgeInsets.only(bottom: 120),
            decoration: const InputDecoration(labelText: 'Motivo (obligatorio si rechazas o pides complemento)'),
          ),
          CheckboxListTile(
            value: _visita,
            onChanged: (v) => setState(() => _visita = v ?? false),
            title: const Text('Marcar visita o video (no es obligatorio para aprobar)'),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
          ),
          if (_error != null) AvisoMensaje(texto: _error!, error: true),
          FilledButton(
            onPressed: _enviando ? null : _resolver,
            child: Text(_enviando ? 'Guardando…' : 'Registrar decisión'),
          ),
        ],
      ],
    );
  }
}
