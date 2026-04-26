import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { generateTestUser, generateTestAdmin, supabaseAdmin, getLocalizedPath } from '../utils/test-utils';

/**
 * Authentication Test Suite (10 tests)
 * Covers: registration, login, password reset, session management
 */

test.describe('Authentication', () => {
  const locale = 'en';

  test.describe('Registration', () => {
    test('1. Successful user registration shows email confirmation', async ({ page }) => {
      const registerPage = new RegisterPage(page, locale);
      const userData = generateTestUser();

      await registerPage.goto();
      await registerPage.expectRegistrationFormVisible();

      await registerPage.register({
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        preferred_language: 'en',
        accept_terms: true,
        subscribe_newsletter: false,
      });

      await registerPage.expectSuccessState();

      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser((await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single()).data?.id!).catch(() => {});
    });

    test('2. Registration validation - empty fields show errors', async ({ page }) => {
      const registerPage = new RegisterPage(page, locale);
      await registerPage.goto();
      await registerPage.submit();

      // Should show validation errors
      await expect(page.locator('p.text-destructive, [class*="destructive"]').first()).toBeVisible({ timeout: 5000 });
    });

    test('3. Registration validation - password mismatch', async ({ page }) => {
      const registerPage = new RegisterPage(page, locale);
      await registerPage.goto();

      await registerPage.fillFullName('Test User');
      await registerPage.fillEmail('test@example.com');
      await registerPage.fillPhone('+41791234567');
      await registerPage.fillPassword('Password123');
      await registerPage.fillField('input[name="confirm_password"]', 'DifferentPass456');
      await registerPage.acceptTerms();
      await registerPage.submit();

      await registerPage.expectPasswordMismatchError();
    });

    test('4. Registration validation - terms not accepted', async ({ page }) => {
      const registerPage = new RegisterPage(page, locale);
      const userData = generateTestUser();

      await registerPage.goto();
      await registerPage.fillFullName(userData.full_name);
      await registerPage.fillEmail(userData.email);
      await registerPage.fillPhone(userData.phone);
      await registerPage.fillPassword(userData.password);
      await registerPage.fillConfirmPassword(userData.password);
      // Do NOT check terms
      await registerPage.submit();

      await registerPage.expectTermsError();
    });

    test('5. Registration validation - invalid email format', async ({ page }) => {
      const registerPage = new RegisterPage(page, locale);
      await registerPage.goto();

      await registerPage.fillEmail('invalid-email');
      await registerPage.fillPassword('Password123');
      await registerPage.submit();

      await expect(page.locator('text=/valid email/i').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    test('6. Successful login redirects to welcome page', async ({ page }) => {
      const loginPage = new LoginPage(page, locale);
      const userData = generateTestUser();

      // Create user via API
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { full_name: userData.full_name },
      });
      expect(error).toBeNull();

      await loginPage.goto();
      await loginPage.login(userData.email, userData.password);
      await loginPage.expectRedirectToWelcome();

      // Cleanup
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', userData.email).single();
      if (data?.id) await supabaseAdmin.auth.admin.deleteUser(data.id).catch(() => {});
    });

    test('7. Login with redirect parameter redirects correctly', async ({ page }) => {
      const loginPage = new LoginPage(page, locale);
      const userData = generateTestUser();

      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
      expect(error).toBeNull();

      await loginPage.goto('/membership');
      await loginPage.login(userData.email, userData.password);
      await loginPage.expectRedirectToUrl('/membership');

      // Cleanup
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', userData.email).single();
      if (data?.id) await supabaseAdmin.auth.admin.deleteUser(data.id).catch(() => {});
    });

    test('8. Login with invalid password shows error', async ({ page }) => {
      const loginPage = new LoginPage(page, locale);
      const userData = generateTestUser();

      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
      expect(error).toBeNull();

      await loginPage.goto();
      await loginPage.login(userData.email, 'WrongPassword123');
      await loginPage.expectErrorMessage();

      // Cleanup
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', userData.email).single();
      if (data?.id) await supabaseAdmin.auth.admin.deleteUser(data.id).catch(() => {});
    });

    test('9. Admin login redirects to admin dashboard', async ({ page }) => {
      const loginPage = new LoginPage(page, locale);
      const adminData = generateTestAdmin();

      const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: { full_name: adminData.full_name },
      });
      expect(error).toBeNull();

      // Set admin role
      if (authData.user) {
        await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
      }

      await loginPage.goto();
      await loginPage.login(adminData.email, adminData.password);
      await loginPage.expectRedirectToAdmin();

      // Cleanup
      if (authData.user) await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    });

    test('10. Email confirmed success message shows after confirmation link', async ({ page }) => {
      const loginPage = new LoginPage(page, locale);
      
      // Simulate visiting with confirmed param
      await page.goto(getLocalizedPath('/login?confirmed=true'));
      await loginPage.expectEmailConfirmedSuccess();
    });
  });

  test.describe('Forgot Password', () => {
    test('11. Forgot password form submission shows success', async ({ page }) => {
      const forgotPage = new ForgotPasswordPage(page, locale);
      const userData = generateTestUser();

      // Create user first
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      await forgotPage.goto();
      await forgotPage.requestReset(userData.email);
      await forgotPage.expectSuccessState();

      // Cleanup
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', userData.email).single();
      if (data?.id) await supabaseAdmin.auth.admin.deleteUser(data.id).catch(() => {});
    });

    test('12. Forgot password with invalid email shows error', async ({ page }) => {
      const forgotPage = new ForgotPasswordPage(page, locale);
      await forgotPage.goto();
      
      // Fill invalid email and submit
      await forgotPage.fillEmail('not-an-email');
      await forgotPage.submit();
      
      // Should show validation error
      await expect(page.locator('[class*="destructive"]').first()).toBeVisible({ timeout: 5000 });
    });
  });
});
