import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/etiquetas.dart';
import '../../core/tema/tema.dart';

class LegalPage extends StatelessWidget {
  const LegalPage({super.key, required this.doc});

  final String doc;

  @override
  Widget build(BuildContext context) {
    final terminos = doc != 'datos';
    return Scaffold(
      appBar: AppBar(
        title: Text(terminos ? 'Términos' : 'Datos personales'),
        leading: IconButton(
          tooltip: 'Cerrar',
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close),
        ),
      ),
      body: SafeArea(
        child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
        children: [
          Text(
            terminos ? 'Uso de $nombreMarca' : 'Ley 1581 de 2012 · Decreto 1377 de 2013',
            style: estiloLeyenda(Theme.of(context).colorScheme.secondary),
          ),
          const SizedBox(height: 8),
          Text(
            terminos ? 'Términos y condiciones' : 'Tratamiento de datos personales',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 12),
          ...terminos ? _terminos() : _datos(),
          const SizedBox(height: 16),
          Text(
            'Prototipo formativo ADSO. No es un producto oficial del IDPYBA ni de la Alcaldía. La marca del producto es $nombreMarca.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
      ),
    );
  }

  List<Widget> _terminos() {
    return const [
      Text(
        'Al crear una cuenta en Mestizo aceptas estas reglas. El prototipo opera en el área urbana de Bogotá y solo para caninos y felinos domésticos.',
      ),
      SizedBox(height: 12),
      Text('Para qué sirve', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      SizedBox(height: 6),
      Text(
        'Publicar animales de refugios y hogares de paso verificados, postularse a una adopción con un cuestionario breve y cubrir ítems concretos de alimento, medicina o aseo. La métrica norte es un cupo liberado (animal en estado adoptado).',
      ),
      SizedBox(height: 12),
      Text('Lo que no hay', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      SizedBox(height: 6),
      Text('• No hay recaudo de dinero, Nequi, apadrinamiento ni pasarela de pagos.'),
      Text('• No se publican especies distintas de perro o gato doméstico.'),
      Text('• No se vende ningún animal. La adopción la cierra la entidad, no un pago.'),
      Text('• El rol validador no se autoasigna en el registro.'),
      SizedBox(height: 12),
      Text('Cuentas y roles', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      SizedBox(height: 6),
      Text(
        'Adoptante, donante o entidad. Una entidad no publica hasta tener sello Nivel 1 o Nivel 2. El visitante puede ver el catálogo, el badge y la bitácora pública.',
      ),
      SizedBox(height: 12),
      Text(
        'La historia y la foto de un animal son públicas. Las evidencias de verificación y el contacto de entrega de un donante no lo son.',
      ),
      SizedBox(height: 8),
      Text('Las cuentas de piloto local no corresponden a personas, animales ni refugios reales.'),
    ];
  }

  List<Widget> _datos() {
    return const [
      Text(
        'Quien recolecta datos debe tener autorización, finalidad clara, medidas de seguridad y permitir consulta o corrección.',
      ),
      SizedBox(height: 12),
      Text('Qué datos y para qué', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      SizedBox(height: 6),
      Text('• Nombre, correo, contraseña (hash con sal), localidad y rol: crear la cuenta y la sesión.'),
      Text('• Cinco respuestas de hogar: calcular un puntaje explicable y postularse.'),
      Text('• Contacto de entrega del donante: solo lo ve la entidad; no sale en la bitácora pública.'),
      Text('• Evidencias de verificación: solo entidad dueña y validador.'),
      Text('• Foto e historia del animal: catálogo público.'),
      SizedBox(height: 12),
      Text(
        'Contraseña con hash y sal (bcryptjs, costo 12). En la web la sesión va en cookie httpOnly (sid). En esta app el JWT se guarda de forma segura y se envía como Bearer. Sin aceptación no se crea la cuenta.',
      ),
    ];
  }
}
