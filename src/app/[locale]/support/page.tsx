import { getTranslations } from 'next-intl/server';
import { Mail, MapPin, Clock, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { ContactForm } from '../contact/ContactForm';

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const supportPage = await getPage('support');

  const pageTitle = supportPage ? (getLocalizedField(supportPage, 'title', locale) || 'Customer Support') : 'Customer Support';
  const pageContent = supportPage ? (getLocalizedField(supportPage, 'content', locale) || "We're here to help. Reach out to us for assistance with bookings, payments, or any questions.") : "We're here to help. Reach out to us for assistance with bookings, payments, or any questions.";

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageContent}
        backgroundColor={supportPage?.background_color}
        gradientTo={supportPage?.banner_gradient_to}
        width={supportPage?.banner_width}
        height={supportPage?.banner_height}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.send')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Support Info Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Information */}
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Support Email</h4>
                    <a 
                      href="mailto:support@infinityroleteachers.com" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      support@infinityroleteachers.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Company Address</h4>
                    <p className="text-sm text-muted-foreground">
                      AMS4EVER AG<br />
                      Switzerland
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Response Time</h4>
                    <p className="text-sm text-muted-foreground">
                      Within 24-48 hours<br />
                      Monday - Friday
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help Topics */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Common Issues</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Booking and registration problems</li>
                  <li>• Payment and refund inquiries</li>
                  <li>• Event and program information</li>
                  <li>• Account access issues</li>
                  <li>• Membership questions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
