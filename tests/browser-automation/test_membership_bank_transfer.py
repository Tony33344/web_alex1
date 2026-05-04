"""
Test Membership Bank Transfer Flow with Playwright
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to membership page
Step 4: Select bank transfer payment
Step 5: Verify PENDING email arrives
Step 6: Admin activates membership
Step 7: Verify CONFIRMED email arrives
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
from admin_helper import admin_sign_in, activate_membership, get_user_id_by_email
import random
import string

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"

def test_membership_bank_transfer():
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
            
            # ===== STEP 3: NAVIGATE TO MEMBERSHIP =====
            page.goto(f"{BASE_URL}/en/membership")
            page.wait_for_load_state("networkidle")
            print("✅ Step 3: Navigated to membership page")
            
            # Wait for "Subscribe Now" button to render (client component)
            page.wait_for_selector('button:has-text("Subscribe Now")', timeout=15000)
            print("✅ Step 3: Subscribe Now button is visible")
            
            # ===== STEP 4: SELECT MEMBERSHIP AND BANK TRANSFER =====
            subscribe_btn = page.locator('button:has-text("Subscribe Now")').first
            if not subscribe_btn.is_visible():
                print("❌ Step 4: Subscribe Now button not found")
                all_btns = page.locator('button:visible').all()
                print(f"   Visible buttons: {[b.text_content().strip()[:40] for b in all_btns]}")
                browser.close()
                return False
            subscribe_btn.click()
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
            print("✅ Step 4: Submitted membership bank transfer")
            
            # ===== STEP 5: VERIFY PENDING EMAIL =====
            print("⏳ Step 5: Waiting for PENDING email...")
            pending_email = wait_for_email("Pending", recipient=test_email, timeout=30)
            if not pending_email:
                pending_email = wait_for_email("Membership Pending", recipient=test_email, timeout=10)
            
            if pending_email:
                subject = pending_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: PENDING email received! Subject: {subject}")
            else:
                print("❌ Step 5: No pending email received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
            
            # ===== STEP 6: ADMIN ACTIVATES MEMBERSHIP =====
            print("⏳ Step 6: Admin activating membership...")
            
            # Sign in as admin in new context
            admin_context = browser.new_context()
            admin_page = admin_context.new_page()
            
            if not admin_sign_in(admin_page):
                print("❌ Step 6: Admin sign in failed")
                admin_context.close()
                browser.close()
                return False
            
            # Get the user ID for this email
            user_id = get_user_id_by_email(admin_page, test_email)
            if not user_id:
                print("❌ Step 6: Could not find user ID")
                admin_context.close()
                browser.close()
                return False
            
            # Activate membership
            if not activate_membership(admin_page, user_id, plan='monthly'):
                print("❌ Step 6: Failed to activate membership")
                admin_context.close()
                browser.close()
                return False
            
            print("✅ Step 6: Admin activated membership")
            admin_context.close()
            
            # ===== STEP 7: VERIFY CONFIRMED EMAIL =====
            print("⏳ Step 7: Waiting for CONFIRMED email...")
            confirmed_email = wait_for_email("Activated", recipient=test_email, timeout=30)
            if not confirmed_email:
                confirmed_email = wait_for_email("Membership Activated", recipient=test_email, timeout=10)
            if not confirmed_email:
                confirmed_email = wait_for_email("Welcome", recipient=test_email, timeout=10)
            
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
            browser.close()
            return False

if __name__ == "__main__":
    success = test_membership_bank_transfer()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
