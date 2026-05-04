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
import random
import string

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
            page.goto(f"{BASE_URL}/programs")
            page.wait_for_load_state("networkidle")
            print("✅ Step 3: Navigated to programs page")
            
            # Find program links
            program_links = page.query_selector_all("a[href*='/programs/']")
            print(f"   Found {len(program_links)} program links")
            
            if len(program_links) == 0:
                print("⚠️ No programs found")
                browser.close()
                return False
            
            program_links[0].click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print("✅ Step 3: Clicked on first program")
            
            # ===== STEP 4: ENROLL WITH STRIPE =====
            enroll_button = None
            for text in ["Enroll Now", "Enroll", "Register Now", "Join Now"]:
                try:
                    button = page.get_by_role("button", name=text, exact=True)
                    if button.is_visible():
                        enroll_button = button
                        break
                except:
                    continue
            
            if not enroll_button:
                enroll_button = page.query_selector("button")
            
            if not enroll_button or not enroll_button.is_visible():
                print("❌ No enroll button found")
                browser.close()
                return False
            
            enroll_button.click()
            page.wait_for_timeout(1500)
            print("✅ Step 4: Clicked enroll button - dialog should open")
            
            # Select Credit Card / Stripe
            page.evaluate("""() => {
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.includes('Credit Card') || btn.textContent.includes('Stripe') || 
                        btn.textContent.includes('Pay with Card')) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }""")
            page.wait_for_timeout(500)
            print("✅ Step 4: Selected Credit Card payment")
            
            # Click Pay button
            page.evaluate("""() => {
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.includes('Pay') && (btn.textContent.includes('CHF') || btn.textContent.includes('EUR'))) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }""")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(5000)
            print("✅ Step 4: Proceeded to Stripe checkout")
            
            # Fill Stripe test card
            try:
                page.wait_for_timeout(5000)
                print("   Filling Stripe test card details...")
                
                # Email
                email_input = page.locator("input[name='email']").first
                if email_input.is_visible():
                    email_input.fill(test_email)
                
                # Card iframe by title
                card_iframe = page.locator("iframe[title*='card number' i]").first
                if card_iframe.is_visible():
                    card_frame = card_iframe.content_frame()
                    if card_frame:
                        card_frame.locator("input[name='cardnumber']").fill("4242424242424242")
                        print("✅ Step 4b: Filled card number")
                
                # Expiry
                expiry_iframe = page.locator("iframe[title*='expiration' i]").first
                if expiry_iframe.is_visible():
                    expiry_frame = expiry_iframe.content_frame()
                    if expiry_frame:
                        expiry_frame.locator("input[name='exp-date']").fill("12/34")
                        print("✅ Step 4b: Filled expiry")
                
                # CVC
                cvc_iframe = page.locator("iframe[title*='CVC' i]").first
                if cvc_iframe.is_visible():
                    cvc_frame = cvc_iframe.content_frame()
                    if cvc_frame:
                        cvc_frame.locator("input[name='cvc']").fill("123")
                        print("✅ Step 4b: Filled CVC")
                
                # Name
                name_input = page.locator("input[name='billingName']").first
                if name_input.is_visible():
                    name_input.fill("Test User")
                
                # Submit
                page.locator("button[type='submit']").click()
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(5000)
                print("✅ Step 4b: Submitted Stripe payment")
                
            except Exception as stripe_error:
                print(f"⚠️ Stripe checkout: {stripe_error}")
            
            # ===== STEP 5: VERIFY EMAIL =====
            print("⏳ Step 5: Waiting for confirmation email...")
            print("   Note: Requires Stripe webhook forwarding")
            
            email = wait_for_email("Confirmed", recipient=test_email, timeout=120)
            if not email:
                email = wait_for_email("Program Enrollment Confirmed", recipient=test_email, timeout=10)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: Email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED! ✅✅✅")
                browser.close()
                return True
            else:
                print("❌ Step 5: No confirmation email")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_program_stripe()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
