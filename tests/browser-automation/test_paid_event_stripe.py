"""
Test Paid Event Registration Flow with Stripe Test Card
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to events, select event
Step 4: Pay with Stripe test card (4242 4242 4242 4242)
Step 5: Verify confirmation email in Mailhog
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

def test_paid_event_stripe():
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
            
            # ===== STEP 3: NAVIGATE TO EVENTS =====
            page.goto(f"{BASE_URL}/events")
            page.wait_for_load_state("networkidle")
            print("✅ Step 3: Navigated to events page")
            
            event_links = page.query_selector_all("a[href*='/events/']")
            print(f"   Found {len(event_links)} event links")
            
            if len(event_links) == 0:
                print("⚠️ No events found")
                browser.close()
                return None
            
            event_links[0].click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print("✅ Step 3: Clicked on first event")
            
            # ===== STEP 4: ENROLL AND PAY WITH STRIPE =====
            # Click "Enroll Now" button - this opens a CheckoutDialog modal
            enroll_button = None
            for text in ["Enroll Now", "Enroll", "Register Now", "Register"]:
                try:
                    button = page.get_by_role("button", name=text, exact=True)
                    if button.is_visible():
                        enroll_button = button
                        print(f"   Found button: {text}")
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
            page.wait_for_timeout(1500)  # Wait for dialog to open
            print("✅ Step 4: Clicked enroll button - dialog should open")
            
            # In the CheckoutDialog, select "Card Payment" option
            # Radix Dialog overlay intercepts Playwright clicks - use JS evaluate to click directly
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
            
            # Click "Pay [price]" button
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
            page.wait_for_timeout(5000)  # Wait for Stripe checkout to load
            print("✅ Step 4: Proceeded to Stripe checkout")
            
            # Fill Stripe test card details
            # Stripe checkout is a hosted page at checkout.stripe.com
            # It uses iframes for card input fields
            try:
                page.wait_for_timeout(5000)  # Wait for Stripe to fully load
                print("   Filling Stripe test card details...")
                
                # Fill email first (not in iframe)
                email_input = page.locator("input[name='email']").first
                if email_input.is_visible():
                    email_input.fill(test_email)
                    print("✅ Step 4b: Filled email")
                
                # Card number - find iframe by title containing "card number"
                card_iframe = page.locator("iframe[title*='card number' i]").first
                if card_iframe.is_visible():
                    card_frame = card_iframe.content_frame()
                    if card_frame:
                        card_input = card_frame.locator("input[name='cardnumber']")
                        card_input.fill("4242424242424242")
                        print("✅ Step 4b: Filled card number")
                
                # Expiry - find iframe by title containing "expiration"
                expiry_iframe = page.locator("iframe[title*='expiration' i]").first
                if expiry_iframe.is_visible():
                    expiry_frame = expiry_iframe.content_frame()
                    if expiry_frame:
                        expiry_input = expiry_frame.locator("input[name='exp-date']")
                        expiry_input.fill("12/34")
                        print("✅ Step 4b: Filled expiry (12/34)")
                
                # CVC - find iframe by title containing "CVC"
                cvc_iframe = page.locator("iframe[title*='CVC' i]").first
                if cvc_iframe.is_visible():
                    cvc_frame = cvc_iframe.content_frame()
                    if cvc_frame:
                        cvc_input = cvc_frame.locator("input[name='cvc']")
                        cvc_input.fill("123")
                        print("✅ Step 4b: Filled CVC")
                
                # Cardholder name (not in iframe)
                name_input = page.locator("input[name='billingName'], input[placeholder*='name' i]").first
                if name_input.is_visible():
                    name_input.fill("Test User")
                    print("✅ Step 4b: Filled cardholder name")
                
                # Click Pay button on Stripe page
                page.wait_for_timeout(1000)
                pay_btn = page.locator("button[type='submit']").first
                if pay_btn.is_visible():
                    pay_btn.click()
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(5000)
                    print("✅ Step 4b: Submitted Stripe payment")
                else:
                    page.evaluate("""() => {
                        const btn = document.querySelector('button[type="submit"]');
                        if (btn) btn.click();
                    }""")
                    page.wait_for_timeout(5000)
                    print("✅ Step 4b: Submitted Stripe payment (via JS)")
                    
            except Exception as stripe_error:
                print(f"⚠️ Stripe checkout: {stripe_error}")
                print("   Browser is still open - complete payment manually")
            
            # ===== STEP 5: VERIFY CONFIRMED EMAIL =====
            print("⏳ Step 5: Waiting for CONFIRMED email (may require Stripe webhook)...")
            # Note: Final confirmation email only arrives if Stripe webhook fires
            # For local testing, run: stripe listen --forward-to localhost:3000/api/stripe/webhook
            email = wait_for_email("Confirmed", recipient=test_email, timeout=120)
            if not email:
                email = wait_for_email("Registration Confirmed", recipient=test_email, timeout=10)
            if not email:
                email = wait_for_email("Receipt", recipient=test_email, timeout=10)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: CONFIRMED email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED: Payment completed and confirmation email received! ✅✅✅")
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
    success = test_paid_event_stripe()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
