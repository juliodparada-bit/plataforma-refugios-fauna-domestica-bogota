import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/validacion.dart';
import '../../core/widgets/comun.dart';

const _pilotos = [
  ('Entidad verificada (Nivel 1)', 'entidad.ejemplo@local.test'),
  ('Adoptante (ya respondió las 5 preguntas)', 'adoptante.ejemplo@local.test'),
  ('Donante de insumos', 'donante.ejemplo@local.test'),
];

class EntrarPage extends ConsumerStatefulWidget {
  const EntrarPage({super.key});

  @override
  ConsumerState<EntrarPage> createState() => _EntrarPageState();
}

class _EntrarPageState extends ConsumerState<EntrarPage> {
  final _correo = TextEditingController();
  final _clave = TextEditingController();
  final _form = GlobalKey<FormState>();
  String? _error;
  bool _enviando = false;

  @override
  void dispose() {
    _correo.dispose();
    _clave.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _error = null;
      _enviando = true;
    });
    try {
      await ref.read(sesionProvider.notifier).entrar(_correo.text.trim(), _clave.text);
    } catch (e) {
      if (mounted) setState(() => _error = textoError(e));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return HojaPagina(
      kicker: 'Sesión',
      titulo: 'Entrar',
      proposito: 'Correo y contraseña. También puedes usar una cuenta de piloto.',
      hijo: AutofillGroup(
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const AvisoCaja(
                texto:
                    'Cuentas de piloto (clave EjemploLocal123): entidad.ejemplo@local.test, adoptante.ejemplo@local.test, donante.ejemplo@local.test. Validador: validador@local.test / CambiaEsto123. No son personas ni refugios reales.',
              ),
              const SizedBox(height: 8),
              for (final p in _pilotos)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  minVerticalPadding: 12,
                  title: Text(p.$1),
                  subtitle: Text(p.$2),
                  onTap: () {
                    _correo.text = p.$2;
                    _clave.text = 'EjemploLocal123';
                  },
                ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _correo,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.username, AutofillHints.email],
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Correo'),
                validator: validarCorreo,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _clave,
                obscureText: true,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                scrollPadding: const EdgeInsets.only(bottom: 120),
                decoration: const InputDecoration(labelText: 'Contraseña'),
                validator: validarContrasena,
                onFieldSubmitted: (_) => _enviar(),
              ),
              if (_error != null) AvisoMensaje(texto: _error!, error: true),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _enviando ? null : _enviar,
                child: Text(_enviando ? 'Entrando…' : 'Entrar'),
              ),
              EnlaceTexto(texto: 'Crear cuenta', onTap: () => context.go('/registro')),
              EnlaceTexto(texto: 'Términos', onTap: () => context.push('/legal/terminos')),
              EnlaceTexto(texto: 'Datos personales', onTap: () => context.push('/legal/datos')),
            ],
          ),
        ),
      ),
    );
  }
}
