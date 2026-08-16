# Fase 2 — Planeación y diseño

| Campo | Valor |
|---|---|
| Código | DOC-PL-00 |
| Fase SENA | Planeación |
| Competencias | 220501094 · 220501095 |
| Estado | En construcción — 2.1, 2.2 y 2.3 vigentes; 2.4 pendiente |
| Depende de | [Análisis 1.1 a 1.4](../01-analisis/00-indice-de-la-fase.md) (la entrevista real sigue pendiente; el diseño avanza sobre el alcance escrito) |

Esta fase traduce requisitos a **arquitectura, modelos y prototipos**. El alcance de análisis se trata como estable para diseñar; un cambio de métrica norte o de incluir recaudo sí obliga a volver atrás.

**Cómo leerla:** vista previa (`Ctrl+Shift+V`). Orden: 2.1 → 2.2 → 2.3. El 2.4 aún no existe.

---

## Artefactos (en este orden)

### 2.1 Arquitectura de la solución

**Estado: vigente.** Ver [2.1 Arquitectura de la solución](2.1-arquitectura-de-la-solucion.md).

- Estilo (capas / cliente-servidor).
- Diagrama de contexto y de contenedores.
- Stack propuesto (React + NestJS + PostgreSQL; alternativa Java/Spring si el centro lo exige).
- Decisión de recaudo: el sistema no recauda dinero.

### 2.2 UML

**Estado: vigente.** Ver [2.2 Modelado UML](2.2-uml.md).

| Diagrama | Para qué, en este proyecto |
|---|---|
| Casos de uso **por épica** (4 dibujos) | Verificar, publicar, postular, cubrir ítem — un solo diagrama de 15 UC era ilegible |
| Actividades | Flujos de adopción (incluye `reservado`) y de lista de deseos |
| Secuencia | Postulación y confirmación de insumo |
| Clases y estados (dominio) | Usuario, PerfilAdoptante, Entidad, Animal, Postulación, Ítem, Reserva, Verificación |
| Componentes y despliegue | Esbozo en el 2.1; detalle operativo en fase 4 |

### 2.3 Base de datos

**Estado: vigente.** Ver [2.3 Base de datos](2.3-base-de-datos.md).

- Modelo entidad-relación (DER).
- Modelo relacional (tablas, claves, integridad).
- Diccionario de datos (cada campo, tipo, obligatoriedad, dominio; en especial `especie` y estados).
- Restricciones: `especie ∈ {canino, felino}`. No se modelan tablas ni atributos de recaudo de dinero.

### 2.4 Interfaz (UI/UX) — siguiente artefacto

**Estado: pendiente.** Aún no hay archivo.

- Mapa de navegación (público, adoptante/donante, entidad, validador).
- Wireframes de baja fidelidad de: registro, cola de verificación, alta de animal, catálogo, cuestionario de 5 preguntas, tablero de postulaciones, lista de deseos.
- Prototipo navegable de alta fidelidad **después** de validar wireframes (Figma u herramienta equivalente).
- Criterios anti-sesgo ya escritos en RF-10: se convierten en reglas de pantalla.

---

## Lo que esta fase no incluye

- Código de producción (eso es fase 3).
- Pasarela, apadrinamiento ni app nativa (esta última, pendiente de reevaluación según formulación 6.3).
- «Diseñar todo UML posible»: solo los diagramas que explican el alcance del proyecto.

---

## Criterio de estabilidad del alcance

El diseño (2.1 en adelante) avanza sobre la formulación y el IEEE 830 vigentes. Un cambio menor de redacción no obliga a rehacer diagramas; un cambio de métrica norte o de incluir recaudo de dinero sí obliga a volver al análisis.
