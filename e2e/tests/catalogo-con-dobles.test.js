import { expect, test } from '@playwright/test';

async function visitante(page) {
  await page.route('**/api/auth/yo', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Debes iniciar sesión.' }),
    }),
  );
  await page.route('**/api/localidades', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

test('el catálogo dice que no hay historias cuando el API responde una lista vacía', async ({ page }) => {
  // Doble: stub. La lista vacía es un estado difícil de garantizar en la base de piloto.
  await visitante(page);
  await page.route('**/api/animales**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Catálogo' }).click();

  await expect(page.getByRole('heading', { name: 'Aún no hay historias publicadas' })).toBeVisible();
});

test('el catálogo avisa si el API no responde', async ({ page }) => {
  // Doble: stub que corta la red. No se puede pedir este fallo al backend real sin apagarlo.
  await visitante(page);
  await page.route('**/api/animales**', (route) => route.abort('failed'));
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Catálogo' }).click();

  await expect(page.getByRole('alert')).toContainText('No pude conectar con la API');
});

test('entrar muestra el error de validación que devuelve el API', async ({ page }) => {
  // Doble: stub de un 400 con el arreglo de mensajes que Nest manda.
  await visitante(page);
  await page.route('**/api/auth/entrar', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ message: ['correo debe ser un email'] }),
    }),
  );
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Entrar' }).click();
  await page.getByLabel('Correo').fill('ada@mestizo.test');
  await page.getByLabel('Contraseña').fill('Correcta123');
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('alert')).toContainText('correo debe ser un email');
});
