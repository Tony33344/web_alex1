"""
Test Welcome Email After Email Verification
Tests that welcome email is sent after user verifies their email
"""
import asyncio
from browser_use import Agent, Browser
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails

async def test_welcome_email_flow():
    """
    Test signup, email verification, and welcome email flow
    """
    # Clear previous emails
    clear_all_emails()
    
    browser = Browser()
    
    agent = Agent(
        task="""
        1. Navigate to https://infinityroleteachers.com/register
        2. Fill in the registration form with a new test email
        3. Submit the registration
        4. Note: You will receive a verification email
        5. Check your email inbox for the verification link
        6. Click the verification link
        7. After verification, wait for welcome email
        8. Verify welcome email arrives with subject 'Welcome to Infinity Role Teachers'
        9. Check that welcome email contains:
           - User's name
           - Link to profile page
           - Link to events page
           - Link to programs page
           - Link to membership page
        """,
        browser=browser,
    )
    
    result = await agent.run()
    
    if result and ("welcome" in str(result).lower() or "verification" in str(result).lower()):
        print("✅ Welcome email flow successful")
        
        # Wait for welcome email
        print("⏳ Waiting for welcome email...")
        email = wait_for_email("Welcome to Infinity Role Teachers", timeout=45)
        
        if email:
            print("✅ Welcome email received!")
            print(f"📧 Email subject: {email.get('Content', {}).get('Headers', {}).get('Subject')}")
            print("📧 Check your email for:")
            print("   1. Email verification link")
            print("   2. Welcome email after verification")
            return True
        else:
            print("❌ Welcome email not received within timeout")
            return False
    else:
        print("❌ Welcome email flow failed")
        return False

if __name__ == "__main__":
    asyncio.run(test_welcome_email_flow())
