'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface WaitlistDialogProps {
  eventId: string;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export function WaitlistDialog({ eventId, eventTitle, open, onOpenChange, defaultEmail = '', defaultName = '' }: WaitlistDialogProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState<{ position: number; participantType: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/events/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, name, email, phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Failed to join waitlist');
      return;
    }
    setJoined({ position: data.position, participantType: data.participantType });
  }

  function handleClose(open: boolean) {
    if (!open) {
      setJoined(null);
      setError('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Join Waiting List
          </DialogTitle>
          <DialogDescription>{eventTitle}</DialogDescription>
        </DialogHeader>

        {joined ? (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-primary" />
            <div>
              <p className="text-lg font-semibold">You&apos;re on the list!</p>
              <p className="text-muted-foreground text-sm mt-1">
                Position <strong>#{joined.position}</strong> on the waiting list.
              </p>
              {joined.participantType === 'guest' && (
                <p className="text-xs text-muted-foreground mt-3 border rounded-lg p-3 bg-muted/50">
                  💡 <strong>Tip:</strong> Members get priority notification when a spot opens up.{' '}
                  <a href="/en/membership" className="text-primary underline hover:no-underline">Explore membership</a>
                </p>
              )}
              {joined.participantType === 'registered_user' && (
                <p className="text-xs text-muted-foreground mt-3 border rounded-lg p-3 bg-muted/50">
                  💡 <strong>Tip:</strong> Upgrade to membership for priority access to events and exclusive discounts.{' '}
                  <a href="/en/membership" className="text-primary underline hover:no-underline">View membership plans</a>
                </p>
              )}
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wl-name">Full Name *</Label>
              <Input
                id="wl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-email">Email *</Label>
              <Input
                id="wl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-phone">Phone (optional)</Label>
              <Input
                id="wl-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41 ..."
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Join Waiting List
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
