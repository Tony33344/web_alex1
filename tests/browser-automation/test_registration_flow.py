"""
Test User Registration Flow with Playwright
Tests that registration works (Supabase sends email directly, not through our transporter)
"""
from playwright.sync_api import sync_playwright
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails
import random
import string

BASE_URL = "http://localhost:3000"
TEST_PASSWORD = "TestPassword123!"

def generate_test_email():
    """Generate a random test email"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

def test_user_registration():
    """
    Test user registration flow
    Note: Supabase sends confirmation email directly, not through our Mailhog-configured transporter
    So we skip email verification for this test and focus on the registration success
    """
    clear_all_emails()
    test_email = generate_test_email()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False
        )
        
        page = browser.new_page()
        
        try:
            # Navigate to register page
            page.goto(f"{BASE_URL}/en/register")
            page.wait_for_load_state("networkidle")
            print("✅ Navigated to register page")
            
            # Fill registration form
            print("📝 Filling registration form...")
            
            # Full name
            page.fill("#full_name", "Test User")
            print("✅ Filled full name")
            
            # Email
            page.fill("#email", test_email)
            print(f"✅ Filled email: {test_email}")
            
            # Phone
            page.fill("#phone", "+41 79 123 45 67")
            print("✅ Filled phone number")
            
            # Password
            page.fill("#password", "TestPassword123!")
            print("✅ Filled password")
            
            # Confirm password
            page.fill("#confirm_password", "TestPassword123!")
            print("✅ Filled confirm password")
            
            # Accept terms
            page.check("#accept_terms")
            print("✅ Accepted terms")
            
            # Submit form
            submit_button = page.get_by_role("button", name="Sign Up")
            submit_button.click()
            page.wait_for_load_state("networkidle")
            print("✅ Submitted registration form")
            
            # Check if registration succeeded (look for success message)
            # Note: Supabase sends email directly, so we skip email verification check
            page.wait_for_timeout(2000)
            
            # Check if we're on the success page
            if page.get_by_text("Check Your Email").is_visible():
                print("✅ Registration successful - email sent by Supabase")
                print("⚠️ Note: Supabase sends emails directly, not through Mailhog")
                print("   Other email flows (event registration, bank transfer, etc.) use our Mailhog-configured transporter")
                browser.close()
                return True, test_email
            else:
                print("⚠️ Registration may have failed or page is different")
                browser.close()
                return False, test_email
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
            browser.close()
            return False, test_email

if __name__ == "__main__":
    success, email = test_user_registration()
    if success:
        print(f"\n✅ Registration test passed. Test email: {email}")
    else:
        print(f"\n❌ Registration test failed. Test email: {email}")
