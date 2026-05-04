"""
Main Test Runner for Email Flow Automation (Playwright)
Runs all email flow tests in sequence
"""
from test_registration_flow import test_user_registration
from test_free_event import test_free_event
from test_paid_event_stripe import test_paid_event_stripe
from test_paid_event_bank_transfer import test_paid_event_bank_transfer
from test_program_bank_transfer import test_program_bank_transfer
from test_program_stripe import test_program_stripe
from test_membership_bank_transfer import test_membership_bank_transfer
from test_membership_stripe import test_membership_stripe
from test_donation_bank_transfer import test_donation_bank_transfer
from test_donation_stripe import test_donation_stripe
from test_contact_form import test_contact_form

def run_all_tests():
    """
    Run all email flow tests
    """
    print("=" * 60)
    print("Running Comprehensive Email Flow Automation Tests")
    print("=" * 60)
    print()
    
    results = {}
    
    # Test 1: User Registration
    print("Test 1: User Registration")
    print("-" * 60)
    success, email = test_user_registration()
    results['registration'] = success
    print()
    
    # Test 2: Free Event
    print("Test 2: Free Event Registration")
    print("-" * 60)
    success = test_free_event()
    results['free_event'] = success
    print()
    
    # Test 3: Paid Event with Stripe
    print("Test 3: Paid Event Registration with Stripe Test Card")
    print("-" * 60)
    success = test_paid_event_stripe()
    results['paid_event_stripe'] = success
    print()
    
    # Test 4: Paid Event with Bank Transfer
    print("Test 4: Paid Event Registration with Bank Transfer")
    print("-" * 60)
    success = test_paid_event_bank_transfer()
    results['paid_event_bank_transfer'] = success
    print()
    
    # Test 5: Membership Bank Transfer
    print("Test 5: Membership Bank Transfer Flow")
    print("-" * 60)
    success = test_membership_bank_transfer()
    results['membership_bank_transfer'] = success
    print()
    
    # Test 6: Program Bank Transfer
    print("Test 6: Program Enrollment with Bank Transfer")
    print("-" * 60)
    success = test_program_bank_transfer()
    results['program_bank_transfer'] = success
    print()
    
    # Test 7: Program Stripe
    print("Test 7: Program Enrollment with Stripe")
    print("-" * 60)
    success = test_program_stripe()
    results['program_stripe'] = success
    print()
    
    # Test 8: Membership Stripe
    print("Test 8: Membership Stripe Payment Flow")
    print("-" * 60)
    success = test_membership_stripe()
    results['membership_stripe'] = success
    print()
    
    # Test 9: Donation Bank Transfer
    print("Test 9: Donation with Bank Transfer")
    print("-" * 60)
    success = test_donation_bank_transfer()
    results['donation_bank_transfer'] = success
    print()
    
    # Test 10: Donation Stripe
    print("Test 10: Donation with Stripe")
    print("-" * 60)
    success = test_donation_stripe()
    results['donation_stripe'] = success
    print()
    
    # Test 11: Contact Form
    print("Test 11: Contact Form (Admin + User Emails)")
    print("-" * 60)
    success = test_contact_form()
    results['contact_form'] = success
    print()
    
    # Note: Waitlist test requires full event capacity
    print()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results.items():
        if passed is None:
            status = "⚠️ SKIPPED"
        elif passed:
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total_passed = sum(1 for v in results.values() if v)
    total_skipped = sum(1 for v in results.values() if v is None)
    total_tests = len(results)
    print()
    print(f"Total: {total_passed}/{total_tests} tests passed ({total_skipped} skipped)")
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    run_all_tests()
