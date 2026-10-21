import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/etiquetas.dart';
import '../../core/imagen.dart';
import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class CuentaPage extends ConsumerStatefulWidget {
  const CuentaPage({super.key});

  @override
  ConsumerState<CuentaPage> createState() => _CuentaPageState();
}

class _CuentaPageState extends ConsumerState<CuentaPage> {
  bool _editando = false;
  bool _enviando = false;
  bool _subiendo = false;
  String? _error;
  String? _ok;
  final _nombre = TextEditingController();
  final _hogar = TextEditingController();
  String? _localidadId;

  @override
  void dispose() {
    _nombre.dispose();
    _hogar.dispose();
    super.dispose();
  }

  Future<void> _foto() async {
    final archivo = await elegirFotoGaleria();
    if (archivo == null) return;
    setState(() {
      _subiendo = true;
      _error = null;
      _ok = null;
    });
    try {
      await asegurarPesoFoto(archivo);
      final usuario = await ref.read(apiProvider).subirFotoPerfil(archivo.path, archivo.name);
      await ref.read(sesionProvider.notifier).aplicar(usuario);
      if (mounted) setState(() => _ok = 'La foto de perfil ya está en tu cuenta.');
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _subiendo = false);
    }
  }

  Future<void> _guardar() async {
    final usuario = ref.read(sesionProvider).valueOrNull?.usuario;
    if (usuario == null) return;
    final nombreError = validarNombre(_nombre.text);
    if (nombreError != null) {
      setState(() => _error = nombreError);
      return;
    }
    if (_localidadId == null || _localidadId!.isEmpty) {
      setState(() => _error = 'Elige una localidad.');
      return;
    }
    if (usuario.esEntidad && (_hogar.text.trim().length < 2)) {
      setState(() => _error = 'El nombre del hogar debe tener al menos 2 caracteres.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
      _ok = null;
    });
    try {
      final actualizado = await ref.read(apiProvider).actualizarCuenta(
            nombre: _nombre.text.trim(),
            localidadId: _localidadId!,
            entidadNombre: usuario.esEntidad ? _hogar.text.trim() : null,
          );
      await ref.read(sesionProvider.notifier).aplicar(actualizado);
      if (mounted) {
        setState(() {
          _editando = false;
          _ok = 'Tus datos quedaron actualizados.';
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
    final usuario = ref.watch(sesionProvider.select((a) => a.valueOrNull?.usuario));
    if (usuario == null) return const EstadoCarga();
    final locs = ref.watch(localidadesProvider);

    return HojaPagina(
      kicker: etiquetaRol(usuario.rol),
      titulo: 'Cuenta',
      proposito: 'Foto, datos personales y atajos de tu rol. El correo identifica la sesión.',
      hijo: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AvatarCuenta(nombre: usuario.nombre, fotoUrl: usuario.fotoUrl, lado: 88),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      usuario.nombre,
                      style: Theme.of(context).textTheme.headlineSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '${etiquetaRol(usuario.rol)} · ${usuario.localidad}',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      usuario.correo,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: _subiendo ? null : _foto,
                      child: Text(_subiendo
                          ? 'Subiendo…'
                          : usuario.fotoUrl == null
                              ? 'Agregar foto'
                              : 'Cambiar foto'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (!_editando) ...[
            if (usuario.esEntidad && usuario.entidad != null) ...[
              _dato('Hogar', usuario.entidad!.nombre),
              _dato(
                'Sello',
                '${etiquetaSello(usuario.entidad!.estadoVerificacion)} · ${usuario.puedePublicar ? 'Puedes publicar' : 'Aún no publicas'}',
              ),
            ],
            if (usuario.esAdoptante)
              _dato(
                'Cuestionario',
                usuario.tienePerfilAdoptante
                    ? 'Las 5 preguntas del hogar ya están respondidas.'
                    : 'Todavía no contaste cómo es tu hogar.',
              ),
            if (usuario.esDonante)
              _dato('Donaciones', 'Reservas ítems en especie. Tu contacto no sale en la bitácora pública.'),
            if (usuario.esValidador)
              _dato('Labor', 'Revisas evidencias de hogares. No te autoasignas en el registro público.'),
            if (usuario.consentimientoEn != null)
              _dato(
                'Datos personales',
                'Autorizaste el tratamiento el ${fechaCorta(usuario.consentimientoEn)} (Ley 1581).',
              ),
            OutlinedButton(
              onPressed: () {
                _nombre.text = usuario.nombre;
                _hogar.text = usuario.entidad?.nombre ?? '';
                _localidadId = usuario.localidadId;
                setState(() {
                  _editando = true;
                  _ok = null;
                  _error = null;
                });
              },
              child: const Text('Editar datos'),
            ),
          ] else ...[
            TextField(
              controller: _nombre,
              textCapitalization: TextCapitalization.words,
              scrollPadding: const EdgeInsets.only(bottom: 120),
              decoration: const InputDecoration(labelText: 'Nombre'),
            ),
            if (usuario.esEntidad) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _hogar,
                textCapitalization: TextCapitalization.words,
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Nombre del hogar'),
              ),
            ],
            const SizedBox(height: 12),
            locs.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
              data: (lista) => CampoDesplegable<String>(
                etiqueta: 'Localidad en Bogotá',
                valor: _localidadId,
                items: [for (final l in lista) itemLista(l.id, l.nombre)],
                onChanged: (v) => setState(() => _localidadId = v),
              ),
            ),
            const SizedBox(height: 8),
            InputDecorator(
              decoration: const InputDecoration(labelText: 'Correo'),
              child: Text(usuario.correo, overflow: TextOverflow.ellipsis),
            ),
            const SizedBox(height: 6),
            const Text('El correo identifica la sesión. Si necesitas cambiarlo, escribe a quien opera el piloto.'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _enviando ? null : () => setState(() => _editando = false),
                    child: const Text('Cancelar'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: _enviando ? null : _guardar,
                    child: Text(_enviando ? 'Guardando…' : 'Guardar cambios'),
                  ),
                ),
              ],
            ),
          ],
          if (_ok != null) AvisoMensaje(texto: _ok!),
          if (_error != null) AvisoMensaje(texto: _error!, error: true),
          if (usuario.esEntidad)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: AvisoCaja(
                texto: usuario.puedePublicar
                    ? 'Sello ${usuario.entidad?.estadoVerificacion == 'nivel_1' ? 'Nivel 1' : 'Nivel 2'}. Publica historia y foto; pide insumos sin recaudo.'
                    : 'Aún no puedes publicar. Envía la solicitud de verificación; el validador la revisa.',
              ),
            ),
          const SizedBox(height: 20),
          Text('Atajos', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          if (usuario.esEntidad) ...[
            _atajo(context, '✦', usuario.puedePublicar ? 'Tu sello' : 'Solicitar verificación',
                usuario.puedePublicar ? 'Nivel aprobado. Puedes publicar.' : 'Envía evidencias para Nivel 1 o Nivel 2.',
                () => context.go('/verificacion')),
            if (usuario.puedePublicar) ...[
              _atajo(context, '🐾', 'Publicar un animal', 'Historia, foto y convivencia. La raza no es el título.',
                  () => context.go('/alta')),
              _atajo(context, '📋', 'Postulaciones', 'Puntaje explicable. Preselecciona o entrega.',
                  () => context.go('/postulaciones')),
              _atajo(context, '🌾', 'Lista de deseos', 'Alimento, medicina o aseo. Sin recaudo.',
                  () => context.go('/deseos')),
            ],
          ],
          if (usuario.esAdoptante) ...[
            _atajo(context, '🐾', 'Catálogo', 'Historias en espera. Filtra por especie y localidad.',
                () => context.go('/catalogo')),
            _atajo(
              context,
              '🏡',
              usuario.tienePerfilAdoptante ? 'Actualizar mi hogar' : 'Cinco preguntas del hogar',
              'Vivienda, compañía, niños, otros animales y energía.',
              () => context.go('/cuestionario'),
            ),
            _atajo(context, '📋', 'Mis postulaciones', 'El estado de lo que ya enviaste al refugio.',
                () => context.go('/mis-postulaciones')),
          ],
          if (usuario.esDonante) ...[
            _atajo(context, '🌾', 'Necesidades', 'Hogares con sello e ítems pendientes. Reserva en especie.',
                () => context.go('/necesidades')),
            _atajo(context, '🐾', 'Catálogo', 'También puedes leer las historias. Donar no pide postularte.',
                () => context.go('/catalogo')),
          ],
          if (usuario.esValidador)
            _atajo(context, '✅', 'Cola de validación', 'Evidencias pendientes: aprobar, rechazar o pedir complemento.',
                () => context.go('/cola')),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => ref.read(sesionProvider.notifier).salir(),
            child: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }

  Widget _dato(String dt, String dd) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(dt.toUpperCase(), style: Theme.of(context).textTheme.labelSmall),
          Text(dd),
        ],
      ),
    );
  }

  Widget _atajo(BuildContext context, String icono, String titulo, String cuerpo, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Card(
        child: ListTile(
          minVerticalPadding: 12,
          leading: ExcludeSemantics(child: Text(icono, style: const TextStyle(fontSize: 22))),
          title: Text(titulo),
          subtitle: Text(cuerpo),
          onTap: onTap,
        ),
      ),
    );
  }
}
