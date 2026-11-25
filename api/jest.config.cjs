/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    // Arranque del proceso: no tiene reglas de negocio.
    '!main.ts',
    // Adaptador de Prisma: se prueba con integración contra PostgreSQL (semana 6).
    '!prisma/**',
    // Módulos de Nest: solo cablean proveedores, sin reglas.
    '!**/*.module.ts',
    // Los tests no entran en el porcentaje.
    '!**/*.spec.ts',
    '!**/*.test.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // El piso de la semana 6. El comando `npm test` falla si la lógica medida baja de aquí.
  coverageThreshold: {
    global: {
      lines: 88,
      statements: 88,
      functions: 92,
      branches: 70,
    },
  },
};
