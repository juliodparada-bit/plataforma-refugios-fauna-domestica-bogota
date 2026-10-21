// ignore_for_file: deprecated_member_use

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/imagen.dart';
import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class VerificacionPage extends ConsumerStatefulWidget {
  const VerificacionPage({super.key});

  @override
  ConsumerState<VerificacionPage> createState() => _VerificacionPageState();
}

class _VerificacionPageState extends ConsumerState<VerificacionPage> {
  final _peticion = TokenPagina();
  final _nombre = TextEditingController();
  String? _localidadId;
  String _nivel = 'nivel_2';
  String? _estado;
  String? _estadoSolicitud;
  String? _motivo;
  bool _puedeEnviar = true;
  bool _enviando = false;
  String? _error;
  final _archivos = <String, XFile>{};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _cargar());
  }

  @override
  void dispose() {
    _peticion.dispose();
    _nombre.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    final usuario = ref.read(sesionProvider).valueOrNull?.usuario;
    _nombre.text = usuario?.entidad?.nombre ?? usuario?.nombre ?? '';
    _localidadId = usuario?.localidadId;
    try {
      final r = await ref.read(apiProvider).miVerificacion(cancelar: _peticion.renovar());
      if (!mounted) return;
      setState(() {
        _estado = r.estadoVerificacion;
        _localidadId = r.localidadId;
        _motivo = r.solicitud?.motivo;
        _estadoSolicitud = r.solicitud?.estado;
        _puedeEnviar = r.solicitud?.estado != 'en_revision';
        if (r.nivelSolicitado == 'nivel_1' || r.nivelSolicitado == 'nivel_2') {
          _nivel = r.nivelSolicitado;
        }
        _nombre.text = r.nombre;
      });
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _elegir(String campo) async {
    final f = await elegirFotoGaleria();
    if (f != null) setState(() => _archivos[campo] = f);
  }

  Future<void> _enviar() async {
    setState(() => _error = null);
    if (validarNombre(_nombre.text) != null) {
      setState(() => _error = 'El nombre del hogar debe tener al menos 2 caracteres.');
      return;
    }
    if (_nivel == 'nivel_1') {
      for (final c in ['rut', 'camara_comercio', 'representacion_legal']) {
        if (_archivos[c] == null) {
          setState(() => _error = 'Nivel 1 exige los tres documentos: RUT, Cámara de Comercio y representación legal.');
          return;
        }
      }
    } else if (_archivos['evidencia_idpyba'] == null && _archivos['carta_comvezcol'] == null) {
      setState(() => _error = 'Nivel 2 exige al menos evidencia IDPYBA o carta COMVEZCOL.');
      return;
    }
    if (_localidadId == null) {
      setState(() => _error = 'Elige una localidad.');
      return;
    }
    setState(() => _enviando = true);
    try {
      for (final f in _archivos.values) {
        await asegurarPesoFoto(f);
      }
      final mapa = <String, dynamic>{
        'nombre': _nombre.text.trim(),
        'localidadId': _localidadId,
        'tipoNivel': _nivel,
      };
      for (final e in _archivos.entries) {
        mapa[e.key] = MultipartFile.fromFileSync(e.value.path, filename: e.value.name);
      }
      await ref.read(apiProvider).enviarVerificacion(FormData.fromMap(mapa));
      await ref.read(sesionProvider.notifier).refrescar();
      await _cargar();
      if (mounted) setState(() => _puedeEnviar = false);
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    final locs = ref.watch(localidadesProvider);
    final verificada = _estado == 'nivel_1' || _estado == 'nivel_2';
    return HojaPagina(
      kicker: 'Entidad',
      titulo: 'Verificación de entidad',
      proposito: 'Los documentos solo los ves tú y el validador. El sello sí es público.',
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
          const AvisoCaja(
            texto:
                'Los documentos (RUT, Cámara, IDPYBA, COMVEZCOL) solo los ves tú y el validador. No salen en el perfil público. El sello sí.',
          ),
          const SizedBox(height: 8),
          Text(
            'Estado actual: ${evidenciaEtiqueta[_estado] ?? _estado ?? usuario?.entidad?.estadoVerificacion ?? '—'}'
            '${_estadoSolicitud != null && _estadoSolicitud != _estado ? ' · solicitud: ${evidenciaEtiqueta[_estadoSolicitud] ?? _estadoSolicitud}' : ''}',
          ),
          if (_motivo != null && !verificada) AvisoCaja(texto: _motivo!),
          if (verificada)
            const AvisoCaja(texto: 'Sello visible. Ya puedes publicar. No hay recaudo de dinero.'),
          if (_puedeEnviar && !verificada) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _nombre,
              textCapitalization: TextCapitalization.words,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Nombre del albergue o hogar de paso'),
            ),
            const SizedBox(height: 12),
            locs.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
              data: (lista) => CampoDesplegable<String>(
                etiqueta: 'Localidad',
                valor: _localidadId,
                items: [for (final l in lista) itemLista(l.id, l.nombre)],
                onChanged: (v) => setState(() => _localidadId = v),
              ),
            ),
            RadioListTile<String>(
              value: 'nivel_2',
              groupValue: _nivel,
              onChanged: (v) => setState(() => _nivel = v!),
              title: const Text('Nivel 2 — independiente'),
            ),
            RadioListTile<String>(
              value: 'nivel_1',
              groupValue: _nivel,
              onChanged: (v) => setState(() => _nivel = v!),
              title: const Text('Nivel 1 — personería jurídica'),
            ),
            if (_nivel == 'nivel_1') ...[
              _archivo('rut', 'RUT (imagen, máx. 5 MB)'),
              _archivo('camara_comercio', 'Cámara de Comercio'),
              _archivo('representacion_legal', 'Representación legal'),
            ] else ...[
              _archivo('evidencia_idpyba', 'Evidencia IDPYBA (opcional si hay carta)'),
              _archivo('carta_comvezcol', 'Carta COMVEZCOL (opcional si hay evidencia IDPYBA)'),
            ],
            if (_error != null) AvisoMensaje(texto: _error!, error: true),
            FilledButton(
              onPressed: _enviando ? null : _enviar,
              child: Text(_enviando ? 'Enviando…' : 'Enviar a revisión'),
            ),
          ],
          if (!_puedeEnviar && !verificada)
            const Text('Tu solicitud está en revisión. El validador te responderá en este mismo tablero.'),
        ],
      ),
    );
  }

  Widget _archivo(String campo, String label) {
    final elegido = _archivos[campo];
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: OutlinedButton(
        onPressed: () => _elegir(campo),
        child: Text(elegido == null ? label : '$label · ${elegido.name}', overflow: TextOverflow.ellipsis),
      ),
    );
  }
}
