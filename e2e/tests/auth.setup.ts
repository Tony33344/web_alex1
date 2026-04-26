import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { generateTestUser, generateTestAdmin, supabaseAdmin, cleanupAllTestUsers } from '../utils/test-utils';
import path from 'path';
import fs from 'fs';

/**
 * Global Setup for Authentication State
 * Creates persistent auth files for logged-in user and admin
 */

const authDir = path.join(__dirname, '../.auth');

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

export const userAuthFile = path.join(authDir, 'user.json');
export const adminAuthFile = path.join(authDir, 'admin.json');

setup.describe('Setup Authentication State', () => {
  setup.beforeAll(async () => {
    // Clean up any existing test users
    await cleanupAllTestUsers();
  });

  setup('authenticate as regular user', async ({ page, context }) => {
    const userData = generateTestUser('persisted');
    
    // Create user via API
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { full_name: userData.full_name },
    });
    
    if (error) {
      console.log('User creation error (may already exist):', error.message);
    }

    const loginPage = new LoginPage(page, 'en');
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    await loginPage.expectRedirectToWelcome();

    // Save storage state
    await context.storageState({ path: userAuthFile });
  });

  setup('authenticate as admin', async ({ page, context }) => {
    const adminData = generateTestAdmin();
    
    // Create admin user via API
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: { full_name: adminData.full_name },
    });
    
    if (error) {
      console.log('Admin creation error:', error.message);
    } else if (authData.user) {
      // Set admin role
      await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
    }

    const loginPage = new LoginPage(page, 'en');
    await loginPage.goto();
    await loginPage.login(adminData.email, adminData.password);
    await loginPage.expectRedirectToAdmin();

    // Save storage state
    await context.storageState({ path: adminAuthFile });
  });
});
