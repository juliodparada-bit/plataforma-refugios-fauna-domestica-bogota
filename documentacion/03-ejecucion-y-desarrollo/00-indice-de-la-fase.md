# Fase 3 — Ejecución y desarrollo

| Campo | Valor |
|---|---|
| Código | DOC-EJ-00 |
| Fase SENA | Ejecución |
| Competencia | 220501096 |
| Estado | Índice — no hay código de producto todavía |
| Depende de | Al menos arquitectura, DER y wireframes de la fase 2 |

Aquí se construye el software por incrementos, en el orden del product backlog ([1.3](../01-analisis/1.3-historias-de-usuario-y-product-backlog.md), sección 5). Este índice se llena cuando arranque el primer sprint.

---

## Artefactos que se van a producir

### 3.1 Arquitectura de implementación y stack

El estilo y el stack ya están en [2.1 Arquitectura](../02-planeacion-y-diseno/2.1-arquitectura-de-la-solucion.md). En ejecución se documenta lo operativo:

- Cómo levantar el entorno de desarrollo (comandos, puertos).
- Convenciones de ramas y de commits.
- Variables de entorno (sin secretos en el expediente).

### 3.2 Desarrollo por módulos / sprints

Cada sprint deja:

- Incremento demostrable.
- Lista de HU cerradas.
- Notas si una regla de negocio cambió (y se actualiza el IEEE 830 el mismo día).

Módulos previstos, alineados al backlog:

1. Usuarios, roles y sesión.
2. Verificación de entidades.
3. Catálogo de animales (con bloqueo de especie).
4. Cuestionario, puntaje, postulaciones y entrega (cupo).
5. Listas de deseos y bitácora.

### 3.3 Evidencias de ejecución

- Repositorio Git: https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota
- Capturas o video corto de cada módulo funcionando (el instructor suele pedir evidencia de producto, no solo código).

---

## Fuera de esta fase

- Pruebas formales y plan de calidad (fase 4, competencia 220501098).
- Manuales y pitch (fase 4).
- Recaudo de dinero, apadrinamiento, aprendizaje automático o aplicación nativa.
