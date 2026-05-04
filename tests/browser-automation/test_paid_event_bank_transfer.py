"""
Test Paid Event Registration Flow with Bank Transfer
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to events, select event
Step 4: Choose bank transfer payment
Step 5: Verify PENDING email arrives
Step 6: Admin confirms payment
Step 7: Verify CONFIRMED email arrives
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
from admin_helper import admin_sign_in, confirm_event_payment, get_latest_record_for_user
import random
import string
import os
import re
from datetime import datetime

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"
SCREENSHOT_DIR = "/tmp/test_screenshots"

def take_screenshot(page, name):
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%H%M%S")
    path = f"{SCREENSHOT_DIR}/{name}_{timestamp}.png"
    page.screenshot(path=path, full_page=True)
    print(f"   📸 Screenshot: {path}")
    return path

def test_paid_event_bank_transfer():
    clear_all_emails()
    test_email = generate_test_email()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False
        )
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # ===== STEP 1: REGISTER =====
            page.goto(f"{BASE_URL}/en/register")
            page.wait_for_load_state("networkidle")
            print("✅ Step 1: Navigated to register page")
            
            page.fill("#full_name", "Test User")
            page.fill("#email", test_email)
            page.fill("#phone", "+41 79 123 45 67")
            page.fill("#password", TEST_PASSWORD)
            page.fill("#confirm_password", TEST_PASSWORD)
            page.check("#accept_terms")
            page.get_by_role("button", name="Sign Up").click()
            page.wait_for_load_state("networkidle")
            print(f"✅ Step 1: Registered with {test_email}")
            
            # Wait for success page
            page.wait_for_timeout(2000)
            
            # ===== STEP 2: SIGN IN =====
            page.goto(f"{BASE_URL}/en/login")
            page.wait_for_load_state("networkidle")
            print("✅ Step 2: Navigated to login page")
            
            page.fill("#email", test_email)
            page.fill("#password", TEST_PASSWORD)
            page.get_by_role("button", name="Sign In").click()
            page.wait_for_load_state("networkidle")
            # Wait for Next.js client-side router navigation away from login to complete
            try:
                page.wait_for_url(lambda url: "/login" not in url, timeout=10000)
            except Exception:
                print("❌ Step 2: Still on login page after sign-in")
                take_screenshot(page, "02_still_on_login")
                browser.close()
                return False
            sign_in_links = page.locator('a:has-text("Sign In")')
            if sign_in_links.count() > 0 and sign_in_links.first.is_visible():
                print("❌ Step 2: Login failed — 'Sign In' still visible in header")
                take_screenshot(page, "02_login_failed")
                browser.close()
                return False
            print(f"✅ Step 2: Signed in with {test_email}")
            take_screenshot(page, "02_signed_in")
            
            # ===== STEP 3: NAVIGATE TO EVENTS =====
            page.goto(f"{BASE_URL}/en/events")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            print("✅ Step 3: Navigated to events page")
            
            # Verify session still active on this page
            sign_in_check = page.locator('a:has-text("Sign In")')
            if sign_in_check.count() > 0 and sign_in_check.first.is_visible():
                print("❌ Step 3: Session lost — 'Sign In' visible on events page")
                take_screenshot(page, "03_session_lost")
                browser.close()
                return False
            take_screenshot(page, "03_events_page")
            
            # Find event links (exclude the main /events link itself)
            event_links = page.locator('a[href*="/events/"]').all()
            event_links = [l for l in event_links 
                          if l.get_attribute('href') not in ['/events', '/en/events', None]]
            print(f"   Found {len(event_links)} event links")
            
            if len(event_links) == 0:
                print("❌ No event links found")
                browser.close()
                return False
            
            # Click the first event
            event_links[0].click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            print("✅ Step 3: Clicked on first event")
            take_screenshot(page, "03_event_detail")
            
            # Wait for "Enroll Now" button to render (client component in sticky sidebar)
            page.wait_for_selector('button:has-text("Enroll Now")', timeout=15000)
            print("✅ Step 3: Enroll Now button is visible")
            
            # ===== STEP 4: ENROLL AND SELECT BANK TRANSFER =====
            # Find "Enroll Now" button by text (the label prop from i18n)
            enroll_button = page.get_by_role("button", name=re.compile(r"Enroll Now|Register Now|Enroll|Register", re.I)).first
            
            if not enroll_button.is_visible():
                print("❌ Step 4: No enroll/register button found on event page")
                take_screenshot(page, "04_no_enroll_btn")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            
            print(f"   Found enroll button: {enroll_button.text_content().strip()}")
            enroll_button.click()
            
            # HARD ASSERT: wait for the checkout dialog to open
            try:
                page.wait_for_selector("text=Choose payment method", timeout=10000)
                print("✅ Step 4: Checkout dialog opened")
            except:
                print("❌ Step 4: Checkout dialog did NOT open after clicking Enroll")
                take_screenshot(page, "04_no_dialog")
                if "/login" in page.url:
                    print("   → Redirected to login! Session was lost during navigation.")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            
            take_screenshot(page, "04_dialog_open")
            
            # Select "Bank Transfer" in the dialog
            bank_btn = page.locator('button:has-text("Bank Transfer")').first
            if not bank_btn.is_visible():
                print("❌ Step 4: Bank Transfer button not found in dialog")
                take_screenshot(page, "04_no_bank_btn")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            
            bank_btn.click()
            # Hard-assert: submit button must change to "Get Transfer Details"
            try:
                page.wait_for_selector('button:has-text("Get Transfer Details")', timeout=5000)
            except Exception:
                print("❌ Step 4: Bank Transfer click did not change submit button")
                take_screenshot(page, "04_bank_not_selected")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            print("✅ Step 4: Selected Bank Transfer")
            take_screenshot(page, "04_bank_selected")
            
            # Click "Get Transfer Details" button
            submit_btn = page.locator('button:has-text("Get Transfer Details")').first
            if not submit_btn.is_visible():
                print("❌ Step 4: Submit button not found in dialog")
                take_screenshot(page, "04_no_submit_btn")
                browser.close()
                return False
            
            submit_btn.click()
            # Hard-assert: wait for "Registration Confirmed" in the dialog
            try:
                page.wait_for_selector("text=Registration Confirmed", timeout=15000)
            except Exception:
                take_screenshot(page, "04_submit_no_confirmation")
                # Capture visible dialog error if any
                err_el = page.locator(".text-destructive").first
                if err_el.is_visible():
                    print(f"❌ Step 4: API error shown in dialog: {err_el.text_content().strip()}")
                else:
                    print("❌ Step 4: No 'Registration Confirmed' appeared after submit")
                # Dump visible buttons for debug
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            print("✅ Step 4: Submitted bank transfer registration")
            take_screenshot(page, "05_after_submit")
            
            # ===== STEP 5: VERIFY PENDING EMAIL =====
            print("⏳ Step 5: Waiting for PENDING email...")
            pending_email = wait_for_email("Pending", recipient=test_email, timeout=30)
            if not pending_email:
                pending_email = wait_for_email("Registration Pending", recipient=test_email, timeout=10)
            
            if pending_email:
                subject = pending_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: PENDING email received! Subject: {subject}")
            else:
                print("❌ Step 5: No pending email received")
                print("📧 Check Mailhog at http://localhost:8025")
                take_screenshot(page, "05_no_email")
                browser.close()
                return False
            
            # ===== STEP 6: ADMIN CONFIRMS PAYMENT =====
            print("⏳ Step 6: Admin confirming payment...")
            
            # Sign in as admin in new context
            admin_context = browser.new_context()
            admin_page = admin_context.new_page()
            
            if not admin_sign_in(admin_page):
                print("❌ Step 6: Admin sign in failed")
                admin_context.close()
                browser.close()
                return False
            
            # Get the registration ID for this user
            registration_id = get_latest_record_for_user(admin_page, test_email, 'event_registrations')
            if not registration_id:
                print("❌ Step 6: Could not find registration ID")
                admin_context.close()
                browser.close()
                return False
            
            # Confirm the payment
            if not confirm_event_payment(admin_page, registration_id):
                print("❌ Step 6: Failed to confirm payment")
                admin_context.close()
                browser.close()
                return False
            
            print("✅ Step 6: Admin confirmed payment")
            admin_context.close()
            
            # ===== STEP 7: VERIFY CONFIRMED EMAIL =====
            print("⏳ Step 7: Waiting for CONFIRMED email...")
            confirmed_email = wait_for_email("Confirmed", recipient=test_email, timeout=30)
            if not confirmed_email:
                confirmed_email = wait_for_email("Event Registration Confirmed", recipient=test_email, timeout=10)
            
            if confirmed_email:
                subject = confirmed_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 7: CONFIRMED email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED: Both pending and confirmed emails received! ✅✅✅")
                browser.close()
                return True
            else:
                print("❌ Step 7: No confirmed email received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            take_screenshot(page, "99_error")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_paid_event_bank_transfer()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
