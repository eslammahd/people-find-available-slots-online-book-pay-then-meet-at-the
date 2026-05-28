'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { X, Clock, CreditCard, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { AvailabilitySlot } from '@/lib/types';
import { DURATION_OPTIONS, calculatePrice, formatPrice } from '@/lib/stripe';
const PRICE_PER_HOUR_CENTS = 15000;
export default function BookingModal({ slot, onClose }: { slot: AvailabilitySlot; onClose: () => void }) {
  const [step, setStep] = useState<'details' | 'processing'>('details');
  const [duration, setDuration] = useState(60);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const price = calculatePrice(duration, PRICE_PER_HOUR_CENTS);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
    setLoading(true); setStep('processing');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, guestName: name, guestEmail: email, guestPhone: phone || null, durationMinutes: duration, notes: notes || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStep('details'); setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Book Session</h2>
            <p className="text-sm text-slate-500">{format(new Date(slot.start_time), 'EEEE, MMMM d \u00b7 h:mm a')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        {step === 'processing' ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Redirecting to checkout...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="label"><Clock className="w-3.5 h-3.5 inline mr-1 text-brand-500" />Session Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.minutes} type="button" onClick={() => setDuration(opt.minutes)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                      duration === opt.minutes ? 'bg-brand-600 text-white border-brand-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="bg-brand-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Session fee</span>
              <span className="font-bold text-brand-700 text-lg">{formatPrice(price)}</span>
            </div>
            <div>
              <label className="label"><User className="w-3.5 h-3.5 inline mr-1 text-brand-500" />Your Name *</label>
              <input type="text" className="input-field" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label"><Mail className="w-3.5 h-3.5 inline mr-1 text-brand-500" />Email Address *</label>
              <input type="email" className="input-field" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <p className="text-xs text-slate-400 mt-1">Your Google Meet link will be sent here.</p>
            </div>
            <div>
              <label className="label"><Phone className="w-3.5 h-3.5 inline mr-1 text-brand-500" />Phone (optional)</label>
              <input type="tel" className="input-field" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label"><MessageSquare className="w-3.5 h-3.5 inline mr-1 text-brand-500" />Notes (optional)</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Anything you'd like Dr. Saad to know..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />Pay {formatPrice(price)} &amp; Confirm
            </button>
            <p className="text-xs text-center text-slate-400">Secure payment via Stripe &middot; No account needed</p>
          </form>
        )}
      </div>
    </div>
  );
}
