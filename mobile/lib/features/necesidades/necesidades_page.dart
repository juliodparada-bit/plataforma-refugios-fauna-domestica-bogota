import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class NecesidadesPage extends ConsumerStatefulWidget {
  const NecesidadesPage({super.key});

  @override
  ConsumerState<NecesidadesPage> createState() => _NecesidadesPageState();
}

class _NecesidadesPageState extends ConsumerState<NecesidadesPage> {
  final _peticion = TokenPagina();
  List<TarjetaEntidad> _items = const [];
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
      final lista = await ref.read(apiProvider).entidades(cancelar: _peticion.renovar());
      if (mounted) setState(() => _items = lista);
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
      kicker: 'Donar en especie',
      titulo: 'Necesidades',
      proposito: 'Hogares con sello e ítems pendientes. Reservas alimento, medicina o aseo. Sin recaudo ni Nequi.',
      hijo: Column(
        children: [
          if (_error != null) EstadoError(mensaje: _error!, alReintentar: _cargar),
          if (_cargando) const EstadoCarga(),
          if (!_cargando && _items.isEmpty && _error == null)
            const EstadoVacio(
              icono: '🌾',
              titulo: 'Aún no hay hogares verificados',
              cuerpo: 'Cuando un refugio tenga sello, su lista de deseos aparece aquí.',
            ),
          for (final e in _items)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        e.nombre,
                        style: Theme.of(context).textTheme.titleLarge,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          ChipSello(valor: e.badge),
                          Text(e.localidad),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (e.pendientes == 0)
                        const Text('Ahora no tiene ítems pendientes. Puedes ver su bitácora.')
                      else ...[
                        Text(e.pendientes == 1
                            ? '1 necesidad pendiente'
                            : '${e.pendientes} necesidades pendientes'),
                        const SizedBox(height: 8),
                        for (final n in e.necesidades)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Text(
                              '${iconoCategoria(n.categoria)} ${etiquetaCategoria(n.categoria)} · ${n.descripcion} (${n.cantidad} ${n.unidad})',
                            ),
                          ),
                      ],
                      const SizedBox(height: 10),
                      FilledButton(
                        onPressed: () => context.push('/entidad/${e.id}'),
                        child: Text(e.pendientes > 0 ? 'Ver y reservar' : 'Ver el hogar'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
