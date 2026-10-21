import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/etiquetas.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class CatalogoPage extends ConsumerStatefulWidget {
  const CatalogoPage({super.key});

  @override
  ConsumerState<CatalogoPage> createState() => _CatalogoPageState();
}

class _CatalogoPageState extends ConsumerState<CatalogoPage> {
  final _peticion = TokenPagina();
  String _especie = '';
  String _localidadId = '';
  List<TarjetaAnimal> _items = const [];
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
      final lista = await ref.read(apiProvider).catalogo(
            especie: _especie.isEmpty ? null : _especie,
            localidadId: _localidadId.isEmpty ? null : _localidadId,
            cancelar: _peticion.renovar(),
          );
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
    final locs = ref.watch(localidadesProvider);
    final visitante = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario)) == null;
    return HojaPagina(
      kicker: 'Bogotá urbana · perros y gatos',
      titulo: 'Catálogo',
      proposito: '$esloganHero Filtra por especie y localidad. La raza no es un filtro.',
      acciones: visitante
          ? Wrap(
              spacing: 12,
              runSpacing: 4,
              children: [
                EnlaceTexto(texto: 'Elige cómo participar', onTap: () => context.go('/inicio')),
                EnlaceTexto(texto: 'Crear cuenta', onTap: () => context.go('/registro')),
              ],
            )
          : null,
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Semantics(
            label: 'Filtros del catálogo',
            child: Column(
              children: [
                CampoDesplegable<String>(
                  etiqueta: 'Especie',
                  valor: _especie,
                  items: const [
                    DropdownMenuItem(value: '', child: Text('Todas')),
                    DropdownMenuItem(value: 'canino', child: Text('Canino')),
                    DropdownMenuItem(value: 'felino', child: Text('Felino')),
                  ],
                  onChanged: (v) {
                    setState(() => _especie = v ?? '');
                    _cargar();
                  },
                ),
                const SizedBox(height: 12),
                locs.when(
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const Text('Sin localidades'),
                  data: (lista) => CampoDesplegable<String>(
                    etiqueta: 'Localidad',
                    valor: _localidadId,
                    items: [
                      itemLista('', 'Todas'),
                      for (final l in lista) itemLista(l.id, l.nombre),
                    ],
                    onChanged: (v) {
                      setState(() => _localidadId = v ?? '');
                      _cargar();
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_error != null)
            EstadoError(mensaje: _error!, alReintentar: _cargar)
          else if (_cargando)
            const Column(
              children: [
                LinearProgressIndicator(),
                SizedBox(height: 16),
                _Esqueleto(),
                SizedBox(height: 10),
                _Esqueleto(),
              ],
            )
          else if (_items.isEmpty)
            const EstadoVacio(
              titulo: 'Aún no hay historias publicadas',
              cuerpo: 'Cuando un refugio publique, aparece aquí.',
            )
          else
            for (final a in _items) _Tarjeta(animal: a),
        ],
      ),
    );
  }
}

class _Esqueleto extends StatelessWidget {
  const _Esqueleto();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SizedBox(
        height: 120,
        child: ColoredBox(color: Theme.of(context).colorScheme.surfaceContainerHighest),
      ),
    );
  }
}

class _Tarjeta extends StatelessWidget {
  const _Tarjeta({required this.animal});

  final TarjetaAnimal animal;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push('/animal/${animal.id}'),
          child: Semantics(
            button: true,
            label: 'Ver perfil de ${animal.nombre}',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Stack(
                  children: [
                    ImagenRemota(ruta: animal.fotoUrl, altura: 180),
                    if (animal.necesidadEspecial)
                      const Positioned(
                        left: 10,
                        top: 10,
                        child: EtiquetaFlotante(texto: 'Necesidad especial'),
                      ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        animal.nombre,
                        style: Theme.of(context).textTheme.titleLarge,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${etiquetaEspecie(animal.especie)} · ${animal.localidad}'
                        '${animal.edadAprox.isEmpty ? '' : ' · ${animal.edadAprox}'}',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '«${animal.historia}»',
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontStyle: FontStyle.italic),
                      ),
                      const SizedBox(height: 8),
                      EnlaceTexto(
                        texto: '${etiquetaSello(animal.badge)} ${animal.entidadNombre}',
                        onTap: () => context.push('/entidad/${animal.entidadId}'),
                      ),
                      if (animal.puntaje != null)
                        BarraPuntaje(puntaje: animal.puntaje!, frase: animal.fraseExplicable),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
