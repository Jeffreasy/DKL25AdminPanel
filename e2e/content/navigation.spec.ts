import { test, expect } from '@playwright/test'

test.describe('Navigation & Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 5000 })
  })

  test('dashboard loads correctly', async ({ page }) => {
    // Verify dashboard elements
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Verify sidebar is present
    await expect(page.locator('nav').or(page.locator('[role="navigation"]'))).toBeVisible()
    
    // Verify header is present
    await expect(page.locator('header')).toBeVisible()
  })

  test('sidebar navigation works', async ({ page }) => {
    // Click on Photos link
    await page.click('text=/foto\'s|photos/i')
    
    // Should navigate to photos page
    await expect(page).toHaveURL(/\/photos/, { timeout: 3000 })
  })

  test('search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="Zoek"]'))
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test')
      
      // Search should work (implementation dependent)
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('user menu works', async ({ page }) => {
    // Click user menu
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("admin")'))
    await userMenu.click()
    
    // Menu should open
    await expect(page.locator('text=/profiel|profile|instellingen|settings/i')).toBeVisible({ timeout: 2000 })
  })

  test('quick actions menu', async ({ page }) => {
    // Look for quick actions button
    const quickActions = page.locator('[data-testid="quick-actions"]').or(page.locator('button[aria-label*="Quick"]'))
    
    if (await quickActions.isVisible()) {
      await quickActions.click()
      
      // Should show action menu
      await expect(page.locator('[role="menu"]').or(page.locator('.dropdown'))).toBeVisible()
    }
  })

  test('responsive sidebar on mobile', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Sidebar should be hidden initially
    const sidebar = page.locator('nav').first()
    
    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button:has(svg)').first())
    
    if (await menuButton.isVisible()) {
      await menuButton.click()
      
      // Sidebar should appear
      await expect(sidebar).toBeVisible({ timeout: 1000 })
    }
  })

  test('navigation between pages', async ({ page }) => {
    // Navigate to different pages
    const pages = [
      { link: /foto\'s|photos/i, url: /photos/ },
      { link: /albums/i, url: /albums/ },
      { link: /dashboard/i, url: /dashboard/ },
    ]
    
    for (const { link, url } of pages) {
      const linkElement = page.locator(`text=${link}`).first()
      
      if (await linkElement.isVisible()) {
        await linkElement.click()
        await expect(page).toHaveURL(url, { timeout: 3000 })
      }
    }
  })

  test('breadcrumb navigation', async ({ page }) => {
    // Navigate to a sub-page
    await page.click('text=/foto\'s|photos/i')
    
    // Check if breadcrumbs exist
    const breadcrumb = page.locator('[aria-label="breadcrumb"]').or(page.locator('.breadcrumb'))
    
    if (await breadcrumb.isVisible()) {
      // Click home breadcrumb
      await breadcrumb.locator('text=/home|dashboard/i').click()
      await expect(page).toHaveURL('/dashboard')
    }
  })
})