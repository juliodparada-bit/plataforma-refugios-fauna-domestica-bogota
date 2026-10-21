// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/cliente.dart';
import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/widgets/comun.dart';

class CuestionarioPage extends ConsumerStatefulWidget {
  const CuestionarioPage({super.key});

  @override
  ConsumerState<CuestionarioPage> createState() => _CuestionarioPageState();
}

class _CuestionarioPageState extends ConsumerState<CuestionarioPage> {
  final _peticion = TokenPagina();
  bool _listo = false;
  bool _enviando = false;
  String? _error;
  String? _vivienda;
  String? _ninos;
  String? _otros;
  String? _energia;
  double _horas = 8;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final p = await ref.read(apiProvider).perfil(cancelar: _peticion.renovar());
        if (!mounted) return;
        setState(() {
          if (p != null) {
            _vivienda = p.tipoVivienda;
            _horas = p.horasCompania.toDouble().clamp(0, 24);
            _ninos = p.ninosEnHogar ? 'si' : 'no';
            _otros = p.otrosAnimales;
            _energia = p.energiaSostenible;
          }
          _listo = true;
        });
      } on PeticionCancelada {
        return;
      } catch (_) {
        if (mounted) {
          setState(() {
            _error = 'No pude cargar tu cuestionario. Puedes responderlo de nuevo.';
            _listo = true;
          });
        }
      }
    });
  }

  @override
  void dispose() {
    _peticion.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (_vivienda == null || _ninos == null || _otros == null || _energia == null) {
      setState(() => _error = 'Responde las cinco preguntas.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
    });
    try {
      await ref.read(apiProvider).guardarPerfil(
            PerfilAdoptante(
              tipoVivienda: _vivienda!,
              horasCompania: _horas.round().clamp(0, 24),
              ninosEnHogar: _ninos == 'si',
              otrosAnimales: _otros!,
              energiaSostenible: _energia!,
            ),
          );
      await ref.read(sesionProvider.notifier).refrescar();
      if (mounted) context.go('/catalogo');
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return HojaPagina(
      kicker: 'Adoptante',
      titulo: 'Cuéntanos cómo es tu hogar',
      proposito: 'No es un examen. Es una conversación honesta para que el animal que llegue, llegue al lugar correcto.',
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          EnlaceTexto(texto: '← Atrás', onTap: () => context.go('/cuenta')),
          const AvisoCaja(
            texto: 'Solo el refugio verá estas respuestas cuando te postules. Aquí no hay respuestas incorrectas.',
          ),
          if (!_listo) const EstadoCarga(),
          if (_listo) ...[
            _grupo('1. Vivienda', {
              'apartamento': 'Apartamento',
              'casa': 'Casa',
              'casa_con_patio': 'Casa con patio',
              'otro': 'Otro',
            }, _vivienda, (v) => setState(() => _vivienda = v)),
            Text('2. Horas de compañía al día', style: Theme.of(context).textTheme.titleMedium),
            Slider(
              value: _horas,
              min: 0,
              max: 24,
              divisions: 24,
              label: '${_horas.round()} h',
              onChanged: (v) => setState(() => _horas = v),
            ),
            Text('${_horas.round()} h'),
            _grupo('3. ¿Niños en el hogar?', {'si': 'Sí', 'no': 'No'}, _ninos, (v) => setState(() => _ninos = v)),
            _grupo('4. ¿Otros animales?', {
              'ninguno': 'Ninguno',
              'perro': 'Perro',
              'gato': 'Gato',
              'ambos': 'Ambos',
              'otros': 'Otros',
            }, _otros, (v) => setState(() => _otros = v)),
            _grupo('5. Energía que puedes acompañar', {
              'baja': 'Baja',
              'media': 'Media',
              'alta': 'Alta',
            }, _energia, (v) => setState(() => _energia = v)),
            if (_error != null) AvisoMensaje(texto: _error!, error: true),
            FilledButton(
              onPressed: _enviando ? null : _enviar,
              child: Text(_enviando ? 'Guardando tu historia…' : 'Listo — quiero conocer a quien me espera'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _grupo(String titulo, Map<String, String> opciones, String? valor, ValueChanged<String?> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(titulo, style: Theme.of(context).textTheme.titleMedium),
          for (final e in opciones.entries)
            RadioListTile<String>(
              value: e.key,
              groupValue: valor,
              onChanged: onChanged,
              title: Text(e.value),
              contentPadding: EdgeInsets.zero,
            ),
        ],
      ),
    );
  }
}
