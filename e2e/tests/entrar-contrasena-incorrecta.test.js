import { expect, test } from '@playwright/test';

test('muestra una alerta si la contraseña no es la de la cuenta', async ({ page }) => {
  // Arrange: visitante, y el API responde el mismo mensaje que AuthService.
  // Stub de la respuesta HTTP para no usar la base de desarrollo.
  await page.route('**/api/auth/yo', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Debes iniciar sesión.' }),
    }),
  );
  await page.route('**/api/auth/entrar', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Correo o contraseña incorrectos.' }),
    }),
  );

  await page.goto('/');

  // Act
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Entrar' }).click();
  await page.getByLabel('Correo').fill('ada@mestizo.test');
  await page.getByLabel('Contraseña').fill('clave-que-no-es');
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click();

  // Assert
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.');
});
