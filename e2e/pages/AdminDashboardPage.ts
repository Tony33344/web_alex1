import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Admin Dashboard Page Object Model
 */
export class AdminDashboardPage extends BasePage {
  readonly selectors = {
    pageTitle: 'h1:has-text("Dashboard")',
    statCards: '.grid > div > div[class*="Card"]',
    quickActions: 'a[href^="/admin"]',
    loadingIndicator: 'text="..."',
    // Stat card labels
    usersStat: 'text=Total Users',
    membersStat: 'text=Active Members',
    blogStat: 'text=Blog Posts',
    eventsStat: 'text=Events',
    contactsStat: 'text=New Contacts',
    subscribersStat: 'text=Subscribers',
    // Quick actions
    newBlogPostLink: 'a[href="/admin/blog/new"]',
    newEventLink: 'a[href="/admin/events/new"]',
    viewContactsLink: 'a[href="/admin/contacts"]',
    managePagesLink: 'a[href="/admin/pages"]',
  };

  constructor(page: Page) {
    super(page, 'en'); // Admin always uses 'en' or no locale prefix
  }

  async goto() {
    await this.page.goto('/admin');
  }

  // Navigation to admin sections
  async gotoUsers() {
    await this.page.goto('/admin/users');
  }

  async gotoBlog() {
    await this.page.goto('/admin/blog');
  }

  async gotoEvents() {
    await this.page.goto('/admin/events');
  }

  async gotoContacts() {
    await this.page.goto('/admin/contacts');
  }

  async gotoPages() {
    await this.page.goto('/admin/pages');
  }

  async gotoSettings() {
    await this.page.goto('/admin/settings');
  }

  async gotoMembership() {
    await this.page.goto('/admin/membership');
  }

  async gotoMedia() {
    await this.page.goto('/admin/media');
  }

  // Quick actions
  async clickNewBlogPost() {
    await this.clickElement(this.selectors.newBlogPostLink);
  }

  async clickNewEvent() {
    await this.clickElement(this.selectors.newEventLink);
  }

  async clickViewContacts() {
    await this.clickElement(this.selectors.viewContactsLink);
  }

  async clickManagePages() {
    await this.clickElement(this.selectors.managePagesLink);
  }

  // Assertions
  async expectDashboardLoaded() {
    await this.expectElementVisible(this.selectors.pageTitle, 10000);
  }

  async expectAllStatCardsVisible() {
    const expectedStats = [
      this.selectors.usersStat,
      this.selectors.membersStat,
      this.selectors.blogStat,
      this.selectors.eventsStat,
      this.selectors.contactsStat,
      this.selectors.subscribersStat,
    ];

    for (const stat of expectedStats) {
      await this.expectTextOnPage(stat.replace('text=', ''), 5000);
    }
  }

  async expectStatsLoaded() {
    // Wait for loading indicators to disappear
    const loadingIndicators = this.page.locator(this.selectors.loadingIndicator);
    await expect(loadingIndicators).toHaveCount(0, { timeout: 10000 });
  }

  async expectQuickActionsVisible() {
    await this.expectElementVisible(this.selectors.newBlogPostLink);
    await this.expectElementVisible(this.selectors.newEventLink);
    await this.expectElementVisible(this.selectors.viewContactsLink);
    await this.expectElementVisible(this.selectors.managePagesLink);
  }

  async expectAccessDenied() {
    // Check for redirect to login or 403 message
    await expect(this.page).toHaveURL(/.*login.*/, { timeout: 5000 });
  }

  // Get stat values
  async getStatValue(label: string): Promise<string> {
    const statCard = this.page.locator('.grid > div').filter({ hasText: label }).first();
    const value = statCard.locator('div[class*="text-3xl"]').first();
    return await value.textContent() || '';
  }
}
