import { test, expect } from '@playwright/test';

test.describe('Admin Happy Path', () => {
  test('completes full admin workflow', async ({ page }) => {
    // 1. Register successfully
    await page.goto('/register');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Name"]', 'Test Admin');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.fill('input[placeholder="Confirm Password"]', 'password123');
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL('/dashboard');

    // 2. Create a new game successfully
    await page.fill('input[placeholder="New Game Name"]', 'Test Game');
    await page.click('button:has-text("Add Game")');
    await expect(page.locator('text=Test Game')).toBeVisible();

    // 3. Start a game successfully
    const gameCard = page.locator('text=Test Game').first();
    await gameCard.click();
    await page.click('button:has-text("Start Session")');
    const sessionId = await page.locator('text=Session ID:').textContent();
    expect(sessionId).toMatch(/Session ID: \d+/);

    // 4. End a game successfully
    await page.click('button:has-text("End Session")');
    await page.click('button:has-text("Yes")');
    await expect(page).toHaveURL(/\/session\/\d+\/results/);

    // 5. Load the results page successfully
    await expect(page.locator('text=Top Players')).toBeVisible();
    await expect(page.locator('text=Question Accuracy')).toBeVisible();
    await expect(page.locator('text=Average Response Time')).toBeVisible();

    // 6. Log out of the application successfully
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // 7. Log back into the application successfully
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('handles form validation', async ({ page }) => {
    // Test registration form validation
    await page.goto('/register');
    await page.click('button:has-text("Register")');
    await expect(page.locator('input[placeholder="Email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('input[placeholder="Password"]')).toHaveAttribute('aria-invalid', 'true');

    // Test password mismatch
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.fill('input[placeholder="Confirm Password"]', 'password456');
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();

    // Test login form validation
    await page.goto('/login');
    await page.click('button:has-text("Login")');
    await expect(page.locator('input[placeholder="Email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('input[placeholder="Password"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('handles game creation validation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Test empty game name
    await page.click('button:has-text("Add Game")');
    await expect(page.locator('input[placeholder="New Game Name"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('handles session management', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Login")');

    // Create and start a game
    await page.fill('input[placeholder="New Game Name"]', 'Test Game');
    await page.click('button:has-text("Add Game")');
    await page.locator('text=Test Game').first().click();
    await page.click('button:has-text("Start Session")');

    // Test session controls
    await expect(page.locator('button:has-text("Next Question")')).toBeVisible();
    await expect(page.locator('button:has-text("End Session")')).toBeVisible();

    // Test session results
    await page.click('button:has-text("End Session")');
    await page.click('button:has-text("Yes")');
    await expect(page).toHaveURL(/\/session\/\d+\/results/);
    await expect(page.locator('text=Top Players')).toBeVisible();
  });
}); 