import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Forgot Password Page Object Model
 */
export class ForgotPasswordPage extends BasePage {
  readonly selectors = {
    emailInput: 'input[name="email"], input#email, input[type="email"]',
    submitButton: 'button[type="submit"]',
    backToLoginLink: 'a[href*="login"]',
    errorContainer: '[class*="destructive"]',
  };

  constructor(page: Page, locale: string = 'en') {
    super(page, locale);
  }

  async goto() {
    await super.goto('/forgot-password');
  }

  async fillEmail(email: string) {
    await this.fillField(this.selectors.emailInput, email);
  }

  async submit() {
    await this.clickElement(this.selectors.submitButton);
  }

  async requestReset(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  async clickBackToLogin() {
    await this.clickElement(this.selectors.backToLoginLink);
  }

  // Assertions
  async expectForgotPasswordFormVisible() {
    await this.expectElementVisible(this.selectors.emailInput);
    await this.expectElementVisible(this.selectors.submitButton);
  }

  async expectSuccessState() {
    await this.expectTextOnPage('Check your email', 10000);
  }

  async expectErrorMessage(message?: string) {
    const errorLocator = this.page.locator(this.selectors.errorContainer).first();
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(errorLocator).toContainText(message);
    }
  }
}
