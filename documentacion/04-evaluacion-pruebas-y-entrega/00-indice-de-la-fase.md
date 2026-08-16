# Fase 4 — Evaluación, pruebas y entrega

| Campo | Valor |
|---|---|
| Código | DOC-EV-00 |
| Fase SENA | Evaluación y control |
| Competencias | 220501097 · 220501098 |
| Estado | Índice — se abre con el primer incremento usable |
| Depende de | Al menos un módulo demostrable de la fase 3 |

Cierra el ciclo PHVA del proyecto formativo: verificar lo construido, desplegarlo y sustentarlo. Este índice se llena con el primer incremento usable.

---

## Artefactos que se van a producir

### 4.1 Plan y casos de prueba

- Alcance de pruebas del prototipo (lo que se prueba y lo que no: no hay pasarela que probar).
- Casos de prueba trazados a HU y a RF (unitarias donde aporten, integración de flujos, usabilidad con el refugio piloto).
- Casos negativos obligatorios: especie no permitida; entidad no verificada que intenta publicar; donante que no ve datos ajenos.
- Registro de ejecución (pasó / falló / evidencia).

### 4.2 Manual técnico

Arquitectura real, cómo levantar el entorno, modelo de datos, endpoints de la API, variables de entorno, cómo se calcula el puntaje de compatibilidad.

### 4.3 Manual de usuario

Guía paso a paso:

- Entidad: verificarse, publicar animal, gestionar postulaciones, confirmar un bulto.
- Adoptante: cinco preguntas, postularse.
- Donante: reservar un ítem.

### 4.4 Despliegue

- Entorno de piloto (URL).
- Checklist de producción mínima: HTTPS, copias de respaldo de la base, sin secretos en el cliente.
- Nota de limitaciones del prototipo.

### 4.5 Sustentación

- Pitch de 5 a 8 minutos: problema, no competir con el IDPYBA, métrica norte, demo (publicar, postular, cubrir ítem) y el alcance cerrado (sin pasarela ni apadrinamiento).
- Respuestas preparadas a: «¿dónde está la pasarela?», «¿por qué no apadrinamiento?», «¿es oficial del Distrito?».

---

## Criterio de éxito de la entrega (se copia de la formulación)

Mínimo viable de demostración: un refugio publica tres animales, llega una postulación y un ítem de insumos queda cubierto. Deseable: diez animales, cinco ítems cubiertos, una adopción con seguimiento a 15 días.
