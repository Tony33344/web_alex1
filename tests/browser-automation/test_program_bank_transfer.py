"""
Test Program Enrollment with Bank Transfer
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to programs, select program
Step 4: Choose bank transfer payment
Step 5: Verify PENDING email arrives
Step 6: Admin confirms payment
Step 7: Verify CONFIRMED email arrives
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
from admin_helper import admin_sign_in, confirm_program_payment, get_latest_record_for_user
import random
import string

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

import os

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"
SCREENSHOT_DIR = "/tmp/test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def test_program_bank_transfer():
    clear_all_emails()
    test_email = generate_test_email()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False
        )
        page = browser.new_page()
        
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
            
            page.wait_for_timeout(2000)
            
            # ===== STEP 2: SIGN IN =====
            page.goto(f"{BASE_URL}/en/login")
            page.wait_for_load_state("networkidle")
            print("✅ Step 2: Navigated to login page")
            
            page.fill("#email", test_email)
            page.fill("#password", TEST_PASSWORD)
            page.get_by_role("button", name="Sign In").click()
            page.wait_for_load_state("networkidle")
            try:
                page.wait_for_url(lambda url: "/login" not in url, timeout=10000)
            except Exception:
                print("❌ Step 2: Still on login page after sign-in")
                browser.close()
                return False
            print(f"✅ Step 2: Signed in with {test_email}")
            page.screenshot(path=f"{SCREENSHOT_DIR}/02_program_signed_in.png")
            
            # ===== STEP 3: NAVIGATE TO PROGRAMS =====
            page.goto(f"{BASE_URL}/en/coach-training", timeout=60000)
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(3000)
            print("✅ Step 3: Navigated to programs page")
            page.screenshot(path=f"{SCREENSHOT_DIR}/03_programs_list.png")
            
            # Find program links
            program_links = page.locator("a[href*='/coach-training/']").all()
            program_links = [l for l in program_links if l.get_attribute('href') not in ['/en/coach-training', None]]
            print(f"   Found {len(program_links)} program links")
            
            if len(program_links) == 0:
                print("❌ Step 3: No programs found")
                browser.close()
                return False
            
            program_links[0].click()
            page.wait_for_load_state("networkidle")
            print("✅ Step 3: Clicked on first program")
            page.screenshot(path=f"{SCREENSHOT_DIR}/03_program_detail.png")
            
            # Wait for "Enroll Now" button to render (client component in sticky sidebar)
            page.wait_for_selector('button:has-text("Enroll Now")', timeout=15000)
            print("✅ Step 3: Enroll Now button is visible")
            
            # ===== STEP 4: ENROLL AND SELECT BANK TRANSFER =====
            enroll_btn = page.locator('button:has-text("Enroll Now")').first
            enroll_btn.click()
            # Hard-assert checkout dialog opened
            try:
                page.wait_for_selector('text=Choose payment method', timeout=10000)
            except Exception:
                print("❌ Step 4: Checkout dialog did not open")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            print("✅ Step 4: Checkout dialog opened")
            page.screenshot(path=f"{SCREENSHOT_DIR}/04_dialog_open.png")
            # Select Bank Transfer
            bank_btn = page.locator('button:has-text("Bank Transfer")').first
            bank_btn.click()
            try:
                page.wait_for_selector('button:has-text("Get Transfer Details")', timeout=5000)
            except Exception:
                print("❌ Step 4: Bank Transfer click did not change submit button")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            print("✅ Step 4: Selected Bank Transfer")
            page.screenshot(path=f"{SCREENSHOT_DIR}/04_bank_selected.png")
            # Click "Get Transfer Details"
            submit_btn = page.locator('button:has-text("Get Transfer Details")').first
            submit_btn.click()
            try:
                page.wait_for_selector("text=Registration Confirmed", timeout=15000)
            except Exception:
                err_el = page.locator(".text-destructive").first
                if err_el.is_visible():
                    print(f"❌ Step 4: API error: {err_el.text_content().strip()}")
                else:
                    print("❌ Step 4: No 'Registration Confirmed' appeared after submit")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            page.screenshot(path=f"{SCREENSHOT_DIR}/05_after_submit.png")
            print("✅ Step 4: Submitted bank transfer enrollment")
            
            # ===== STEP 5: VERIFY PENDING EMAIL =====
            print("⏳ Step 5: Waiting for PENDING email...")
            pending_email = wait_for_email("Pending", recipient=test_email, timeout=30)
            if not pending_email:
                pending_email = wait_for_email("Enrollment Pending", recipient=test_email, timeout=10)
            
            if pending_email:
                subject = pending_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: PENDING email received! Subject: {subject}")
            else:
                print("❌ Step 5: No pending email received")
                browser.close()
                return False
            
            # ===== STEP 6: ADMIN CONFIRMS PAYMENT =====
            print("⏳ Step 6: Admin confirming payment...")
            
            admin_context = browser.new_context()
            admin_page = admin_context.new_page()
            
            if not admin_sign_in(admin_page):
                print("❌ Step 6: Admin sign in failed")
                admin_context.close()
                browser.close()
                return False
            
            enrollment_id = get_latest_record_for_user(admin_page, test_email, 'program_enrollments')
            if not enrollment_id:
                print("❌ Step 6: Could not find enrollment ID")
                admin_context.close()
                browser.close()
                return False
            
            if not confirm_program_payment(admin_page, enrollment_id):
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
                confirmed_email = wait_for_email("Program Enrollment Confirmed", recipient=test_email, timeout=10)
            
            if confirmed_email:
                subject = confirmed_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 7: CONFIRMED email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED: Both pending and confirmed emails received! ✅✅✅")
                browser.close()
                return True
            else:
                print("❌ Step 7: No confirmed email received")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_program_bank_transfer()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
