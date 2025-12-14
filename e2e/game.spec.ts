import { test, expect } from '@playwright/test';

test.describe('FarmIQ Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display start screen', async ({ page }) => {
    // Check that the start screen is visible
    await expect(page.locator('text=FarmIQ')).toBeVisible();
  });

  test('should start new game', async ({ page }) => {
    // Click the new game button
    const newGameButton = page.locator('button:has-text("새 게임")');
    await expect(newGameButton).toBeVisible();
    await newGameButton.click();

    // Wait for game screen to load
    await expect(page.locator('[data-testid="game-layout"]')).toBeVisible({
      timeout: 5000
    });
  });

  test('should display HUD elements', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Check HUD elements
    await expect(page.locator('[data-testid="game-hud"]')).toBeVisible();
    await expect(page.locator('[data-testid="money-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
  });

  test('should display sensor dashboard', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Check sensor dashboard
    await expect(page.locator('[data-testid="sensor-dashboard"]')).toBeVisible();
  });

  test('should display farm grid', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Check farm grid
    await expect(page.locator('[data-testid="farm-grid"]')).toBeVisible();
  });

  test('should pause and resume game', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Find and click pause button
    const pauseButton = page.locator('[data-testid="pause-button"]');
    await pauseButton.click();

    // Verify game is paused (check for paused state indicator)
    await expect(page.locator('[data-testid="paused-indicator"]')).toBeVisible();

    // Click again to resume
    await pauseButton.click();

    // Verify game is resumed
    await expect(page.locator('[data-testid="paused-indicator"]')).not.toBeVisible();
  });

  test('should change game speed', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Find speed control
    const speedButton = page.locator('[data-testid="speed-button"]');
    await expect(speedButton).toBeVisible();

    // Click to change speed
    await speedButton.click();

    // Speed should have changed (look for 2x indicator)
    await expect(speedButton).toContainText('2x');
  });

  test('should show crop selector on empty cell click', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Click on an empty farm cell
    const emptyCell = page.locator('[data-testid="farm-cell-0-0"]');
    await emptyCell.click();

    // Crop selector modal should appear
    await expect(page.locator('[data-testid="crop-selector"]')).toBeVisible();
  });

  test('should plant a crop', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Click on an empty farm cell
    await page.click('[data-testid="farm-cell-0-0"]');

    // Select lettuce from crop selector
    await page.click('[data-testid="crop-option-lettuce"]');

    // The cell should now have a crop
    await expect(page.locator('[data-testid="farm-cell-0-0"] [data-testid="crop-tile"]')).toBeVisible();
  });

  test('should show equipment panel', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Find and click equipment tab
    await page.click('[data-testid="equipment-tab"]');

    // Equipment panel should be visible
    await expect(page.locator('[data-testid="equipment-panel"]')).toBeVisible();
  });

  test('should navigate to shop', async ({ page }) => {
    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Find and click shop tab
    await page.click('[data-testid="shop-tab"]');

    // Shop panel should be visible
    await expect(page.locator('[data-testid="shop-panel"]')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to page
    await page.goto('/');

    // Start a new game
    await page.click('button:has-text("새 게임")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-layout"]');

    // Game should still be functional
    await expect(page.locator('[data-testid="game-hud"]')).toBeVisible();
    await expect(page.locator('[data-testid="farm-grid"]')).toBeVisible();
  });
});
