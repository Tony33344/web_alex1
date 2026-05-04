"""
Test Contact Form Flow
Step 1: Navigate to contact page (no login needed)
Step 2: Fill and submit form
Step 3: Verify TWO emails: admin notification + user thank-you
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
import random
import string

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

BASE_URL = "http://localhost:3000"

def test_contact_form():
    clear_all_emails()
    test_email = generate_test_email()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False
        )
        page = browser.new_page()
        
        try:
            # ===== STEP 1: NAVIGATE TO CONTACT PAGE =====
            page.goto(f"{BASE_URL}/contact")
            page.wait_for_load_state("networkidle")
            print("✅ Step 1: Navigated to contact page")
            
            # ===== STEP 2: FILL AND SUBMIT FORM =====
            page.fill("input[name='name']", "Test User")
            page.fill("input[name='email']", test_email)
            page.fill("input[name='subject']", "Test Contact Subject")
            page.fill("textarea[name='message']", "This is a test message from automated testing.")
            
            # Submit form
            submit_btn = page.get_by_role("button", name="Send").first
            if not submit_btn or not submit_btn.is_visible():
                submit_btn = page.locator("button[type='submit']").first
            
            if submit_btn and submit_btn.is_visible():
                submit_btn.click()
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(2000)
                print("✅ Step 2: Submitted contact form")
            else:
                print("❌ Step 2: No submit button found")
                browser.close()
                return False
            
            # ===== STEP 3: VERIFY TWO EMAILS =====
            print("⏳ Step 3: Waiting for TWO emails...")
            
            # Email 1: Admin notification
            admin_email = wait_for_email("New Contact Form", timeout=30)
            if not admin_email:
                admin_email = wait_for_email("Contact Form", timeout=10)
            
            # Email 2: User thank-you
            user_email = wait_for_email("Thank you for contacting", recipient=test_email, timeout=30)
            if not user_email:
                user_email = wait_for_email("Thank you", recipient=test_email, timeout=10)
            
            success_count = 0
            
            if admin_email:
                subject = admin_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 3a: Admin notification received! Subject: {subject}")
                success_count += 1
            else:
                print("❌ Step 3a: No admin notification email")
            
            if user_email:
                subject = user_email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 3b: User thank-you received! Subject: {subject}")
                success_count += 1
            else:
                print("❌ Step 3b: No user thank-you email")
            
            if success_count == 2:
                print("\n✅✅✅ TEST PASSED: Both emails received! ✅✅✅")
                browser.close()
                return True
            elif success_count == 1:
                print("\n⚠️ PARTIAL: Only 1 of 2 emails received")
                browser.close()
                return False
            else:
                print("\n❌ TEST FAILED: No emails received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_contact_form()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
