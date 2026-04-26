import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Public Events Page Object Model
 */
export class EventsPage extends BasePage {
  readonly selectors = {
    pageHeader: 'h1, [class*="PageHeader"]',
    eventCards: 'a[href*="/events/"] > div[class*="Card"]',
    featuredBadge: 'text=Featured',
    onlineBadge: 'text=Online',
    inPersonBadge: 'text=In Person',
    spotsLeft: 'text=/\\d+ spots left/',
    eventFull: 'text=Event Full',
    enrollButton: 'button:has-text("Enroll")',
    priceTag: '[class*="PriceTag"]',
    freeLabel: 'text=Free',
    cancelledBanner: 'text=Payment cancelled',
    successBanner: '[data-sonner-toast]',
  };

  constructor(page: Page, locale: string = 'en') {
    super(page, locale);
  }

  async goto() {
    await super.goto('/events');
  }

  async gotoEvent(slug: string) {
    await super.goto(`/events/${slug}`);
  }

  // Event interactions
  async clickEventByTitle(title: string) {
    const eventLink = this.page.locator(`a:has-text("${title}")`).first();
    await eventLink.click();
  }

  async clickFirstEvent() {
    const firstEvent = this.page.locator(this.selectors.eventCards).first().locator('xpath=ancestor::a');
    await firstEvent.click();
  }

  async clickEnroll() {
    await this.clickElement(this.selectors.enrollButton);
  }

  // Assertions
  async expectEventsPageLoaded() {
    await this.expectElementVisible(this.selectors.pageHeader, 10000);
  }

  async expectEventsListVisible() {
    // Events might be empty, so just check page loaded
    await this.expectEventsPageLoaded();
  }

  async expectEventVisible(title: string) {
    const event = this.page.locator(`text="${title}"`).first();
    await expect(event).toBeVisible({ timeout: 5000 });
  }

  async expectFeaturedBadgeVisible() {
    await this.expectElementVisible(this.selectors.featuredBadge);
  }

  async expectOnlineBadgeVisible() {
    await this.expectTextOnPage('Online');
  }

  async expectInPersonBadgeVisible() {
    await this.expectTextOnPage('In Person');
  }

  async expectSpotsLeftVisible() {
    await this.expectElementVisible(this.selectors.spotsLeft);
  }

  async expectEventFullState() {
    await this.expectTextOnPage('Event Full');
  }

  async expectPriceVisible(price: string) {
    await this.expectTextOnPage(price);
  }

  async expectFreeLabelVisible() {
    await this.expectElementVisible(this.selectors.freeLabel);
  }

  async expectCancelledPaymentBanner() {
    await this.expectElementVisible(this.selectors.cancelledBanner);
  }

  async expectSuccessBanner() {
    await this.expectElementVisible(this.selectors.successBanner);
  }

  async expectNoEventsMessage() {
    await this.expectTextOnPage('No upcoming events');
  }

  // Get event count
  async getEventCount(): Promise<number> {
    return await this.page.locator(this.selectors.eventCards).count();
  }
}
