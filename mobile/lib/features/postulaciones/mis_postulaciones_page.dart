import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class MisPostulacionesPage extends ConsumerStatefulWidget {
  const MisPostulacionesPage({super.key});

  @override
  ConsumerState<MisPostulacionesPage> createState() => _MisPostulacionesPageState();
}

class _MisPostulacionesPageState extends ConsumerState<MisPostulacionesPage> {
  final _peticion = TokenPagina();
  List<PostulacionMia> _filas = const [];
  String? _error;
  bool _cargando = true;

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
      _cargando = true;
      _error = null;
    });
    try {
      final lista = await ref.read(apiProvider).misPostulaciones(cancelar: _peticion.renovar());
      if (mounted) setState(() => _filas = lista);
    } on PeticionCancelada {
      return;
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return HojaPagina(
      kicker: 'Adoptante',
      titulo: 'Mis postulaciones',
      proposito: 'El estado de lo que ya enviaste al refugio.',
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
          if (_error != null) EstadoError(mensaje: _error!, alReintentar: _cargar),
          if (_cargando) const EstadoCarga(),
          if (!_cargando && _filas.isEmpty && _error == null)
            const EstadoVacio(
              titulo: 'Aún no te has postulado',
              cuerpo: 'Elige una historia en el catálogo cuando quieras dar el paso.',
            ),
          for (final p in _filas)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                minVerticalPadding: 12,
                title: Text(p.animalNombre, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  '${etiquetaEstadoPostulacion(p.estado)} · ${p.puntaje} · animal ${etiquetaEstadoAnimal(p.animalEstado)}\n${p.fraseExplicable}',
                ),
                isThreeLine: true,
                onTap: p.animalId.isEmpty ? null : () => context.push('/animal/${p.animalId}'),
              ),
            ),
        ],
      ),
    );
  }
}
