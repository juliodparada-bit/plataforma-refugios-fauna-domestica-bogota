import { expect, test } from '@playwright/test';

test('muestra una alerta si la contraseña no es la de la cuenta', async ({ page }) => {
  // Arrange: el API real responde el mismo mensaje si el correo no existe o la clave no sirve.
  await page.goto('/');

  // Act
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Entrar' }).click();
  await page.getByLabel('Correo').fill('ada@mestizo.test');
  await page.getByLabel('Contraseña').fill('clave-que-no-es');
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click();

  // Assert
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.');
});
