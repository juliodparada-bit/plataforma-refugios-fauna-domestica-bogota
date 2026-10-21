import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/tema/tema.dart';
import '../../core/widgets/comun.dart';

class TableroPostulacionesPage extends ConsumerStatefulWidget {
  const TableroPostulacionesPage({super.key});

  @override
  ConsumerState<TableroPostulacionesPage> createState() => _TableroPostulacionesPageState();
}

class _TableroPostulacionesPageState extends ConsumerState<TableroPostulacionesPage> {
  final _peticion = TokenPagina();
  List<TarjetaAnimal> _animales = const [];
  String? _animalId;
  DetallePostulaciones? _detalle;
  String? _error;
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _cargarLista());
  }

  @override
  void dispose() {
    _peticion.dispose();
    super.dispose();
  }

  Future<void> _cargarLista() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final lista = await ref.read(apiProvider).misAnimales(cancelar: _peticion.renovar());
      if (mounted) setState(() => _animales = lista);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _abrir(String id) async {
    setState(() {
      _animalId = id;
      _detalle = null;
    });
    try {
      final d = await ref.read(apiProvider).postulacionesDe(id, cancelar: _peticion.renovar());
      if (mounted) setState(() => _detalle = d);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  Future<void> _resolver(String id, String accion, {String? seguimiento, bool? evidencia}) async {
    setState(() => _error = null);
    try {
      await ref.read(apiProvider).resolverPostulacion(
            id,
            accion: accion,
            seguimientoResultado: seguimiento,
            requiereEvidenciaHogar: evidencia,
          );
      if (_animalId != null) await _abrir(_animalId!);
      await _cargarLista();
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cupos = _animales.where((a) => a.estado == 'adoptado').length;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
        Text('Métrica norte', style: estiloLeyenda(Theme.of(context).colorScheme.secondary)),
        Text('Animales y postulaciones', style: Theme.of(context).textTheme.headlineMedium),
        Text('Cupos liberados (animales en estado adoptado): $cupos'),
        if (_error != null) AvisoMensaje(texto: _error!, error: true),
        if (_animalId == null) ...[
          if (_cargando) const EstadoCarga(),
          if (!_cargando && _animales.isEmpty && _error == null)
            const EstadoVacio(
              titulo: 'Aún no has publicado animales',
              cuerpo: 'Publica una historia desde Cuenta para ver postulaciones aquí.',
            ),
          for (final a in _animales)
            Card(
              margin: const EdgeInsets.only(top: 10),
              child: ListTile(
                minVerticalPadding: 12,
                title: Text(a.nombre, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text('${etiquetaEstadoAnimal(a.estado)} · ${a.postulaciones ?? 0} postulaciones'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _abrir(a.id),
              ),
            ),
        ] else if (_detalle != null) ...[
          EnlaceTexto(
            texto: '← Lista',
            onTap: () => setState(() {
              _animalId = null;
              _detalle = null;
            }),
          ),
          Text(
            '${_detalle!.animalNombre} · ${etiquetaEstadoAnimal(_detalle!.animalEstado)}',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          if (_detalle!.necesidadEspecial)
            const Padding(
              padding: EdgeInsets.only(top: 6),
              child: Text('Necesidad especial — se pide evidencia del hogar'),
            ),
          if (_detalle!.postulaciones.isEmpty)
            const EstadoVacio(
              titulo: 'Nadie se ha postulado aún',
              cuerpo: 'Cuando un adoptante envíe su caso, aparece aquí con el puntaje.',
            ),
          for (final p in _detalle!.postulaciones) _caso(p, _detalle!.animalEstado),
        ] else
          const EstadoCarga(),
      ],
    );
  }

  Widget _caso(PostulacionDeAnimal p, String estadoAnimal) {
    return Card(
      margin: const EdgeInsets.only(top: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${p.adoptanteNombre} · ${p.puntaje}',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            Text(p.fraseExplicable),
            Text('${etiquetaEstadoPostulacion(p.estado)} · ${p.adoptanteLocalidad}'),
            if (p.perfil != null)
              Text(
                'Vivienda: ${p.perfil!.tipoVivienda.replaceAll('_', ' ')} · ${p.perfil!.horasCompania} h · niños: ${p.perfil!.ninosEnHogar ? 'sí' : 'no'} · otros: ${p.perfil!.otrosAnimales} · energía: ${p.perfil!.energiaSostenible}',
              ),
            if (p.requiereEvidenciaHogar) const Text('Pide evidencia extra del hogar'),
            if (p.seguimientoResultado != null) Text('Seguimiento a 15 días: ${p.seguimientoResultado}'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (p.estado == 'enviada') ...[
                  OutlinedButton(onPressed: () => _resolver(p.id, 'abrir'), child: const Text('Abrir caso')),
                  OutlinedButton(
                    onPressed: () => _resolver(p.id, 'abrir', evidencia: true),
                    child: const Text('Pedir evidencia del hogar'),
                  ),
                ],
                if ((p.estado == 'enviada' || p.estado == 'en_revision') && estadoAnimal == 'publicado')
                  FilledButton(onPressed: () => _resolver(p.id, 'preseleccionar'), child: const Text('Preseleccionar')),
                if (p.estado == 'enviada' || p.estado == 'en_revision' || p.estado == 'preseleccionada')
                  OutlinedButton(
                    onPressed: () => _resolver(p.id, 'rechazar'),
                    child: const Text('Rechazar'),
                  ),
                if (p.estado == 'preseleccionada') ...[
                  FilledButton(onPressed: () => _resolver(p.id, 'entregar'), child: const Text('Marcar entrega (cupo +1)')),
                  OutlinedButton(onPressed: () => _resolver(p.id, 'caer'), child: const Text('Caer preselección')),
                ],
                if (p.estado == 'entregada' || p.estado == 'seguimiento')
                  for (final r in const ['estable', 'novedad', 'retorno'])
                    if (p.seguimientoResultado == r)
                      FilledButton(
                        onPressed: () => _resolver(p.id, 'seguimiento', seguimiento: r),
                        child: Text(r),
                      )
                    else
                      OutlinedButton(
                        onPressed: () => _resolver(p.id, 'seguimiento', seguimiento: r),
                        child: Text(r),
                      ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
