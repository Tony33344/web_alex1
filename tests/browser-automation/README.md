# Email Flow Automation Tests

Automated testing for email notification flows using Playwright and Mailhog for email verification.

## What This Tests

This automation tests all email notification flows you implemented:

1. **User Registration** - Verifies email verification is sent
2. **Paid Event Registration (Stripe)** - Verifies confirmation email after Stripe payment
3. **Paid Event Registration (Bank Transfer)** - Verifies pending email with bank details
4. **Waitlist Registration** - Verifies waitlist confirmation email with position
5. **Membership Bank Transfer** - Verifies membership pending email

## Prerequisites

- Python 3.11 or higher
- Ubuntu 26.04 (or any modern Linux)
- Brave browser installed (or Chrome)
- Docker (for Mailhog)
- Virtual environment (already created)

## Setup

### 1. Start Mailhog (Email Testing Server)

```bash
sudo docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog
```

**Mailhog will be available at**:
- Web UI: http://localhost:8025
- SMTP: localhost:1025
- API: http://localhost:8025/api/v2

### 2. Activate Virtual Environment

```bash
cd /home/mark/CascadeProjects/webplatfrom Alexandra1/events/infinity-role-teachers
source venv/bin/activate
```

### 3. Install Dependencies (Already Done)

```bash
./venv/bin/pip install playwright
```

### 4. Configure Email Transporter to Use Mailhog

To capture emails in Mailhog during testing, add to your `.env` file:

```bash
USE_MAILHOG=true
```

This configures the email transporter to use Mailhog SMTP instead of your real email service.

**Note**: This only applies when USE_MAILHOG=true. In production, emails will use your real SMTP configuration.

### 5. Configure Environment Variables (Optional)

Create a `.env` file in the tests/browser-automation directory:

```bash
# Optional: Add your LLM API key if you want to use AI features
# Not needed for Playwright tests
```

## Running Tests

### Run All Tests

```bash
cd tests/browser-automation
source ../../venv/bin/activate
python run_all_tests.py
```

### Run Individual Tests

```bash
# User registration
python test_registration_flow.py

# Paid event with Stripe
python test_paid_event_stripe.py

# Paid event with bank transfer
python test_paid_event_bank_transfer.py

# Waitlist flow
python test_waitlist_flow.py

# Membership bank transfer
python test_membership_bank_transfer.py
```

## How It Works

### Playwright + Mailhog Integration

Each test:
1. Clears previous emails from Mailhog
2. Opens Brave browser
3. Navigates to infinityroleteachers.com
4. Performs the specific user flow (register, enroll, join waitlist, etc.)
5. Fills forms with test data (random email, password, etc.)
6. Submits forms
7. **Automatically checks Mailhog for the expected email**
8. Reports if email arrived within timeout (30-60 seconds)
9. Closes the browser

### Email Verification

The tests use the `mailhog_client.py` utility to:
- Clear emails before each test
- Wait for emails with specific subjects
- Verify email content
- Report results

### Viewing Emails in Mailhog

You can view all captured emails at: http://localhost:8025

This is useful for:
- Debugging failed tests
- Manually verifying email content
- Checking email formatting

## Test Data

The tests generate random test emails for each run to avoid conflicts:
- Format: `test[randomstring]@example.com`
- Example: `testabc12345@example.com`

Passwords use a standard test password: `TestPassword123!`

## Troubleshooting

### Mailhog Not Running

```bash
# Check if Mailhog is running
sudo docker ps | grep mailhog

# Start Mailhog if stopped
sudo docker start mailhog

# Restart Mailhog
sudo docker restart mailhog
```

### Browser Not Found

If Brave is not found, update the executable path in test files:
```python
browser = p.chromium.launch(
    executable_path="/path/to/chrome",
    headless=False
)
```

### Headless Mode

To run tests without GUI (headless mode):
```python
browser = p.chromium.launch(
    executable_path="/usr/bin/brave-browser",
    headless=True
)
```

### Email Timeout

If emails are taking too long to arrive, increase the timeout in test files:
```python
email = wait_for_email("Subject", timeout=60)  # 60 seconds instead of 30
```

### Tests Failing Because Emails Not Captured

If emails aren't being captured by Mailhog:
1. Verify USE_MAILHOG=true is set in your .env file
2. Check Mailhog web UI at http://localhost:8025
3. Verify your Next.js app is using the environment variable

## Stopping Mailhog

When done testing, stop the Mailhog container:

```bash
sudo docker stop mailhog
```

To remove it completely:

```bash
sudo docker rm mailhog
```

## Customization

### Add New Tests

Create a new test file in `tests/browser-automation/`:

```python
from playwright.sync_api import sync_playwright
from mailhog_client import check_email_sent, wait_for_email, clear_all_emails
import random
import string

def generate_test_email():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_str}@example.com"

def test_your_flow():
    clear_all_emails()
    test_email = generate_test_email()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/brave-browser",
            headless=False
        )
        
        page = browser.new_page()
        
        try:
            # Your test logic here
            page.goto("https://infinityroleteachers.com")
            
            # Wait for expected email
            email = wait_for_email("Expected Subject", timeout=30)
            
            if email:
                print("✅ Test passed")
                browser.close()
                return True
            else:
                print("❌ Test failed")
                browser.close()
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            browser.close()
            return False

if __name__ == "__main__":
    test_your_flow()
```

### Modify Existing Tests

Edit the task strings and selectors in each test file to customize what it tests.

## Benefits

- **No manual clicking** - Playwright navigates the site automatically
- **Tests all flows** - Registration, Stripe, bank transfer, waitlist, membership
- **Automated email verification** - Mailhog captures and verifies emails
- **Catches bugs** - If flow or email fails, test fails
- **Run on schedule** - Can run daily/weekly
- **Save time** - No need to manually test each flow and check emails

## Next Steps

1. Run the tests to verify they work
2. Check Mailhog UI (http://localhost:8025) to see captured emails
3. Verify email content matches expectations
4. Set USE_MAILHOG=true in your .env for email capture
5. Integrate into CI/CD pipeline (optional)
6. Schedule regular runs (optional)

## Support

- Playwright documentation: https://playwright.dev
- Mailhog documentation: https://github.com/mailhog/Mailhog

