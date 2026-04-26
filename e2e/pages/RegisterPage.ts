import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Registration Page Object Model
 */
export class RegisterPage extends BasePage {
  readonly selectors = {
    fullNameInput: 'input[name="full_name"], input#full_name',
    emailInput: 'input[name="email"], input#email',
    phoneInput: 'input[name="phone"], input#phone',
    passwordInput: 'input[name="password"], input#password',
    confirmPasswordInput: 'input[name="confirm_password"], input#confirm_password',
    languageSelect: 'select[name="preferred_language"], select#preferred_language',
    termsCheckbox: 'input[name="accept_terms"], input#accept_terms',
    newsletterCheckbox: 'input[name="subscribe_newsletter"], input#subscribe_newsletter',
    submitButton: 'button[type="submit"]',
    loginLink: 'a[href*="login"]',
    errorContainer: '[class*="destructive"]',
  };

  constructor(page: Page, locale: string = 'en') {
    super(page, locale);
  }

  async goto(redirect?: string) {
    const path = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';
    await super.goto(path);
  }

  // Form fill methods
  async fillFullName(name: string) {
    await this.fillField(this.selectors.fullNameInput, name);
  }

  async fillEmail(email: string) {
    await this.fillField(this.selectors.emailInput, email);
  }

  async fillPhone(phone: string) {
    await this.fillField(this.selectors.phoneInput, phone);
  }

  async fillPassword(password: string) {
    await this.fillField(this.selectors.passwordInput, password);
  }

  async fillConfirmPassword(password: string) {
    await this.fillField(this.selectors.confirmPasswordInput, password);
  }

  async selectLanguage(language: string) {
    await this.selectOption(this.selectors.languageSelect, language);
  }

  async acceptTerms() {
    await this.checkCheckbox(this.selectors.termsCheckbox);
  }

  async optInNewsletter(optIn: boolean = true) {
    if (optIn) {
      await this.checkCheckbox(this.selectors.newsletterCheckbox);
    } else {
      await this.uncheckCheckbox(this.selectors.newsletterCheckbox);
    }
  }

  async submit() {
    await this.clickElement(this.selectors.submitButton);
  }

  // Complete registration
  async register(data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    preferred_language?: string;
    accept_terms?: boolean;
    subscribe_newsletter?: boolean;
  }) {
    await this.fillFullName(data.full_name);
    await this.fillEmail(data.email);
    await this.fillPhone(data.phone);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.password);
    
    if (data.preferred_language) {
      await this.selectLanguage(data.preferred_language);
    }
    
    if (data.accept_terms !== false) {
      await this.acceptTerms();
    }
    
    if (data.subscribe_newsletter) {
      await this.optInNewsletter(true);
    }
    
    await this.submit();
  }

  // Assertions
  async expectRegistrationFormVisible() {
    await this.expectElementVisible(this.selectors.fullNameInput);
    await this.expectElementVisible(this.selectors.emailInput);
    await this.expectElementVisible(this.selectors.passwordInput);
    await this.expectElementVisible(this.selectors.confirmPasswordInput);
    await this.expectElementVisible(this.selectors.termsCheckbox);
  }

  async expectSuccessState() {
    await this.expectTextOnPage('Check Your Email', 10000);
    await this.expectElementVisible('text=Sign In');
  }

  async expectFieldError(fieldName: string, message?: string) {
    // Find error message associated with field
    const field = this.page.locator(`[name="${fieldName}"], #${fieldName}`).first();
    const parent = field.locator('..').locator('..'); // Go up to form group
    const error = parent.locator(this.selectors.errorContainer).or(
      this.page.locator(`[for="${fieldName}"] + * ${this.selectors.errorContainer}`)
    );
    
    await expect(error.first()).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(error.first()).toContainText(message);
    }
  }

  async expectErrorForField(fieldName: string) {
    const input = this.page.locator(`input[name="${fieldName}"], input#${fieldName}`).first();
    const parent = input.locator('xpath=ancestor::*[contains(@class, "space-y")][1]');
    const error = parent.locator('p.text-destructive, [class*="destructive"]');
    await expect(error.first()).toBeVisible({ timeout: 5000 });
  }

  async expectPasswordMismatchError() {
    await this.expectErrorForField('confirm_password');
  }

  async expectTermsError() {
    await this.expectErrorForField('accept_terms');
  }
}
