# E2E Test Suite

Comprehensive Playwright E2E tests for Infinity Role Teachers platform.

## Test Structure

```
e2e/
├── pages/              # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── ForgotPasswordPage.ts
│   ├── AdminDashboardPage.ts
│   ├── EventsPage.ts
│   ├── MembershipPage.ts
│   └── index.ts
├── tests/              # Test suites
│   ├── auth.setup.ts   # Auth state setup
│   ├── auth.spec.ts    # Authentication tests (12 tests)
│   ├── admin.spec.ts   # Admin dashboard tests (6 tests)
│   ├── membership.spec.ts # Membership tests (4 tests)
│   ├── events.spec.ts  # Event system tests (7 tests)
│   ├── i18n.spec.ts    # Localization tests (4 tests)
│   └── edge-cases.spec.ts # Edge cases (5 tests)
├── fixtures/           # Test fixtures
│   └── auth.ts
├── utils/              # Test utilities
│   └── test-utils.ts
├── .auth/              # Auth state storage (gitignored)
└── README.md
```

## Test Count: 38 Tests

| Suite | Tests | Description |
|-------|-------|-------------|
| auth | 12 | Registration, login, password reset |
| admin | 6 | Dashboard, access control, user mgmt |
| membership | 4 | Plans, payments, access control |
| events | 7 | Listing, registration, capacity |
| i18n | 4 | Locale switching, translations |
| edge-cases | 5 | 404s, loading states, responsive |

## Setup

### 1. Environment Configuration

Copy the example env file and fill in values:

```bash
cp e2e/.env.test.example e2e/.env.test
```

Add your Supabase credentials (same as main app).

### 2. Supabase Email Confirmation (Local Testing)

For local testing, disable email confirmation in Supabase:

1. Go to Supabase Dashboard → Authentication → Settings
2. Toggle "Enable email confirmations" OFF
3. This allows immediate login after registration in tests

**⚠️ Keep email confirmation ON in production!**

### 3. Browser Configuration (Ubuntu 26.04)

The test suite uses your installed **Brave** browser (Chromium-based) for tests. 

The config is already set up to use `/usr/bin/brave-browser`. If Brave is in a different location:

```bash
# Check Brave location
which brave-browser

# Set custom path if needed
export BRAVE_PATH=/path/to/brave
```

Firefox is also configured at `/usr/bin/firefox`.

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (interactive debugging)
npm run test:e2e:ui

# Run headed (visible browser)
npm run test:e2e:headed

# Run debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/tests/auth.spec.ts

# Run specific test by name
npx playwright test -g "Successful login"

# View HTML report
npm run test:e2e:report
```

## Writing New Tests

1. Create Page Object in `e2e/pages/` if needed
2. Add tests to appropriate `.spec.ts` file
3. Use test fixtures for authenticated states
4. Clean up test data in `afterEach` hooks

Example:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('my new test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await loginPage.expectRedirectToWelcome();
});
```

## Troubleshooting

### Browser Not Found

If tests fail with "browser not found" or executable path errors:

```bash
# Verify Brave location
ls -la /usr/bin/brave-browser

# If Brave is at a different path, set the env var
export BRAVE_PATH=/usr/bin/brave  # or wherever it's located
```

### Tests Fail on First Run

Run the setup first to create auth states:
```bash
npm run test:e2e:setup
```

### Supabase Connection Errors

Verify `.env.test` has correct credentials matching your main `.env.local`.

### Port Already in Use

If port 3000 is busy, the tests won't start. Either:
- Stop the existing dev server
- Or set `PLAYWRIGHT_BASE_URL` to your running server
