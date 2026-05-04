"""
Test Event Waitlist Flow with Playwright
Step 1: Register new user
Step 2: Sign in
Step 3: Navigate to events, select full event
Step 4: Join waitlist
Step 5: Verify waitlist confirmation email in Mailhog
"""
from playwright.sync_api import sync_playwright
from mailhog_client import wait_for_email, clear_all_emails
import random
import string

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

TEST_PASSWORD = "TestPassword123!"

def test_waitlist_registration():
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
            page.goto("https://infinityroleteachers.com/en/register")
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
            page.goto("https://infinityroleteachers.com/en/login")
            page.wait_for_load_state("networkidle")
            print("✅ Step 2: Navigated to login page")
            
            page.fill("#email", test_email)
            page.fill("#password", TEST_PASSWORD)
            page.get_by_role("button", name="Sign In").click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            print(f"✅ Step 2: Signed in with {test_email}")
            
            # ===== STEP 3: NAVIGATE TO EVENTS =====
            page.goto("https://infinityroleteachers.com/events")
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
            
            # ===== STEP 4: LOOK FOR WAITLIST =====
            waitlist_button = None
            for text in ["Join Waitlist", "Waitlist", "Join the Waitlist"]:
                try:
                    btn = page.get_by_role("button", name=text, exact=True)
                    if btn.is_visible():
                        waitlist_button = btn
                        print(f"   Found waitlist button: {text}")
                        break
                except:
                    continue
            
            if not waitlist_button:
                # Try text link
                try:
                    waitlist_link = page.get_by_text("Waitlist").first
                    if waitlist_link.is_visible():
                        waitlist_button = waitlist_link
                        print("   Found waitlist text link")
                except:
                    pass
            
            if not waitlist_button:
                print("❌ No waitlist button found - event may not be full")
                browser.close()
                return False
            
            waitlist_button.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            print("✅ Step 4: Clicked waitlist button")
            
            # Submit waitlist form if needed
            submit_btn = None
            for text in ["Submit", "Join", "Confirm"]:
                try:
                    btn = page.get_by_role("button", name=text, exact=True)
                    if btn.is_visible():
                        submit_btn = btn
                        break
                except:
                    continue
            
            if submit_btn and submit_btn.is_visible():
                submit_btn.click()
                page.wait_for_load_state("networkidle")
                print("✅ Step 4: Submitted waitlist registration")
            
            # ===== STEP 5: VERIFY EMAIL IN MAILHOG =====
            print("⏳ Step 5: Waiting for waitlist confirmation email...")
            email = wait_for_email("Waitlist", timeout=30)
            if not email:
                email = wait_for_email("waitlist", timeout=10)
            
            if email:
                subject = email.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                print(f"✅ Step 5: Email received! Subject: {subject}")
                browser.close()
                return True
            else:
                print("❌ Step 5: No waitlist email received")
                print("📧 Check Mailhog at http://localhost:8025")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    success = test_waitlist_registration()
    print(f"\nTest result: {'PASSED' if success else 'FAILED'}")
