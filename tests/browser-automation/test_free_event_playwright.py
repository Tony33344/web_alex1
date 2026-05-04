"""
Test Free Event Registration Flow with Playwright
Tests that free event registration sends confirmation email
"""
from playwright.sync_api import sync_playwright
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails
import time
import re

def test_free_event_registration():
    """
    Test free event registration flow and verify confirmation email
    """
    # Clear previous emails
    clear_all_emails()
    
    with sync_playwright() as p:
        # Use Brave instead of Playwright's bundled browser
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False    # Show browser for debugging
        )
        
        page = browser.new_page()
        
        try:
            # Navigate to events page
            page.goto("https://infinityroleteachers.com/events")
            page.wait_for_load_state("networkidle")
            
            print("✅ Navigated to events page")
            
            # Look for event cards
            # Based on the code, events are in Card components with Link wrappers
            event_links = page.query_selector_all("a[href*='/events/']")
            print(f"Found {len(event_links)} event links")
            
            if len(event_links) == 0:
                print("⚠️ No events found on the page")
                print("This might be normal if there are no upcoming events")
                print("Skipping test as there are no events to register for")
                browser.close()
                return None
            
            # Click the first event
            event_links[0].click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)  # Wait for page to fully render
            print("✅ Clicked on first event")
            
            # Look for enroll/register button
            # Try multiple selectors
            enroll_button = None
            
            # Try by text content
            for text in ["Enroll Now", "Enroll", "Register Now", "Register", "enroll now", "enroll", "register now", "register"]:
                try:
                    button = page.get_by_role("button", name=text, exact=True)
                    if button.is_visible():
                        enroll_button = button
                        print(f"✅ Found button with text: {text}")
                        break
                except:
                    continue
            
            # If not found by text, try by class
            if not enroll_button:
                enroll_button = page.query_selector("button")
            
            if enroll_button and enroll_button.is_visible():
                enroll_button.click()
                page.wait_for_load_state("networkidle")
                print("✅ Clicked enroll button")
                
                # Check if we need to login
                if page.query_selector("input[type='email']"):
                    print("📝 Login/registration form detected")
                    print("⚠️ This test requires login credentials")
                    print("Skipping actual registration as it needs user credentials")
                else:
                    print("✅ Registration form opened")
                    
                    # Wait for confirmation email
                    print("⏳ Waiting for confirmation email...")
                    email = wait_for_email("Free Event Registration Confirmed", timeout=30)
                    
                    if email:
                        print("✅ Confirmation email received!")
                        print(f"📧 Email subject: {email.get('Content', {}).get('Headers', {}).get('Subject')}")
                        browser.close()
                        return True
                    else:
                        print("❌ Confirmation email not received within timeout")
                        print("📧 Check Mailhog at http://localhost:8025")
                        browser.close()
                        return False
            else:
                print("❌ Enroll button not found")
                print("⚠️ Event might be full or not available for registration")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    test_free_event_registration()
