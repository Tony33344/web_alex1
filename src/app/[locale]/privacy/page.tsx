import { PageHeader } from '@/components/shared/PageHeader';

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" subtitle="Last updated: January 2026" />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="prose max-w-none text-muted-foreground">
          <h2 className="text-foreground">1. Data Controller</h2>
          <p>AMS4EVER AG is the data controller for personal data collected through the Infinity Role Teachers platform.</p>

          <h2 className="text-foreground">2. Data We Collect</h2>
          <p>We collect the following personal data: name, email address, phone number (optional), preferred language, payment information (processed by Stripe), and usage data.</p>

          <h2 className="text-foreground">3. How We Use Your Data</h2>
          <p>Your data is used to: provide and improve our services, process payments, send transactional emails, send newsletters (with consent), and manage event registrations.</p>

          <h2 className="text-foreground">4. Data Storage</h2>
          <p>Your data is stored securely using Supabase (PostgreSQL). Payment data is processed and stored by Stripe. We do not store credit card details on our servers.</p>

          <h2 className="text-foreground">5. Your Rights</h2>
          <p>Under GDPR and Swiss data protection law, you have the right to: access your data, correct inaccurate data, request deletion, restrict processing, data portability, and object to processing.</p>

          <h2 className="text-foreground">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies without your consent.</p>

          <h2 className="text-foreground">7. Newsletter</h2>
          <p>You may subscribe to our newsletter during registration or via the website. You can unsubscribe at any time using the link in each email or through your account settings.</p>

          <h2 className="text-foreground">8. Contact</h2>
          <p>For privacy-related inquiries, contact us at info@infinityroleteachers.com.</p>
        </div>
      </section>
    </>
  );
}
