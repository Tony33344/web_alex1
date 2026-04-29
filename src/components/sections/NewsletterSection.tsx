'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface NewsletterSectionProps {
  title: string;
  placeholder: string;
  buttonLabel: string;
}

export function NewsletterSection({ title, placeholder, buttonLabel }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <img
          src="https://infinityroleteachers.com/logo/logo.jpeg"
          alt="Infinity Role Teachers"
          className="mx-auto mb-6 h-48 w-auto"
        />
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted-foreground">Stay updated with our latest news, events, and wellness tips</p>
        {success ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Thank you for subscribing!</span>
          </div>
        ) : (
          <form className="mt-6 flex gap-2" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-md border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonLabel}
            </Button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </section>
  );
}
