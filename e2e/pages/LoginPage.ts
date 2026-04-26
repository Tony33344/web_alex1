import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 */
export class LoginPage extends BasePage {
  readonly selectors = {
    emailInput: 'input[name="email"], input#email, input[type="email"]',
    passwordInput: 'input[name="password"], input#password, input[type="password"]',
    submitButton: 'button[type="submit"]',
    forgotPasswordLink: 'a[href*="forgot-password"], text=Forgot password',
    registerLink: 'a[href*="register"], text=Sign up',
    errorContainer: '[class*="destructive"], [class*="error"]',
    successContainer: '[class*="green"], [class*="success"]',
  };

  constructor(page: Page, locale: string = 'en') {
    super(page, locale);
  }

  async goto(redirect?: string) {
    const path = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
    await super.goto(path);
  }

  async fillEmail(email: string) {
    await this.fillField(this.selectors.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.fillField(this.selectors.passwordInput, password);
  }

  async fillCredentials(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  async submit() {
    await this.clickElement(this.selectors.submitButton);
  }

  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async clickForgotPassword() {
    await this.clickElement(this.selectors.forgotPasswordLink);
  }

  async clickRegister() {
    await this.clickElement(this.selectors.registerLink);
  }

  // Assertions
  async expectLoginFormVisible() {
    await this.expectElementVisible(this.selectors.emailInput);
    await this.expectElementVisible(this.selectors.passwordInput);
    await this.expectElementVisible(this.selectors.submitButton);
  }

  async expectErrorMessage(message?: string) {
    const errorLocator = this.page.locator(this.selectors.errorContainer).first();
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(errorLocator).toContainText(message);
    }
  }

  async expectEmailConfirmedSuccess() {
    await this.expectTextOnPage('Email confirmed', 5000);
  }

  async expectRedirectToWelcome() {
    await this.expectUrlContains('/welcome');
  }

  async expectRedirectToAdmin() {
    await this.expectUrlContains('/admin');
  }

  async expectRedirectToUrl(url: string) {
    await this.expectUrlContains(url);
  }
}

import { expect } from '@playwright/test';
