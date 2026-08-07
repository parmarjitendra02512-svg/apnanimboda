import { test, expect } from '@playwright/test';

test('login page has title and login button', async ({ page }) => {
  await page.goto('/login');
  
  // Expect title to be present
  await expect(page).toHaveTitle(/Apna Nimboda/);
  
  // Expect Login button
  const loginButton = page.getByRole('button', { name: /Sign In/i });
  await expect(loginButton).toBeVisible();
});

test('forgot password flow toggles correctly', async ({ page }) => {
  await page.goto('/login');
  
  // Click forgot password
  await page.getByText('Forgot Password?').click();
  
  // Expect Father's Name input to appear
  const fatherInput = page.getByPlaceholder(/father's name/i);
  await expect(fatherInput).toBeVisible();
  
  // Button should say Reset Password
  const resetBtn = page.getByRole('button', { name: /Reset Password/i });
  await expect(resetBtn).toBeVisible();
});
