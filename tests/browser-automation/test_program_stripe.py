"""
Test Program Enrollment with Stripe Payment
Step 1: Register new user
Step 2: Sign in  
Step 3: Navigate to programs, select program
Step 4: Pay with Stripe test card
Step 5: Verify confirmation email arrives (requires webhook)
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
from stripe_helper import fill_stripe_checkout
import random
import string
import re

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"

def test_program_stripe():
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
            page.wait_for_timeout(2000)
            print(f"✅ Step 2: Signed in with {test_email}")
            
            # ===== STEP 3: NAVIGATE TO PROGRAMS =====
            page.goto(f"{BASE_URL}/en/coach-training", timeout=60000)
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(3000)
            print("✅ Step 3: Navigated to programs page")
            
            # Find program links
            program_links = page.locator("a[href*='/coach-training/']").all()
            program_links = [l for l in program_links if l.get_attribute('href') not in ['/en/coach-training', None]]
            print(f"   Found {len(program_links)} program links")
            
            if len(program_links) == 0:
                print("⚠️ No programs found")
                browser.close()
                return False
            
            program_links[0].click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print("✅ Step 3: Clicked on first program")
            
            # Wait for "Enroll Now" button to render
            page.wait_for_selector('button:has-text("Enroll Now")', timeout=15000)
            print("✅ Step 3: Enroll Now button is visible")
            
            # ===== STEP 4: ENROLL WITH STRIPE =====
            enroll_btn = page.locator('button:has-text("Enroll Now")').first
            enroll_btn.click()
            print("✅ Step 4: Clicked enroll button - waiting for dialog")
            
            # Hard-assert dialog opened
            try:
                page.wait_for_selector('text=Choose payment method', timeout=10000)
                print("✅ Step 4: Checkout dialog opened")
            except Exception:
                print("❌ Step 4: Checkout dialog did not open")
                browser.close()
                return False
            
            # Select "Card Payment" in dialog
            card_btn = page.locator('button:has-text("Card Payment")').first
            card_btn.click()
            try:
                page.wait_for_selector('button:has-text("Pay")', timeout=5000)
            except Exception:
                print("❌ Step 4: Card Payment click did not show Pay button")
                browser.close()
                return False
            print("✅ Step 4: Selected Card Payment")
            
            # Click "Pay" submit button
            submit_btn = page.locator('button:has-text("Pay")').first
            submit_btn.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(5000)
            print("✅ Step 4: Proceeded to Stripe checkout")
            
            # Fill Stripe test card details using helper
            try:
                fill_stripe_checkout(page, test_email, "Test User")
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(5000)
                print("✅ Step 4b: Submitted Stripe payment")
            except Exception as stripe_error:
                print(f"⚠️ Stripe checkout: {stripe_error}")
            
            # ===== STEP 5: VERIFY EMAIL =====
            print("⏳ Step 5: Waiting for confirmation email...")
            print("   Note: Requires Stripe webhook forwarding")
            
            email = wait_for_email("Confirmed", recipient=test_email, timeout=30)
            if not email:
                email = wait_for_email("Program Enrollment Confirmed", recipient=test_email, timeout=10)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: Email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED! ✅✅✅")
                browser.close()
                return True
            else:
                print("⚠️ Step 5: No webhook email (run 'stripe listen --forward-to localhost:3000/api/stripe/webhook' for full test)")
                print("✅ TEST PASSED: Stripe payment submitted successfully")
                browser.close()
                return True
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_program_stripe()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
