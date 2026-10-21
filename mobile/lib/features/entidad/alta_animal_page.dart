import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

import '../../core/imagen.dart';
import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class AltaAnimalPage extends ConsumerStatefulWidget {
  const AltaAnimalPage({super.key});

  @override
  ConsumerState<AltaAnimalPage> createState() => _AltaAnimalPageState();
}

class _AltaAnimalPageState extends ConsumerState<AltaAnimalPage> {
  final _form = GlobalKey<FormState>();
  final _nombre = TextEditingController();
  final _historia = TextEditingController();
  final _raza = TextEditingController();
  String _especie = 'canino';
  String _sexo = 'hembra';
  String _talla = 'mediano';
  String _edad = 'joven';
  String _energia = 'media';
  String? _localidadId;
  String _esterilizado = 'ns';
  bool _ninos = false;
  bool _otros = false;
  bool _especial = false;
  XFile? _foto;
  bool _enviando = false;
  String? _error;

  @override
  void dispose() {
    _nombre.dispose();
    _historia.dispose();
    _raza.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_form.currentState!.validate()) return;
    if (_foto == null) {
      setState(() => _error = 'Adjunta al menos una foto.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
    });
    try {
      await asegurarPesoFoto(_foto!);
      final datos = FormData.fromMap({
        'nombre': _nombre.text.trim(),
        'especie': _especie,
        'sexo': _sexo,
        'talla': _talla,
        'edadAprox': _edad,
        'localidadId': _localidadId,
        'energia': _energia,
        'historia': _historia.text.trim(),
        'conviveNinos': _ninos ? 'true' : 'false',
        'conviveOtrosAnimales': _otros ? 'true' : 'false',
        'necesidadEspecial': _especial ? 'true' : 'false',
        'esterilizado': _esterilizado,
        if (_raza.text.trim().isNotEmpty) 'raza': _raza.text.trim(),
        'foto': MultipartFile.fromFileSync(_foto!.path, filename: _foto!.name),
      });
      final animal = await ref.read(apiProvider).publicarAnimal(datos);
      if (mounted) context.go('/animal/${animal.id}');
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
    if (usuario == null || !usuario.puedePublicar) {
      return HojaPagina(
        kicker: 'Entidad',
        titulo: 'Publicar animal',
        proposito: 'Cuenta su historia primero. Un cupo no se abre con una raza en el filtro.',
        hijo: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
            const AvisoCaja(texto: 'Aún no puedes publicar: falta la verificación.'),
          ],
        ),
      );
    }
    return HojaPagina(
      kicker: 'Entidad',
      titulo: 'Publicar animal',
      proposito: 'Cuenta su historia primero. Un cupo no se abre con una raza en el filtro.',
      hijo: Form(
        key: _form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EnlaceTexto(texto: '← Tablero', onTap: () => context.go('/cuenta')),
            const AvisoCaja(
              texto: 'La foto y la historia serán públicas. No subas documentos de identidad ni datos de un adoptante.',
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nombre,
              textCapitalization: TextCapitalization.words,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Nombre'),
              validator: validarNombre,
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Especie',
              valor: _especie,
              items: [itemLista('canino', 'Canino'), itemLista('felino', 'Felino')],
              onChanged: (v) => setState(() => _especie = v ?? 'canino'),
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Sexo',
              valor: _sexo,
              items: [itemLista('hembra', 'Hembra'), itemLista('macho', 'Macho')],
              onChanged: (v) => setState(() => _sexo = v ?? 'hembra'),
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Talla',
              valor: _talla,
              items: [
                itemLista('pequeno', 'Pequeño'),
                itemLista('mediano', 'Mediano'),
                itemLista('grande', 'Grande'),
              ],
              onChanged: (v) => setState(() => _talla = v ?? 'mediano'),
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Edad',
              valor: _edad,
              items: [
                itemLista('cachorro', 'Cachorro'),
                itemLista('joven', 'Joven'),
                itemLista('adulto', 'Adulto'),
                itemLista('senior', 'Senior'),
              ],
              onChanged: (v) => setState(() => _edad = v ?? 'joven'),
            ),
            const SizedBox(height: 12),
            locs.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const Text('No pude cargar las localidades.'),
              data: (lista) => CampoDesplegable<String>(
                etiqueta: 'Localidad',
                valor: _localidadId,
                items: [for (final l in lista) itemLista(l.id, l.nombre)],
                onChanged: (v) => setState(() => _localidadId = v),
                validator: validarLocalidad,
              ),
            ),
            const SizedBox(height: 12),
            CampoDesplegable<String>(
              etiqueta: 'Energía',
              valor: _energia,
              items: [itemLista('baja', 'Baja'), itemLista('media', 'Media'), itemLista('alta', 'Alta')],
              onChanged: (v) => setState(() => _energia = v ?? 'media'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _historia,
              maxLines: 5,
              scrollPadding: const EdgeInsets.only(bottom: 160),
              decoration: const InputDecoration(labelText: 'Historia (obligatoria)'),
              validator: validarHistoria,
            ),
            CheckboxListTile(
              value: _ninos,
              onChanged: (v) => setState(() => _ninos = v ?? false),
              title: const Text('Convive con niños'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              value: _otros,
              onChanged: (v) => setState(() => _otros = v ?? false),
              title: const Text('Convive con otros animales'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            CheckboxListTile(
              value: _especial,
              onChanged: (v) => setState(() => _especial = v ?? false),
              title: const Text('Necesidad especial'),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            CampoDesplegable<String>(
              etiqueta: 'Esterilizado',
              valor: _esterilizado,
              items: [itemLista('ns', 'No se conoce'), itemLista('si', 'Sí'), itemLista('no', 'No')],
              onChanged: (v) => setState(() => _esterilizado = v ?? 'ns'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _raza,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Raza (opcional, no es filtro)'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () async {
                final f = await elegirFotoGaleria();
                if (f != null) setState(() => _foto = f);
              },
              child: Text(_foto == null ? 'Elegir foto (mínimo una, máx. 5 MB)' : 'Foto: ${_foto!.name}'),
            ),
            if (_error != null) AvisoMensaje(texto: _error!, error: true),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _enviando ? null : _enviar,
              child: Text(_enviando ? 'Publicando…' : 'Publicar'),
            ),
          ],
        ),
      ),
    );
  }
}
