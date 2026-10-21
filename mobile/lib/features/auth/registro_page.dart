// RadioListTile sigue siendo el patrón de formularios; RadioGroup llega en Flutter 3.32+.
// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/modelos/modelos.dart';
import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

class RegistroPage extends ConsumerStatefulWidget {
  const RegistroPage({super.key, this.rolInicial});

  final String? rolInicial;

  @override
  ConsumerState<RegistroPage> createState() => _RegistroPageState();
}

class _RegistroPageState extends ConsumerState<RegistroPage> {
  final _form = GlobalKey<FormState>();
  final _nombre = TextEditingController();
  final _correo = TextEditingController();
  final _clave = TextEditingController();
  String? _localidadId;
  String? _rol;
  bool _terminos = false;
  bool _datos = false;
  bool _enviando = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final inicial = widget.rolInicial;
    if (inicial == 'adoptante' || inicial == 'donante' || inicial == 'entidad') {
      _rol = inicial;
    }
  }

  @override
  void dispose() {
    _nombre.dispose();
    _correo.dispose();
    _clave.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_form.currentState!.validate()) return;
    if (!_terminos || !_datos) {
      setState(() => _error = 'Debes aceptar los términos y el tratamiento de datos personales.');
      return;
    }
    if (_rol == null || _localidadId == null) {
      setState(() => _error = 'Elige localidad y cómo vas a participar.');
      return;
    }
    setState(() {
      _error = null;
      _enviando = true;
    });
    try {
      await ref.read(sesionProvider.notifier).registrar(
            nombre: _nombre.text.trim(),
            correo: _correo.text.trim(),
            contrasena: _clave.text,
            localidadId: _localidadId!,
            rol: _rol!,
          );
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final locs = ref.watch(localidadesProvider);
    return HojaPagina(
      kicker: 'Registro',
      titulo: 'Crear cuenta',
      proposito: 'Elige cómo vas a participar: adoptar, donar un insumo o publicar desde un hogar de paso.',
      hijo: AutofillGroup(
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Si quieres explorar primero, usa las cuentas de piloto al entrar.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nombre,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Nombre'),
                validator: validarNombre,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _correo,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Correo'),
                validator: validarCorreo,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _clave,
                obscureText: true,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Contraseña'),
                validator: validarContrasenaNueva,
              ),
              const SizedBox(height: 12),
              locs.when(
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text(textoError(e)),
                data: (lista) => CampoDesplegable<String>(
                  etiqueta: 'Localidad en Bogotá',
                  valor: _localidadId,
                  items: [
                    for (final Localidad l in lista) itemLista(l.id, l.nombre),
                  ],
                  onChanged: (v) => setState(() => _localidadId = v),
                  validator: validarLocalidad,
                ),
              ),
              const SizedBox(height: 16),
              Text('Quiero ser', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              _rolCard('adoptante', '🐾', 'Quiero adoptar', 'Cinco preguntas honestas. Un puntaje que explica por qué encajan.'),
              _rolCard('donante', '🌾', 'Quiero donar un insumo', 'Reservas algo concreto: alimento, medicina, aseo.'),
              _rolCard('entidad', '🏠', 'Soy un refugio o hogar de paso', 'Publicas historias reales cuando el sello esté aprobado.'),
              if (_rol == 'entidad') ...[
                const SizedBox(height: 8),
                const Text('Podrás publicar animales e ítems cuando la verificación esté aprobada.'),
              ],
              const SizedBox(height: 12),
              const AvisoCaja(
                texto:
                    'Recogemos nombre, correo, localidad y rol para operar la cuenta. La contraseña se guarda con hash. Las evidencias de verificación y el contacto del donante no son públicos.',
              ),
              CheckboxListTile(
                value: _terminos,
                onChanged: (v) => setState(() => _terminos = v ?? false),
                title: const Text('Acepto los términos y condiciones'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
              ),
              EnlaceTexto(texto: 'Leer términos', onTap: () => context.push('/legal/terminos')),
              CheckboxListTile(
                value: _datos,
                onChanged: (v) => setState(() => _datos = v ?? false),
                title: const Text('Autorizo el tratamiento de datos (Ley 1581 de 2012)'),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
              ),
              EnlaceTexto(texto: 'Leer aviso de datos', onTap: () => context.push('/legal/datos')),
              Text('El rol validador no se crea desde aquí.', style: Theme.of(context).textTheme.bodySmall),
              if (_error != null) AvisoMensaje(texto: _error!, error: true),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _enviando || !_terminos || !_datos ? null : _enviar,
                child: Text(_enviando ? 'Creando cuenta…' : 'Crear cuenta'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _rolCard(String id, String icono, String titulo, String cuerpo) {
    final activo = _rol == id;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Semantics(
        button: true,
        selected: activo,
        label: titulo,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => setState(() => _rol = id),
          child: InputDecorator(
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: activo
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).colorScheme.outline,
                  width: activo ? 2 : 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Radio<String>(
                  value: id,
                  groupValue: _rol,
                  onChanged: (v) => setState(() => _rol = v),
                ),
                ExcludeSemantics(child: Text(icono, style: const TextStyle(fontSize: 22))),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(titulo, style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(cuerpo, style: Theme.of(context).textTheme.bodySmall),
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
