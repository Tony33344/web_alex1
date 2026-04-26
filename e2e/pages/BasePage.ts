import { Page, Locator, expect } from '@playwright/test';
import { getLocalizedPath, DEFAULT_LOCALE } from '../utils/test-utils';

/**
 * Base Page Object Model for common page operations
 */
export class BasePage {
  constructor(protected page: Page, protected locale: string = DEFAULT_LOCALE) {}

  // Navigation
  async goto(path: string) {
    const localizedPath = getLocalizedPath(path, this.locale);
    await this.page.goto(localizedPath);
  }

  async gotoAbsolute(url: string) {
    await this.page.goto(url);
  }

  // URL assertions
  async expectUrlContains(text: string) {
    await expect(this.page).toHaveURL(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  async expectUrlToMatch(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  // Title assertions
  async expectTitleContains(text: string) {
    await expect(this.page).toHaveTitle(new RegExp(text, 'i'));
  }

  // Element visibility
  async expectElementVisible(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout });
  }

  async expectElementHidden(selector: string, timeout = 5000) {
    await expect(this.page.locator(selector).first()).toBeHidden({ timeout });
  }

  // Text assertions
  async expectTextOnPage(text: string, timeout = 5000) {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout });
  }

  async expectElementToContainText(selector: string, text: string) {
    await expect(this.page.locator(selector).first()).toContainText(text);
  }

  // Form operations
  async fillField(selector: string, value: string) {
    const field = this.page.locator(selector).first();
    await field.fill(value);
  }

  async clearAndFillField(selector: string, value: string) {
    const field = this.page.locator(selector).first();
    await field.clear();
    await field.fill(value);
  }

  async clickElement(selector: string) {
    await this.page.locator(selector).first().click();
  }

  async submitForm(buttonSelector: string = 'button[type="submit"]') {
    await this.page.locator(buttonSelector).first().click();
  }

  async checkCheckbox(selector: string) {
    await this.page.locator(selector).first().check();
  }

  async uncheckCheckbox(selector: string) {
    await this.page.locator(selector).first().uncheck();
  }

  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).first().selectOption(value);
  }

  // Wait operations
  async waitForNavigation(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToDisappear(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  // Loading states
  async waitForLoadingToFinish(loadingSelector: string = '[class*="animate-spin"]') {
    await this.page.waitForFunction(
      (sel) => !document.querySelector(sel),
      loadingSelector,
      { timeout: 10000 }
    );
  }

  // Error/Success states
  async expectErrorMessage(message: string, timeout = 5000) {
    const errorSelectors = [
      '[class*="destructive"]',
      '[class*="error"]',
      '[role="alert"]',
      'text=/error|Error|failed|Failed/i',
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector).filter({ hasText: new RegExp(message, 'i') });
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible({ timeout });
        return;
      }
    }
    
    throw new Error(`Error message "${message}" not found on page`);
  }

  async expectSuccessMessage(message: string, timeout = 5000) {
    const successSelectors = [
      '[class*="green"]',
      '[class*="success"]',
      '[data-sonner-toast]',
    ];
    
    for (const selector of successSelectors) {
      const element = this.page.locator(selector).filter({ hasText: new RegExp(message, 'i') });
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible({ timeout });
        return;
      }
    }
  }

  // Screenshots
  async screenshot(name: string) {
    await this.page.screenshot({ path: `./e2e/screenshots/${name}.png`, fullPage: true });
  }

  // Get page elements
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  // Auth state helpers
  async isAuthenticated(): Promise<boolean> {
    // Check for logout button or user menu
    const logoutButton = this.page.locator('text=Logout, text=Sign Out, button:has-text("Logout")').first();
    return await logoutButton.count() > 0 && await logoutButton.isVisible();
  }

  // Locale switching
  async switchLocale(newLocale: string) {
    const currentUrl = this.page.url();
    const newUrl = currentUrl.replace(`/${this.locale}/`, `/${newLocale}/`);
    await this.page.goto(newUrl);
    this.locale = newLocale;
  }
}
