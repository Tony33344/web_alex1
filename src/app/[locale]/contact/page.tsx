import { getTranslations } from 'next-intl/server';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const contactPage = await getPage('contact');

  const pageTitle = contactPage ? (getLocalizedField(contactPage, 'title', locale) || t('contact.title')) : t('contact.title');
  const pageContent = contactPage ? (getLocalizedField(contactPage, 'content', locale) || '') : '';

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageContent}
        backgroundColor={contactPage?.background_color}
        gradientTo={contactPage?.banner_gradient_to}
        textColor={contactPage?.text_color}
        width={contactPage?.banner_width}
        height={contactPage?.banner_height}
      />

      {/* Logo */}
      <div className="mx-auto max-w-7xl px-4 pt-8 text-center sm:px-6 lg:px-8">
        <img
          src="https://nchbiryeykludxrrdfaw.supabase.co/storage/v1/object/public/images/pages/home/logo%20small%20transparent.png"
          alt="Infinity Role Teachers"
          className="mx-auto h-48 w-auto"
        />
      </div>

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

          {/* Contact Info Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </section>
    </>
  );
}
