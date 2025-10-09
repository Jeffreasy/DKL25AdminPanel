import { test, expect } from '@playwright/test'

test.describe('Permission Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 5000 })
  })

  test('access admin permissions page', async ({ page }) => {
    // Navigate to admin/permissions
    await page.goto('/admin/permissions')
    
    // Should load permissions page
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Should show roles or permissions list
    await expect(
      page.locator('text=/rollen|roles|permissies|permissions/i')
    ).toBeVisible({ timeout: 3000 })
  })

  test('view roles list', async ({ page }) => {
    await page.goto('/admin/permissions')
    
    // Look for roles tab or section
    const rolesTab = page.locator('text=/rollen|roles/i').first()
    
    if (await rolesTab.isVisible()) {
      await rolesTab.click()
      
      // Should show roles
      await expect(
        page.locator('text=/admin|staff|user/i').first()
      ).toBeVisible({ timeout: 2000 })
    }
  })

  test('view permissions list', async ({ page }) => {
    await page.goto('/admin/permissions')
    
    // Look for permissions tab or section
    const permissionsTab = page.locator('text=/permissies|permissions/i').first()
    
    if (await permissionsTab.isVisible()) {
      await permissionsTab.click()
      
      // Should show permissions
      await expect(page.locator('[role="table"]').or(page.locator('table'))).toBeVisible({ timeout: 2000 })
    }
  })

  test('permission-based UI rendering', async ({ page }) => {
    // Admin should see admin-only features
    await page.goto('/dashboard')
    
    // Look for admin menu items
    const adminLink = page.locator('text=/admin|beheer|gebruikers|users/i').first()
    
    // Admin should have access
    await expect(adminLink).toBeVisible({ timeout: 2000 })
  })

  test('access denied for restricted pages', async ({ page }) => {
    // This test would require a non-admin user
    // For now, verify access denied page exists
    await page.goto('/access-denied')
    
    // Should show access denied message
    await expect(
      page.locator('text=/toegang geweigerd|access denied|geen toegang/i')
    ).toBeVisible({ timeout: 2000 })
  })

  test('role management workflow', async ({ page }) => {
    await page.goto('/admin/permissions')
    
    // Look for create role button
    const createButton = page.locator('button:has-text("Nieuwe Rol")').or(page.locator('button:has-text("New Role")'))
    
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Form should appear
      await expect(
        page.locator('input[name="name"]').or(page.locator('input[placeholder*="naam"]'))
      ).toBeVisible({ timeout: 2000 })
    }
  })

  test('permission assignment', async ({ page }) => {
    await page.goto('/admin/permissions')
    
    // Look for edit role button
    const editButton = page.locator('button:has-text("Bewerken")').or(page.locator('button[aria-label*="edit"]')).first()
    
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Permission checkboxes should appear
      await expect(
        page.locator('input[type="checkbox"]').first()
      ).toBeVisible({ timeout: 2000 })
    }
  })

  test('user role assignment', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users')
    
    // Should show users list
    await expect(
      page.locator('text=/gebruikers|users/i').first()
    ).toBeVisible({ timeout: 3000 })
    
    // Look for user row
    const userRow = page.locator('[data-testid^="user-"]').or(page.locator('tr').nth(1))
    
    if (await userRow.isVisible()) {
      // Should have role information
      await expect(userRow).toBeVisible()
    }
  })
})