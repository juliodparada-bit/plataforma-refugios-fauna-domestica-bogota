# Semana 5 — dobles

Inventario de lo que el proyecto no controla:

- PostgreSQL, a través de Prisma.
- El reloj de `DeseosService.reservar`: la reserva vence a los 7 días con `new Date()`.
- El disco: fotos de perfil, de animales, de verificación y de recepción.
- El API, visto desde el navegador.

Los tres tests de `e2e/tests/catalogo-con-dobles.test.js` usan un stub de `page.route`. El de la validación comprueba el cuerpo con el que se llamó a `/api/auth/entrar` y el texto de la alerta. Los otros dos comprueban el estado que ve la persona: la lista vacía y el API caído.

Revisión de mocks: el test de la lista vacía afirma el título «Aún no hay historias publicadas», no que el stub haya sido llamado. No hizo falta reescribirlo.

Mutante corrido: el título pasó a «No hay animales» y Playwright falló con `element(s) not found` en ese heading. Se restauró el texto.
