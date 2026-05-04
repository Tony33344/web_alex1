"""
Test Free Event Registration Flow
Tests that free event registration sends confirmation email
"""
import asyncio
from browser_use import Agent, Browser
import os
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails

async def test_free_event_registration():
    """
    Test free event registration flow and verify confirmation email
    """
    # Clear previous emails
    clear_all_emails()
    
    browser = Browser()
    
    agent = Agent(
        task="""
        1. Navigate to https://infinityroleteachers.com/events
        2. Find a free event (look for events with price 0 or 'Free')
        3. Click on the event to view details
        4. Click the register button
        5. Login with test credentials if prompted
        6. Complete the registration form
        7. Submit the registration
        8. Verify success message appears
        9. Note the order ID or confirmation number
        """,
        browser=browser,
    )
    
    result = await agent.run()
    
    # Check if registration was successful
    if result and "success" in str(result).lower():
        print("✅ Free event registration successful")
        
        # Wait for confirmation email
        print("⏳ Waiting for confirmation email...")
        email = wait_for_email("Free Event Registration Confirmed", timeout=30)
        
        if email:
            print("✅ Confirmation email received!")
            print(f"📧 Email subject: {email.get('Content', {}).get('Headers', {}).get('Subject')}")
            return True
        else:
            print("❌ Confirmation email not received within timeout")
            return False
    else:
        print("❌ Free event registration failed")
        return False

if __name__ == "__main__":
    asyncio.run(test_free_event_registration())
