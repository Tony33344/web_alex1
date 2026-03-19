'use client';

import { useState } from 'react';
import { CreditCard, Building2, Loader2, QrCode, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { BankTransferQR } from './BankTransferQR';

type PaymentMethod = 'stripe' | 'bank_transfer';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  price: number;
  currency: string;
  onCheckout: (method: PaymentMethod) => Promise<{ checkoutUrl?: string; reference?: string; error?: string }>;
  isFree?: boolean;
}

export function CheckoutDialog({ open, onOpenChange, title, price, currency, onCheckout, isFree }: CheckoutDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankReference, setBankReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const result = await onCheckout(method);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.reference) {
        setBankReference(result.reference);
        setLoading(false);
        return;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  function copyRef() {
    if (bankReference) {
      navigator.clipboard.writeText(bankReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const priceLabel = `${currency} ${price.toFixed(2)}`;

  if (bankReference) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Registration Confirmed
            </DialogTitle>
            <DialogDescription>
              Your spot is reserved! Complete the bank transfer within 48 hours to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
              <p className="font-medium">✓ Successfully registered</p>
              <p className="text-xs opacity-90">Reference: {bankReference}</p>
            </div>
            <BankTransferQR amount={price} currency={currency} reference={bankReference} />
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{priceLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <button onClick={copyRef} className="flex items-center gap-1 font-mono text-xs font-medium hover:text-primary transition-colors">
                  {bankReference}
                  {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Use the reference code in your transfer description so we can match your payment.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete your booking</DialogTitle>
          <DialogDescription>{title} — {priceLabel}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm font-medium">Choose payment method</p>
          <div className="grid gap-2">
            <button
              onClick={() => setMethod('stripe')}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                method === 'stripe' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
              }`}
            >
              <CreditCard className={`h-5 w-5 ${method === 'stripe' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium">Card Payment</p>
                <p className="text-xs text-muted-foreground">Pay securely with Stripe</p>
              </div>
            </button>
            <button
              onClick={() => setMethod('bank_transfer')}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                method === 'bank_transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
              }`}
            >
              <Building2 className={`h-5 w-5 ${method === 'bank_transfer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">SEPA transfer with QR code</p>
              </div>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <DialogFooter>
          <Button onClick={handlePay} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : method === 'stripe' ? <CreditCard className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
            {method === 'stripe' ? `Pay ${priceLabel}` : 'Get Transfer Details'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
