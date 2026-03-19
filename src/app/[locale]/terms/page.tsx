import { PageHeader } from '@/components/shared/PageHeader';

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" subtitle="Last updated: January 2026" />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="prose max-w-none text-muted-foreground">
          <h2 className="text-foreground">1. General</h2>
          <p>These Terms and Conditions govern your use of the Infinity Role Teachers platform operated by AMS4EVER AG. By accessing or using our services, you agree to these terms.</p>

          <h2 className="text-foreground">2. Services</h2>
          <p>Infinity Role Teachers provides wellness education, coaching programs, events, and membership services. Access to certain content and features requires a paid membership or event registration.</p>

          <h2 className="text-foreground">3. Membership</h2>
          <p>Membership subscriptions are billed on a recurring basis (monthly or yearly). You may cancel your subscription at any time through your account settings or the Stripe customer portal. Cancellations take effect at the end of the current billing period.</p>

          <h2 className="text-foreground">4. Payments</h2>
          <p>All payments are processed securely through Stripe. We also accept direct bank transfers to AMS4EVER AG. Prices are displayed in CHF unless otherwise stated.</p>

          <h2 className="text-foreground">5. Events</h2>
          <p>Event registrations are subject to availability. Cancellation policies vary by event and will be communicated at the time of registration. Free events may be cancelled with 24 hours notice.</p>

          <h2 className="text-foreground">6. Intellectual Property</h2>
          <p>All content on this platform, including text, images, videos, and course materials, is the property of AMS4EVER AG and may not be reproduced without written permission.</p>

          <h2 className="text-foreground">7. Limitation of Liability</h2>
          <p>Our wellness and coaching services are educational in nature and do not replace professional medical advice. AMS4EVER AG is not liable for any health outcomes resulting from the application of techniques taught on this platform.</p>

          <h2 className="text-foreground">8. Contact</h2>
          <p>For questions about these terms, contact us at info@infinityroleteachers.com.</p>
        </div>
      </section>
    </>
  );
}
