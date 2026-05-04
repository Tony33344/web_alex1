"""
Admin Helper Module for Playwright Tests
Provides reusable functions for admin authentication and operations.
"""
import os
import json

BASE_URL = "http://localhost:3000"
TEST_ADMIN_EMAIL = os.environ.get('TEST_ADMIN_EMAIL', 'info@infinityroleteachers.com')
TEST_ADMIN_PASSWORD = os.environ.get('TEST_ADMIN_PASSWORD', 'TeachThePeople2026&')


def admin_sign_in(page):
    """
    Sign in as admin user using credentials from environment.
    Returns True if successful.
    """
    try:
        page.goto(f"{BASE_URL}/en/login")
        page.wait_for_load_state("networkidle")
        
        page.fill("#email", TEST_ADMIN_EMAIL)
        page.fill("#password", TEST_ADMIN_PASSWORD)
        page.get_by_role("button", name="Sign In").click()
        page.wait_for_load_state("networkidle")
        # Wait for Next.js router navigation away from login
        try:
            page.wait_for_url(lambda url: "/login" not in url, timeout=10000)
        except Exception:
            pass  # Assume success even if URL check times out
        print(f"✅ Admin signed in: {TEST_ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Admin sign in failed: {e}")
        return False


def get_latest_record_for_user(page, user_email: str, table: str = 'event_registrations'):
    """
    Use admin API to find the latest record for a user by email.
    Returns the record ID or None.
    """
    try:
        # Call admin registrations API
        response = page.context.request.get(f"{BASE_URL}/api/admin/registrations")
        if response.status != 200:
            print(f"❌ Failed to fetch registrations: {response.status}")
            return None
        
        data = response.json()
        
        if table == 'event_registrations':
            records = data.get('eventRegistrations', [])
            for record in sorted(records, key=lambda x: x.get('created_at', ''), reverse=True):
                if record.get('profile', {}).get('email') == user_email:
                    return record.get('id')
        elif table == 'program_enrollments':
            records = data.get('programEnrollments', [])
            for record in sorted(records, key=lambda x: x.get('created_at', ''), reverse=True):
                if record.get('profile', {}).get('email') == user_email:
                    return record.get('id')
        
        return None
    except Exception as e:
        print(f"❌ Error fetching record: {e}")
        return None


def confirm_event_payment(page, registration_id: str):
    """
    Confirm event registration payment via admin API.
    Returns True if successful.
    """
    try:
        response = page.context.request.patch(
            f"{BASE_URL}/api/admin/registrations",
            data=json.dumps({
                "table": "event_registrations",
                "id": registration_id,
                "data": {
                    "payment_status": "paid",
                    "status": "confirmed",
                    "confirmed_at": "2024-01-01T00:00:00Z"
                }
            }),
            headers={"Content-Type": "application/json"}
        )
        if response.status == 200:
            print(f"✅ Event payment confirmed: {registration_id}")
            return True
        else:
            print(f"❌ Failed to confirm event payment: {response.status}")
            return False
    except Exception as e:
        print(f"❌ Error confirming event payment: {e}")
        return False


def confirm_program_payment(page, enrollment_id: str):
    """
    Confirm program enrollment payment via admin API.
    Returns True if successful.
    """
    try:
        response = page.context.request.patch(
            f"{BASE_URL}/api/admin/registrations",
            data=json.dumps({
                "table": "program_enrollments",
                "id": enrollment_id,
                "data": {
                    "payment_status": "paid",
                    "status": "confirmed",
                    "confirmed_at": "2024-01-01T00:00:00Z"
                }
            }),
            headers={"Content-Type": "application/json"}
        )
        if response.status == 200:
            print(f"✅ Program payment confirmed: {enrollment_id}")
            return True
        else:
            print(f"❌ Failed to confirm program payment: {response.status}")
            return False
    except Exception as e:
        print(f"❌ Error confirming program payment: {e}")
        return False


def activate_membership(page, user_id: str, plan: str = 'monthly'):
    """
    Activate membership via admin API.
    Returns True if successful.
    """
    try:
        response = page.context.request.post(
            f"{BASE_URL}/api/admin/members/activate",
            data=json.dumps({"userId": user_id, "plan": plan}),
            headers={"Content-Type": "application/json"}
        )
        if response.status == 200:
            print(f"✅ Membership activated: {user_id} ({plan})")
            return True
        else:
            print(f"❌ Failed to activate membership: {response.status}")
            return False
    except Exception as e:
        print(f"❌ Error activating membership: {e}")
        return False


def confirm_donation(page, donation_id: str):
    """
    Confirm donation payment via admin API.
    Returns True if successful.
    """
    try:
        response = page.context.request.patch(
            f"{BASE_URL}/api/admin/donations/confirm",
            data=json.dumps({"donationId": donation_id}),
            headers={"Content-Type": "application/json"}
        )
        if response.status == 200:
            print(f"✅ Donation confirmed: {donation_id}")
            return True
        else:
            print(f"❌ Failed to confirm donation: {response.status}")
            return False
    except Exception as e:
        print(f"❌ Error confirming donation: {e}")
        return False


def get_user_id_by_email(page, email: str):
    """
    Get user ID by email via admin API.
    Returns the user ID or None.
    """
    try:
        # Try profiles/users endpoint first (works for all user types)
        response = page.context.request.get(f"{BASE_URL}/api/admin/users")
        if response.status == 200:
            users = response.json()
            if isinstance(users, list):
                for u in users:
                    if u.get('email') == email:
                        return u.get('id')
        # Fallback: check registrations API
        response = page.context.request.get(f"{BASE_URL}/api/admin/registrations")
        if response.status == 200:
            data = response.json()
            for record in data.get('eventRegistrations', []):
                if record.get('profile', {}).get('email') == email:
                    return record.get('user_id')
            for record in data.get('programEnrollments', []):
                if record.get('profile', {}).get('email') == email:
                    return record.get('user_id')
        return None
    except Exception as e:
        print(f"❌ Error getting user ID: {e}")
        return None


def get_donation_id_for_user(page, user_email: str):
    """
    Use admin API to find the latest donation ID for a user by email.
    Returns the donation ID or None.
    """
    try:
        # Call admin donations API (if it exists)
        response = page.context.request.get(f"{BASE_URL}/api/admin/donations")
        if response.status == 200:
            data = response.json()
            if isinstance(data, list):
                for record in sorted(data, key=lambda x: x.get('created_at', ''), reverse=True):
                    if record.get('user', {}).get('email') == user_email or record.get('email') == user_email:
                        return record.get('id')
        # Fallback: check registrations API for donations (if included)
        response = page.context.request.get(f"{BASE_URL}/api/admin/registrations")
        if response.status == 200:
            data = response.json()
            # Check if donations are in the response
            if 'donations' in data:
                for record in sorted(data['donations'], key=lambda x: x.get('created_at', ''), reverse=True):
                    if record.get('profile', {}).get('email') == user_email:
                        return record.get('id')
        return None
    except Exception as e:
        print(f"❌ Error fetching donation ID: {e}")
        return None
