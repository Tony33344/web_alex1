"""
Helper functions for Stripe checkout form filling
"""
import time

STRIPE_TEST_CARD = "4242424242424242"
STRIPE_TEST_EXPIRY = "12/34"
STRIPE_TEST_CVC = "123"

def fill_stripe_checkout(page, email, name="Test User"):
    """
    Fill Stripe checkout form with test card data.
    Works with both old and new Stripe checkout UI.
    """
    print("   Filling Stripe test card details...")
    
    # Wait for Stripe to load
    page.wait_for_timeout(3000)
    
    # Fill email (outside iframe)
    try:
        email_selectors = [
            "input[name='email']",
            "input[type='email']",
            "input[placeholder*='email' i]",
            "#email"
        ]
        for selector in email_selectors:
            try:
                email_input = page.locator(selector).first
                if email_input.is_visible(timeout=2000):
                    email_input.fill(email)
                    print("   ✅ Filled email")
                    break
            except:
                continue
    except Exception as e:
        print(f"   ⚠️ Email fill failed: {e}")
    
    # Fill card number (in iframe)
    card_filled = False
    try:
        # Try multiple iframe selectors
        iframe_selectors = [
            "iframe[title*='card number' i]",
            "iframe[title*='Card' i]",
            "iframe[name^='__privateStripeFrame']",
            "iframe[src*='stripe']"
        ]
        
        card_frame = None
        for iframe_sel in iframe_selectors:
            try:
                iframe = page.locator(iframe_sel).first
                if iframe.is_visible(timeout=2000):
                    card_frame = iframe.content_frame()
                    if card_frame:
                        print(f"   Found card iframe using: {iframe_sel}")
                        break
            except:
                continue
        
        if card_frame:
            # Try multiple input selectors for card number
            card_input_selectors = [
                "input[name='cardnumber']",
                "input[placeholder*='card number' i]",
                "input[placeholder*='Card' i]",
                "input[type='text']",
                "input"
            ]
            
            for input_sel in card_input_selectors:
                try:
                    card_input = card_frame.locator(input_sel).first
                    if card_input.is_visible(timeout=2000):
                        card_input.fill(STRIPE_TEST_CARD)
                        print("   ✅ Filled card number")
                        card_filled = True
                        break
                except:
                    continue
    except Exception as e:
        print(f"   ⚠️ Card number fill failed: {e}")
    
    if not card_filled:
        print("   ⚠️ Could not fill card number - trying direct page fill")
        try:
            # Fallback: try filling directly on main page (some Stripe versions don't use iframes)
            page.locator("input[placeholder*='card number' i]").first.fill(STRIPE_TEST_CARD)
            print("   ✅ Filled card number (direct)")
        except:
            pass
    
    page.wait_for_timeout(500)
    
    # Fill expiry (in iframe)
    try:
        iframe_selectors = [
            "iframe[title*='expiration' i]",
            "iframe[title*='expiry' i]",
            "iframe[name^='__privateStripeFrame']"
        ]
        
        expiry_frame = None
        for iframe_sel in iframe_selectors:
            try:
                iframe = page.locator(iframe_sel).first
                if iframe.is_visible(timeout=2000):
                    expiry_frame = iframe.content_frame()
                    if expiry_frame:
                        break
            except:
                continue
        
        if expiry_frame:
            expiry_input_selectors = [
                "input[name='exp-date']",
                "input[placeholder*='MM' i]",
                "input[placeholder*='expiry' i]",
                "input[placeholder*='expiration' i]"
            ]
            
            for input_sel in expiry_input_selectors:
                try:
                    expiry_input = expiry_frame.locator(input_sel).first
                    if expiry_input.is_visible(timeout=2000):
                        expiry_input.fill(STRIPE_TEST_EXPIRY)
                        print("   ✅ Filled expiry")
                        break
                except:
                    continue
    except Exception as e:
        print(f"   ⚠️ Expiry fill failed: {e}")
    
    page.wait_for_timeout(500)
    
    # Fill CVC (in iframe)
    try:
        iframe_selectors = [
            "iframe[title*='CVC' i]",
            "iframe[title*='cvc' i]",
            "iframe[title*='security' i]",
            "iframe[name^='__privateStripeFrame']"
        ]
        
        cvc_frame = None
        for iframe_sel in iframe_selectors:
            try:
                iframe = page.locator(iframe_sel).first
                if iframe.is_visible(timeout=2000):
                    cvc_frame = iframe.content_frame()
                    if cvc_frame:
                        break
            except:
                continue
        
        if cvc_frame:
            cvc_input_selectors = [
                "input[name='cvc']",
                "input[placeholder*='CVC' i]",
                "input[placeholder*='security' i]"
            ]
            
            for input_sel in cvc_input_selectors:
                try:
                    cvc_input = cvc_frame.locator(input_sel).first
                    if cvc_input.is_visible(timeout=2000):
                        cvc_input.fill(STRIPE_TEST_CVC)
                        print("   ✅ Filled CVC")
                        break
                except:
                    continue
    except Exception as e:
        print(f"   ⚠️ CVC fill failed: {e}")
    
    page.wait_for_timeout(500)
    
    # Fill cardholder name (outside iframe)
    try:
        name_selectors = [
            "input[name='billingName']",
            "input[name='cardname']",
            "input[placeholder*='name' i]",
            "input[placeholder*='Name' i]"
        ]
        for selector in name_selectors:
            try:
                name_input = page.locator(selector).first
                if name_input.is_visible(timeout=2000):
                    name_input.fill(name)
                    print("   ✅ Filled cardholder name")
                    break
            except:
                continue
    except Exception as e:
        print(f"   ⚠️ Name fill failed: {e}")
    
    page.wait_for_timeout(1000)
    
    # Click Pay button
    try:
        pay_selectors = [
            "button[type='submit']",
            "button:has-text('Pay')",
            "button:has-text('Subscribe')",
            "button:has-text('Complete')",
            "button[data-testid='hosted-payment-submit-button']"
        ]
        
        for selector in pay_selectors:
            try:
                pay_btn = page.locator(selector).first
                if pay_btn.is_visible(timeout=2000):
                    pay_btn.click()
                    print("   ✅ Clicked Pay button")
                    return True
            except:
                continue
        
        # Fallback: use JS to click
        page.evaluate("""() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.textContent || '';
                if (text.includes('Pay') || text.includes('Subscribe') || text.includes('Complete')) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }""")
        print("   ✅ Clicked Pay button (via JS)")
        return True
    except Exception as e:
        print(f"   ⚠️ Pay button click failed: {e}")
        return False
