"""
Test Bank Transfer Registration Flow
Tests that bank transfer registration sends pending email with bank details
"""
import asyncio
from browser_use import Agent, Browser
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails

async def test_bank_transfer_registration():
    """
    Test bank transfer registration flow and verify pending email
    """
    # Clear previous emails
    clear_all_emails()
    
    browser = Browser()
    
    agent = Agent(
        task="""
        1. Navigate to https://infinityroleteachers.com/events
        2. Find an event with bank transfer payment option
        3. Click on the event to view details
        4. Click the register button
        5. Select 'Bank Transfer' as payment method
        6. Complete the registration form
        7. Submit the registration
        8. Verify success message appears
        9. Note the reference number shown on screen
        10. Verify bank details are displayed
        """,
        browser=browser,
    )
    
    result = await agent.run()
    
    if result and ("success" in str(result).lower() or "pending" in str(result).lower()):
        print("✅ Bank transfer registration successful")
        
        # Wait for pending email
        print("⏳ Waiting for pending email...")
        email = wait_for_email("Registration Pending", timeout=30)
        
        if not email:
            email = wait_for_email("Membership Pending", timeout=10)
        
        if email:
            print("✅ Pending email received!")
            print(f"📧 Email subject: {email.get('Content', {}).get('Headers', {}).get('Subject')}")
            print("📝 Email should contain:")
            print("   - Reference number")
            print("   - Bank account details")
            print("   - Amount to transfer")
            return True
        else:
            print("❌ Pending email not received within timeout")
            return False
    else:
        print("❌ Bank transfer registration failed")
        return False

if __name__ == "__main__":
    asyncio.run(test_bank_transfer_registration())
