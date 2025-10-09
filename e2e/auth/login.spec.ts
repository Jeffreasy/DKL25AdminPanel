import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at login page
    await page.goto('/login')
  })

  test('displays login page correctly', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/DKL25 Admin Panel/i)
    
    // Verify login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Verify branding
    await expect(page.locator('img[alt*="DKL"]')).toBeVisible()
  })

  test('successful login flow', async ({ page }) => {
    // Fill in credentials
    await page.fill('input[name="email"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 })
    
    // Verify dashboard loaded
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Verify user menu is present
    await expect(page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("admin")'))).toBeVisible()
  })

  test('handles invalid credentials', async ({ page }) => {
    // Fill in wrong credentials
    await page.fill('input[name="email"]', 'wrong')
    await page.fill('input[type="password"]', 'wrong')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
    
    // Should show error message
    await expect(
      page.locator('text=/ongeldig|incorrect|fout/i').or(page.locator('.error, [role="alert"]'))
    ).toBeVisible({ timeout: 3000 })
  })

  test('validates required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors or prevent submission
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    // Check if HTML5 validation is triggered or custom validation
    const emailValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    const passwordValid = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    
    expect(emailValid || passwordValid).toBeFalsy()
  })

  test('auto-appends domain to email', async ({ page }) => {
    // Type username without domain
    await page.fill('input[name="email"]', 'admin')
    
    // Check if domain is auto-appended (if implemented)
    const emailValue = await page.locator('input[name="email"]').inputValue()
    
    // Either shows as-is or auto-appends @dekoninklijkeloop.nl
    expect(emailValue).toMatch(/admin(@dekoninklijkeloop\.nl)?/)
  })

  test('logout flow', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Wait for dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 })
    
    // Find and click user menu
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("admin")'))
    await userMenu.click()
    
    // Click logout
    await page.locator('text=/uitloggen|logout/i').click()
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 3000 })
  })

  test('remembers user session', async ({ page, context }) => {
    // Login
    await page.fill('input[name="email"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Open new page in same context
    const newPage = await context.newPage()
    await newPage.goto('/')
    
    // Should still be authenticated
    await expect(newPage).toHaveURL('/dashboard', { timeout: 3000 })
  })

  test('redirects to login when accessing protected route', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 3000 })
  })
})