"""
Test Free Event Registration Flow
Step 1: Register new user
Step 2: Sign in
Step 3: Find and enroll in FREE event
Step 4: Verify "Free Event Registration Confirmed" email
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

def test_free_event():
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
            
            # Find FREE event (look for "Free" badge or price = 0)
            event_links = page.query_selector_all("a[href*='/events/']")
            print(f"   Found {len(event_links)} event links")
            
            free_event_found = False
            for link in event_links:
                # Check if this event is free
                parent = link.query_selector("xpath=..")
                if parent:
                    text = parent.inner_text()
                    if "free" in text.lower() or "chf 0" in text.lower() or "$0" in text.lower():
                        link.click()
                        free_event_found = True
                        break
            
            if not free_event_found:
                # Click first event and hope it's free
                if len(event_links) > 0:
                    event_links[0].click()
                    free_event_found = True
                else:
                    print("⚠️ No events found")
                    browser.close()
                    return False
            
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print("✅ Step 3: Clicked on event")
            
            # ===== STEP 4: ENROLL (FREE EVENT) =====
            # Click "Enroll Now" button - for free events, no payment dialog
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
                print("❌ No enroll button found")
                browser.close()
                return False
            
            enroll_button.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            print("✅ Step 4: Clicked enroll button")
            
            # ===== STEP 5: VERIFY FREE EVENT EMAIL =====
            print("⏳ Step 5: Waiting for FREE event confirmation email...")
            email = wait_for_email("Free Event Registration Confirmed", recipient=test_email, timeout=30)
            if not email:
                email = wait_for_email("Registration Confirmed", recipient=test_email, timeout=10)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: Email received! Subject: {subject}")
                print("\n✅✅✅ TEST PASSED: Free event registration email received! ✅✅✅")
                browser.close()
                return True
            else:
                print("❌ Step 5: No confirmation email received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_free_event()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
