import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/etiquetas.dart';
import '../../core/tema/tema.dart';
import '../../core/widgets/comun.dart';

class _Camino {
  const _Camino({
    required this.id,
    required this.etiqueta,
    required this.resumen,
    required this.icono,
    required this.pasos,
  });

  final String id;
  final String etiqueta;
  final String resumen;
  final String icono;
  final List<({String titulo, String cuerpo})> pasos;
}

const _caminos = [
  _Camino(
    id: 'adoptante',
    etiqueta: 'Quiero adoptar',
    resumen: 'Lee una historia, cuenta cómo es tu hogar y postúlate.',
    icono: '🐾',
    pasos: [
      (titulo: 'Crea tu cuenta de adoptante', cuerpo: 'Regístrate con «Quiero adoptar». Sin cuenta puedes leer el catálogo; para postularte sí hace falta.'),
      (titulo: 'Cinco preguntas sobre tu hogar', cuerpo: 'Vivienda, horas de compañía, niños, otros animales y energía. Sirven para que el encuentro encaje.'),
      (titulo: 'Elige por convivencia, no por raza', cuerpo: 'Filtra por especie y localidad. Lee la historia. Si ya respondiste, verás un puntaje con una frase de por qué coinciden.'),
      (titulo: 'Postúlate y espera al refugio', cuerpo: 'Confirmas mayoría de edad y que vives en Bogotá. El hogar preselecciona o entrega. Al entregar, ese animal deja de esperar.'),
    ],
  ),
  _Camino(
    id: 'donante',
    etiqueta: 'Quiero donar un insumo',
    resumen: 'Reservas alimento, medicina o aseo. Sin Nequi y sin recaudo.',
    icono: '🌾',
    pasos: [
      (titulo: 'Crea tu cuenta de donante', cuerpo: 'Elige «Quiero donar un insumo». No pedimos tarjeta ni monto: se cubren ítems, no se recauda dinero.'),
      (titulo: 'Mira qué necesita cada hogar', cuerpo: 'Al entrar vas a Necesidades: hogares con sello e ítems pendientes. Entras al perfil para reservar.'),
      (titulo: 'Reserva un ítem concreto', cuerpo: 'Eliges bulto, pipetas o aseo y dejas un contacto solo para coordinar. Ese dato no sale en la bitácora pública.'),
      (titulo: 'La entidad confirma la recepción', cuerpo: 'Cuando el refugio confirma, el ítem queda cubierto. La comunidad ve qué llegó, no quién lo donó.'),
    ],
  ),
  _Camino(
    id: 'entidad',
    etiqueta: 'Tengo un hogar de paso',
    resumen: 'Te verifican, publicas historias y gestionas postulaciones.',
    icono: '🏠',
    pasos: [
      (titulo: 'Crea la cuenta del hogar', cuerpo: 'Elige «Soy un refugio o hogar de paso». Sin sello no publicas animales ni ítems; el catálogo sí lo ves.'),
      (titulo: 'Pide la verificación', cuerpo: 'Desde Cuenta envías evidencias de Nivel 1 o Nivel 2. Un validador las revisa.'),
      (titulo: 'Publica historia y foto', cuerpo: 'Con el sello cuentas convivencia, energía y necesidad especial. La raza no es el título. También puedes pedir insumos.'),
      (titulo: 'Resuelve postulaciones y cupo', cuerpo: 'Ves el puntaje explicable, preseleccionas o entregas. Al marcar entrega se libera un cupo.'),
    ],
  ),
];

class InicioPage extends StatefulWidget {
  const InicioPage({super.key});

  @override
  State<InicioPage> createState() => _InicioPageState();
}

class _InicioPageState extends State<InicioPage> {
  String? _camino;
  int _paso = 0;
  late final PageController _paginas;

  @override
  void initState() {
    super.initState();
    _paginas = PageController(viewportFraction: 0.88);
  }

  @override
  void dispose() {
    _paginas.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final elegido = _caminos.cast<_Camino?>().firstWhere(
          (c) => c!.id == _camino,
          orElse: () => null,
        );
    final total = elegido?.pasos.length ?? 0;
    final actual = elegido == null ? null : elegido.pasos[_paso.clamp(0, total - 1)];

    return HojaPagina(
      kicker: 'Inicio',
      titulo: 'Elige cómo participar',
      proposito: '$esloganHero Adoptar, cubrir un insumo o publicar desde un hogar de paso. Sin recaudo. Solo Bogotá urbana, perros y gatos.',
      hijo: Column(
        children: [
          SizedBox(
            height: 248,
            child: PageView.builder(
              controller: _paginas,
              itemCount: _caminos.length,
              itemBuilder: (context, i) {
                final c = _caminos[i];
                final activo = _camino == c.id;
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: Semantics(
                    button: true,
                    label: c.etiqueta,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(22),
                      onTap: () => setState(() {
                        _camino = c.id;
                        _paso = 0;
                      }),
                      child: AnimatedContainer(
                        duration: MediaQuery.of(context).disableAnimations
                            ? Duration.zero
                            : const Duration(milliseconds: 220),
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(
                            color: activo
                                ? Theme.of(context).colorScheme.primary
                                : Theme.of(context).colorScheme.outline,
                            width: activo ? 2.4 : 1,
                          ),
                          color: Theme.of(context).colorScheme.surface,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.icono, style: const TextStyle(fontSize: 36)),
                            const SizedBox(height: 10),
                            Text(
                              c.etiqueta,
                              style: Theme.of(context).textTheme.titleLarge,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Expanded(
                              child: Text(
                                c.resumen,
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (elegido != null && actual != null) ...[
            const SizedBox(height: 20),
            Text(
              '${elegido.etiqueta} · paso ${_paso + 1} de $total',
              style: estiloLeyenda(Theme.of(context).colorScheme.secondary),
            ),
            const SizedBox(height: 10),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (_paso + 1).toString().padLeft(2, '0'),
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 6),
                    Text(actual.titulo, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(actual.cuerpo),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _paso == 0 ? null : () => setState(() => _paso--),
                    child: const Text('Anterior'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      if (_paso < total - 1) {
                        setState(() => _paso++);
                      } else {
                        context.go('/registro?rol=${elegido.id}');
                      }
                    },
                    child: Text(_paso < total - 1 ? 'Siguiente' : 'Crear cuenta así'),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          EnlaceTexto(
            texto: 'Saltar y ver el catálogo',
            onTap: () => context.go('/catalogo'),
          ),
        ],
      ),
    );
  }
}
