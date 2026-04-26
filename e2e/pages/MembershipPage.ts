import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Membership Page Object Model
 */
export class MembershipPage extends BasePage {
  readonly selectors = {
    pageHeader: 'h1, [class*="PageHeader"]',
    membershipPlans: '[class*="plan"], [class*="Plan"]',
    planTitle: 'h2, h3',
    planPrice: '[class*="price"], [class*="Price"]',
    planFeatures: '[class*="features"], [class*="Features"]',
    galleryImages: 'img[class*="gallery"], [class*="Gallery"] img',
    checkoutButton: 'button:has-text("Join"), button:has-text("Subscribe"), button:has-text("Select")',
    memberContent: '[data-members-only]',
  };

  constructor(page: Page, locale: string = 'en') {
    super(page, locale);
  }

  async goto() {
    await super.goto('/membership');
  }

  // Plan interactions
  async selectPlan(planName: string) {
    const plan = this.page.locator(this.selectors.membershipPlans).filter({ hasText: planName }).first();
    const button = plan.locator(this.selectors.checkoutButton);
    await button.click();
  }

  async clickFirstPlan() {
    const firstPlan = this.page.locator(this.selectors.membershipPlans).first();
    const button = firstPlan.locator(this.selectors.checkoutButton);
    await button.click();
  }

  // Assertions
  async expectMembershipPageLoaded() {
    await this.expectElementVisible(this.selectors.pageHeader, 10000);
  }

  async expectPlansVisible() {
    const count = await this.page.locator(this.selectors.membershipPlans).count();
    expect(count).toBeGreaterThan(0);
  }

  async expectPlanVisible(planName: string) {
    const plan = this.page.locator(this.selectors.membershipPlans).filter({ hasText: planName });
    await expect(plan.first()).toBeVisible({ timeout: 5000 });
  }

  async expectPlanPriceVisible(planName: string, price: string) {
    const plan = this.page.locator(this.selectors.membershipPlans).filter({ hasText: planName });
    await expect(plan.locator(this.selectors.planPrice).first()).toContainText(price);
  }

  async expectGalleryImagesLoaded() {
    const images = this.page.locator(this.selectors.galleryImages);
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectMemberContentVisible() {
    await this.expectElementVisible(this.selectors.memberContent);
  }

  async expectMemberContentHidden() {
    await this.expectElementHidden(this.selectors.memberContent);
  }

  // Get plan count
  async getPlanCount(): Promise<number> {
    return await this.page.locator(this.selectors.membershipPlans).count();
  }
}
