"""
Pytest configuration and shared fixtures for Infinity Role Teachers E2E tests.
Uses pytest-playwright for browser automation.
"""
import pytest
import requests
import json
import random
import string
import time
from pathlib import Path
from playwright.sync_api import expect

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"
MAILHOG_API = "http://localhost:8025/api/v2"


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context for all tests."""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
        "record_video_dir": "/tmp/test_videos/",
    }


@pytest.fixture
def test_email():
    """Generate a unique test email for each test."""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture(autouse=True)
def clear_emails_before_test():
    """Clear Mailhog inbox before each test."""
    try:
        requests.delete(f"{MAILHOG_API}/messages")
    except Exception:
        pass
    yield


@pytest.fixture
def mailhog():
    """Mailhog helper object."""
    return MailhogHelper()


@pytest.fixture
def stripe_helper():
    """Stripe test helper."""
    return StripeHelper()


class MailhogHelper:
    """Helper for interacting with Mailhog API."""

    def clear(self):
        try:
            requests.delete(f"{MAILHOG_API}/messages")
        except Exception as e:
            print(f"Warning: Could not clear Mailhog: {e}")

    def get_emails(self, recipient=None, subject_contains=None):
        """Get emails from Mailhog, optionally filtered."""
        try:
            if recipient:
                url = f"{MAILHOG_API}/search"
                params = {"kind": "to", "query": recipient}
            else:
                url = f"{MAILHOG_API}/messages"
                params = {}

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])

            if subject_contains:
                items = [
                    e for e in items
                    if subject_contains in e.get("Content", {}).get("Headers", {}).get("Subject", [""])[0]
                ]
            return items
        except Exception as e:
            print(f"Mailhog fetch error: {e}")
            return []

    def wait_for_email(self, subject_contains=None, recipient=None, timeout=30):
        """Wait for an email matching criteria."""
        start = time.time()
        while time.time() - start < timeout:
            emails = self.get_emails(recipient=recipient, subject_contains=subject_contains)
            if emails:
                return emails[0]
            time.sleep(1)
        return None

    def count_emails(self):
        """Count total emails in inbox."""
        try:
            response = requests.get(f"{MAILHOG_API}/messages", timeout=10)
            return len(response.json().get("items", []))
        except Exception:
            return 0


class StripeHelper:
    """Helper for Stripe test operations."""

    @staticmethod
    def mock_checkout_completed(page, user_email, amount, currency="CHF"):
        """
        Mock a Stripe checkout.session.completed webhook event.
        This avoids needing stripe CLI running and waiting for webhooks.
        """
        payload = {
            "id": f"evt_test_{random.randint(100000, 999999)}",
            "object": "event",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": f"cs_test_{random.randint(100000, 999999)}",
                    "object": "checkout.session",
                    "amount_total": int(amount * 100),
                    "currency": currency.lower(),
                    "customer_email": user_email,
                    "payment_status": "paid",
                    "status": "complete",
                    "metadata": {},
                }
            },
        }

        # Call webhook endpoint directly
        response = page.context.request.post(
            f"{BASE_URL}/api/stripe/webhook",
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": "test_signature",
            },
            data=json.dumps(payload),
        )
        return response.status == 200

    @staticmethod
    def fill_test_card(page):
        """
        Fill Stripe test card using robust multi-selector approach.
        Works with both old and new Stripe checkout UI.
        """
        print("   Filling Stripe test card...")

        # Wait for page to load
        page.wait_for_timeout(3000)

        # Fill email (non-iframe)
        for sel in ["input[name='email']", "input[type='email']", "#email"]:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    # Get test email from page context if available
                    el.fill("test@example.com")
                    print("   ✅ Email filled")
                    break
            except:
                continue

        # Card number - try multiple iframe strategies
        filled = StripeHelper._fill_card_field(page, "4242424242424242", [
            ("iframe[title*='card number' i]", "input[name='cardnumber']"),
            ("iframe[name*='cardNumber' i]", "input"),
            ("iframe[src*='stripe']", "input[type='text']"),
        ])
        if filled:
            print("   ✅ Card number filled")

        # Expiry
        StripeHelper._fill_card_field(page, "12/34", [
            ("iframe[title*='expiration' i]", "input[name='exp-date']"),
            ("iframe[name*='cardExpiry' i]", "input"),
        ])
        print("   ✅ Expiry filled")

        # CVC
        StripeHelper._fill_card_field(page, "123", [
            ("iframe[title*='CVC' i]", "input[name='cvc']"),
            ("iframe[name*='cardCvc' i]", "input"),
        ])
        print("   ✅ CVC filled")

        # Name
        for sel in ["input[name='billingName']", "input[name='cardname']", "input[placeholder*='name' i]"]:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    el.fill("Test User")
                    print("   ✅ Name filled")
                    break
            except:
                continue

        # Click pay button
        for sel in ["button[type='submit']", "button:has-text('Pay')", "button:has-text('Subscribe')"]:
            try:
                btn = page.locator(sel).first
                if btn.is_visible(timeout=2000):
                    btn.click()
                    print("   ✅ Pay button clicked")
                    return True
            except:
                continue

        return False

    @staticmethod
    def _fill_card_field(page, value, iframe_strategies):
        """Try multiple iframe strategies to fill a card field."""
        for iframe_sel, input_sel in iframe_strategies:
            try:
                iframe = page.locator(iframe_sel).first
                if iframe.is_visible(timeout=2000):
                    frame = iframe.content_frame()
                    if frame:
                        inp = frame.locator(input_sel).first
                        if inp.is_visible(timeout=2000):
                            inp.fill(value)
                            return True
            except:
                continue
        return False


# Shared page helpers

class PageHelper:
    """Helper methods for page interactions."""

    def __init__(self, page):
        self.page = page

    def register_user(self, email, password=TEST_PASSWORD):
        """Register a new user."""
        page = self.page
        page.goto(f"{BASE_URL}/en/register")
        page.fill("#full_name", "Test User")
        page.fill("#email", email)
        page.fill("#phone", "+41 79 123 45 67")
        page.fill("#password", password)
        page.fill("#confirm_password", password)
        page.check("#accept_terms")
        page.get_by_role("button", name="Sign Up").click()
        page.wait_for_load_state("networkidle")
        return True

    def login_user(self, email, password=TEST_PASSWORD):
        """Log in a user."""
        page = self.page
        page.goto(f"{BASE_URL}/en/login")
        page.fill("#email", email)
        page.fill("#password", password)
        page.get_by_role("button", name="Sign In").click()
        try:
            page.wait_for_url(lambda url: "/login" not in url, timeout=10000)
        except Exception:
            pass
        return "/login" not in page.url

    def open_checkout_dialog(self, button_text="Enroll Now"):
        """Click button and wait for checkout dialog."""
        page = self.page

        # Find button
        button = None
        for text in [button_text, "Enroll", "Register Now", "Subscribe Now", "Donate"]:
            try:
                btn = page.get_by_role("button", name=text, exact=True)
                if btn.is_visible():
                    button = btn
                    break
            except:
                continue

        if not button:
            button = page.locator(f'button:has-text("{button_text.split()[0]}")').first

        button.click()
        page.wait_for_timeout(3000)

        # Assert dialog opened
        expect(page.get_by_text("Choose payment method")).to_be_visible(timeout=10000)
        return True

    def select_bank_transfer(self):
        """Select Bank Transfer in checkout dialog."""
        page = self.page
        page.locator('button:has-text("Bank Transfer")').first.click()
        expect(page.locator('button:has-text("Get Transfer Details")').first).to_be_visible(timeout=5000)
        return True

    def select_card_payment(self):
        """Select Card Payment in checkout dialog."""
        page = self.page
        page.locator('button:has-text("Card Payment")').first.click()
        expect(page.locator('button:has-text("Pay")').first).to_be_visible(timeout=5000)
        return True

    def submit_bank_transfer(self):
        """Click Get Transfer Details and wait for confirmation."""
        page = self.page
        page.locator('button:has-text("Get Transfer Details")').first.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        return True

    def submit_card_payment(self):
        """Click Pay and proceed to Stripe."""
        page = self.page
        page.locator('button:has-text("Pay")').first.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(5000)
        return True


@pytest.fixture
def helper(page):
    """Provide page helper for test."""
    return PageHelper(page)


@pytest.fixture
def admin_helper(page):
    """Provide admin operations helper."""
    return AdminHelper(page)


class AdminHelper:
    """Admin operations via API."""

    def __init__(self, page):
        self.page = page
        self.context = page.context

    def sign_in(self, email="info@infinityroleteachers.com", password="TeachThePeople2026&"):
        """Sign in as admin via UI to establish session."""
        page = self.page
        page.goto(f"{BASE_URL}/en/login")
        page.fill("#email", email)
        page.fill("#password", password)
        page.get_by_role("button", name="Sign In").click()
        try:
            page.wait_for_url(lambda url: "/login" not in url, timeout=10000)
        except:
            pass
        return "/login" not in page.url

    def confirm_event_payment(self, registration_id):
        """Mark event registration as paid."""
        return self._patch_registration("event_registrations", registration_id)

    def confirm_program_payment(self, enrollment_id):
        """Mark program enrollment as paid."""
        return self._patch_registration("program_enrollments", enrollment_id)

    def confirm_donation(self, donation_id):
        """Mark donation as paid."""
        try:
            response = self.context.request.patch(
                f"{BASE_URL}/api/admin/donations/confirm",
                data=json.dumps({"donationId": donation_id}),
                headers={"Content-Type": "application/json"}
            )
            return response.status == 200
        except Exception as e:
            print(f"Donation confirm error: {e}")
            return False

    def activate_membership(self, user_id, plan="monthly"):
        """Activate membership for user."""
        try:
            response = self.context.request.post(
                f"{BASE_URL}/api/admin/members/activate",
                data=json.dumps({"userId": user_id, "plan": plan}),
                headers={"Content-Type": "application/json"}
            )
            return response.status == 200
        except Exception as e:
            print(f"Membership activate error: {e}")
            return False

    def get_user_id(self, email):
        """Get user ID by email."""
        try:
            response = self.context.request.get(f"{BASE_URL}/api/admin/users")
            if response.status == 200:
                users = response.json()
                if isinstance(users, list):
                    for u in users:
                        if u.get("email") == email:
                            return u.get("id")
            return None
        except Exception:
            return None

    def get_donation_id(self, user_email):
        """Get latest donation ID for user."""
        user_id = self.get_user_id(user_email)
        if not user_id:
            return None

        try:
            response = self.context.request.get(f"{BASE_URL}/api/admin/donations")
            if response.status == 200:
                data = response.json()
                if isinstance(data, list):
                    for record in sorted(data, key=lambda x: x.get("created_at", ""), reverse=True):
                        if record.get("user_id") == user_id:
                            return record.get("id")
            return None
        except Exception:
            return None

    def _patch_registration(self, table, record_id):
        """Generic patch for registration tables."""
        try:
            response = self.context.request.patch(
                f"{BASE_URL}/api/admin/registrations",
                data=json.dumps({
                    "table": table,
                    "id": record_id,
                    "data": {
                        "payment_status": "paid",
                        "status": "confirmed",
                    }
                }),
                headers={"Content-Type": "application/json"}
            )
            return response.status == 200
        except Exception as e:
            print(f"Confirm error: {e}")
            return False


@pytest.fixture
def api_context(browser):
    """Create an API-only context for admin operations without UI."""
    context = browser.new_context()
    yield context
    context.close()


# Screenshot on failure hook
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Take screenshot on test failure."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        try:
            page = item.funcargs["page"]
            screenshot_dir = Path("/tmp/test_screenshots")
            screenshot_dir.mkdir(exist_ok=True)
            path = screenshot_dir / f"FAILED_{item.name}_{int(time.time())}.png"
            page.screenshot(path=str(path), full_page=True)
            print(f"\n📸 Screenshot saved: {path}")
        except Exception:
            pass
