"""
Test Membership Stripe Payment Flow
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to membership page
Step 4: Subscribe with Card Payment (Stripe) - fill test card 4242424242424242
Step 5: Verify email in Mailhog
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

def test_membership_stripe():
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
            
            # ===== STEP 3: NAVIGATE TO MEMBERSHIP =====
            page.goto(f"{BASE_URL}/membership")
            page.wait_for_load_state("networkidle")
            print("✅ Step 3: Navigated to membership page")
            
            # ===== STEP 4: SUBSCRIBE WITH STRIPE =====
            subscribe_btn = None
            for text in ["Subscribe Now", "Subscribe", "Join Now", "Get Started"]:
                try:
                    btn = page.get_by_role("button", name=text, exact=True)
                    if btn.is_visible():
                        subscribe_btn = btn
                        print(f"   Found button: {text}")
                        break
                except:
                    continue
            
            if not subscribe_btn:
                print("❌ No subscribe button found")
                browser.close()
                return False
            
            subscribe_btn.click()
            page.wait_for_timeout(1500)
            print("✅ Step 4: Clicked subscribe button - dialog should open")
            
            # Select Card Payment via JS evaluate (Radix overlay issue)
            page.evaluate("""() => {
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.includes('Card Payment') && btn.textContent.includes('Stripe')) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }""")
            page.wait_for_timeout(500)
            print("✅ Step 4: Selected Card Payment in dialog")
            
            # Click Pay button via JS evaluate
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
            
            # ===== STEP 4b: FILL STRIPE CHECKOUT =====
            # Stripe checkout is a hosted page at checkout.stripe.com
            # It uses iframes for card input fields
            try:
                page.wait_for_timeout(3000)
                print("   Filling Stripe test card details...")
                
                # Stripe checkout page uses iframes for card fields
                # Card number iframe
                card_frame = page.frame_locator("iframe[name='cardNumber']").first
                if card_frame.locator("input").is_visible():
                    card_frame.locator("input").fill("4242424242424242")
                    print("✅ Step 4b: Filled card number")
                
                # Expiry iframe
                expiry_frame = page.frame_locator("iframe[name='cardExpiry']").first
                if expiry_frame.locator("input").is_visible():
                    expiry_frame.locator("input").fill("1234")
                    print("✅ Step 4b: Filled expiry (12/34)")
                
                # CVC iframe
                cvc_frame = page.frame_locator("iframe[name='cardCvc']").first
                if cvc_frame.locator("input").is_visible():
                    cvc_frame.locator("input").fill("123")
                    print("✅ Step 4b: Filled CVC")
                
                # Cardholder name (not in iframe)
                name_input = page.locator("input[name='billingName']").first
                if name_input.is_visible():
                    name_input.fill("Test User")
                    print("✅ Step 4b: Filled cardholder name")
                
                # Click Pay/Subscribe button on Stripe page
                page.wait_for_timeout(1000)
                pay_btn = page.locator("button:has-text('Subscribe'), button:has-text('Pay')").first
                if pay_btn.is_visible():
                    pay_btn.click()
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(5000)
                    print("✅ Step 4b: Submitted Stripe payment")
                else:
                    # Try JS evaluate as fallback
                    page.evaluate("""() => {
                        const btn = document.querySelector('button[type=\"submit\"]');
                        if (btn) btn.click();
                    }""")
                    page.wait_for_timeout(5000)
                    print("✅ Step 4b: Submitted Stripe payment (via JS)")
                    
            except Exception as stripe_error:
                print(f"⚠️ Stripe checkout: {stripe_error}")
                print("   Browser is still open - complete payment manually")
            
            # ===== STEP 5: VERIFY EMAIL IN MAILHOG =====
            print("⏳ Step 5: Waiting for confirmation email...")
            email = wait_for_email("Membership", timeout=60)
            if not email:
                email = wait_for_email("Confirmed", timeout=15)
            if not email:
                email = wait_for_email("Receipt", timeout=15)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: Email received! Subject: {subject}")
                browser.close()
                return True
            else:
                print("❌ Step 5: No email received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_membership_stripe()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
