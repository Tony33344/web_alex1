'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Heart, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';
import { useUser } from '@/hooks/useUser';

const donationSchema = {
  amount: { type: 'number', required: 'Amount is required' },
  message: { type: 'string', required: false },
};

export function DonateForm({ locale }: { locale: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [hasReference, setHasReference] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      amount: 0,
      message: '',
    },
  });

  async function handleClick() {
    if (!user) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/about/donate`)}`);
      return;
    }
    setShowCheckout(true);
  }

  async function handleCheckout(paymentMethod: 'stripe' | 'bank_transfer') {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: donationAmount,
          message: '',
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Donation failed';
        setError(errorMsg);
        return { error: errorMsg };
      }
      if (data.checkoutUrl) return { checkoutUrl: data.checkoutUrl };
      if (data.reference) {
        setHasReference(true);
        return { reference: data.reference };
      }
      setSuccess(true);
      setShowCheckout(false);
      return {};
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Heart className="h-8 w-8 fill-red-500 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-6">Your donation has been received. We appreciate your support.</p>
          <Button onClick={() => {
            setSuccess(false);
            reset();
          }}>
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasReference) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Bank Transfer Initiated</h3>
          <p className="text-muted-foreground mb-6">Please complete the bank transfer using the reference number provided in your email.</p>
          <Button onClick={() => {
            setHasReference(false);
            reset();
          }}>
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-600" />
          Make a Donation
        </CardTitle>
        <CardDescription>Support our mission with a one-time donation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleClick)} className="space-y-6">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (CHF)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 1, message: 'Minimum amount is 1 CHF' },
                valueAsNumber: true,
                onChange: (e) => setDonationAmount(parseFloat(e.target.value) || 0),
              })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message with your donation..."
              rows={4}
              {...register('message')}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={loading || !donationAmount || donationAmount < 1}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 fill-red-500 text-red-600" />}
              Donate
            </Button>
          </div>

          {showCheckout && (
            <CheckoutDialog
              open={showCheckout}
              onOpenChange={(open) => {
                setShowCheckout(open);
                if (!open && hasReference) setSuccess(true);
              }}
              title="Donation"
              price={donationAmount}
              currency="CHF"
              onCheckout={handleCheckout}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
