import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.infinityroleteachers.com';
const logoUrl = 'https://nchbiryeykludxrrdfaw.supabase.co/storage/v1/object/public/images/pages/home/logo%20small%20transparent.png';

export const metadata: Metadata = {
  title: "Infinity Role Teachers — Holistic Wellness & Coach Training",
  description: "Transform your life through holistic wellness, Sunyoga, Acupressure, and certified coach training programs by Infinity Role Teachers.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
  },
  openGraph: {
    title: "Infinity Role Teachers — Holistic Wellness & Coach Training",
    description: "Transform your life through holistic wellness, Sunyoga, Acupressure, and certified coach training programs by Infinity Role Teachers.",
    url: siteUrl,
    siteName: 'Infinity Role Teachers',
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: 'Infinity Role Teachers Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Infinity Role Teachers — Holistic Wellness & Coach Training",
    description: "Transform your life through holistic wellness, Sunyoga, Acupressure, and certified coach training programs.",
    images: [logoUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
