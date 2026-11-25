# Camino de auditoría

Un instructor que revise el bootcamp de pruebas de Julio David Parada León sigue este orden. El repositorio es la fuente de verdad. Una conversación de Cursor no la sustituye.

1. Rama `main`, commit del merge del PR #11. Ahí están fusionadas las semanas 1, 2, 3 y el código de la semana 4.
2. Umbrales vigentes, leídos de los archivos y no de la prosa vieja:
   - `web/vite.config.ts`: líneas 75, sentencias 75, ramas 77, funciones 70, `testTimeout` 20000.
   - `api/jest.config.cjs`: líneas 47, sentencias 47, funciones 43, ramas 37.
3. Pull requests fusionados, en este orden: #6 semana 1, #7 semana 2, #8 umbral de la semana 2, #9 semana 3 (incluye el commit `040b6c4` de Brayan), #10 umbral del frontend, #11 contrato HTTP de animales.
4. `docs/matriz-rotacion.md` para la capa de cada semana y para lo que falta por fusionar.
5. Pull requests abiertos, que no parten de este `main`:
   - #12 sube el umbral del backend y sigue sin revisión.
   - #13 es la semana 5.
   - #14 es la semana 6.
   - #15 corrige tipos de `vite.config.ts` y también parte de un `main` anterior.
6. El PR #5 está cerrado y no se fusionó. No es el cierre de las seis semanas.

Para correr lo que sí está en `main`: `npm test` en `web/`, `npm test` en `api/`, y `pnpm test tests/entrar-contrasena-incorrecta.test.js` en `e2e/`.

Los jobs del CI son `frontend`, `backend` y `evidencia-individual`, en `.github/workflows/tests.yml`.
