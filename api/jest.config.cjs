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
  // Umbral vigente en main: el de la semana 2, que la semana 3 no bajó. El comando `npm test` falla si la lógica medida baja de aquí. La subida al piso de la semana 4 está en el pull request #12.
  coverageThreshold: {
    global: {
      lines: 47,
      statements: 47,
      functions: 43,
      branches: 37,
    },
  },
};
