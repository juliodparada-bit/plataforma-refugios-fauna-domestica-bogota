# Fase 2 — Planeación y diseño

| Campo | Valor |
|---|---|
| Código | DOC-PL-00 |
| Fase SENA | Planeación |
| Competencias | 220501094 · 220501095 |
| Estado | Estable — 2.1 a 2.4 vigentes. El look del prototipo está en `web/` |
| Depende de | [Análisis 1.1 a 1.4](../01-analisis/00-indice-de-la-fase.md) (la entrevista real sigue pendiente; el diseño avanza sobre el alcance escrito) |

Traduzco requisitos a **arquitectura, modelos y pantallas**. Si cambia la métrica norte o si se incluye recaudo, vuelvo al análisis.

**Cómo leerla:** vista previa (`Ctrl+Shift+V`). Orden: 2.1 → 2.2 → 2.3 → 2.4.

---

## Artefactos (en este orden)

### 2.1 Arquitectura de la solución

**Estado: vigente.** Ver [2.1 Arquitectura de la solución](2.1-arquitectura-de-la-solucion.md).

- Estilo (capas / cliente-servidor).
- Diagrama de contexto y de contenedores.
- Stack del prototipo (React 19 + Vite 6 + TypeScript, NestJS 11, Prisma, PostgreSQL 16). Alternativa Java/Spring si el centro lo exigiera: cambian el lenguaje, no las capas ni los RF.
- Decisión de recaudo: el sistema no recauda dinero.

### 2.2 UML

**Estado: vigente.** Ver [2.2 Modelado UML](2.2-uml.md).

| Diagrama | Para qué, en este proyecto |
|---|---|
| Casos de uso **por épica** (4 dibujos) | Verificar, publicar, postular, cubrir ítem — un solo diagrama de 15 UC era ilegible |
| Actividades | Flujos de adopción (incluye `reservado`) y de lista de deseos |
| Secuencia | Postulación y confirmación de insumo |
| Clases y estados (dominio) | Usuario, PerfilAdoptante, Entidad, Animal, Postulación, Ítem, Reserva, Verificación. Estados de entidad **y** de solicitud (`complemento` vive en la solicitud). |
| Componentes y despliegue | Esbozo en el 2.1; detalle operativo en fase 4 |

### 2.3 Base de datos

**Estado: vigente.** Ver [2.3 Base de datos](2.3-base-de-datos.md).

- Modelo entidad-relación (DER).
- Modelo relacional (tablas, claves, integridad).
- Diccionario de datos (cada campo, tipo, obligatoriedad, dominio; en especial `especie` y estados).
- Restricciones: `especie ∈ {canino, felino}`. No se modelan tablas ni atributos de recaudo de dinero.

### 2.4 Interfaz (UI/UX)

**Estado: vigente (contenido en wireframes; look en `web/`).** Ver [2.4 Interfaz](2.4-interfaz-ui-ux.md).

- Mapa de navegación (público, adoptante/donante, entidad, validador).
- Wireframes de: registro, sesión, solicitud de verificación, cola, alta de animal, catálogo, cuestionario, tablero de postulaciones, publicar ítem, lista de deseos.
- RF-10 (anti-sesgo) convertido en reglas de pantalla.

---

## Lo que esta fase no incluye

- Código de producción (eso es fase 3).
- Pasarela, apadrinamiento ni app nativa (esta última, pendiente de reevaluación según formulación 6.3).
- «Diseñar todo UML posible»: solo los diagramas que explican el alcance del proyecto.

---

## Criterio de estabilidad del alcance

El diseño (2.1 en adelante) avanza sobre la formulación y el IEEE 830 vigentes. Un cambio menor de redacción no obliga a rehacer diagramas; un cambio de métrica norte o de incluir recaudo de dinero sí obliga a volver al análisis.
