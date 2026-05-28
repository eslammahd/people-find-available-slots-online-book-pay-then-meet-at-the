'use client';
import { useEffect, useState } from 'react';
import { supabase, AvailabilitySlot, Settings } from '@/lib/supabase';
import { DURATION_OPTIONS, formatPrice } from '@/lib/stripe';
import { getAvailableDates, formatDate, formatDateShort, formatTime, DAY_SHORT } from '@/lib/dates';
import { getDay, format } from 'date-fns';
import { Calendar, Clock, User, Mail, Phone, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Step = 'slot' | 'duration' | 'details' | 'payment';

export default function BookPage() {
  const [step, setStep] = useState<Step>('slot');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bookedSlots, setBookedSlots] = useState<{ booking_date: string; start_time: string }[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [calPage, setCalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      const [{ data: slotsData }, { data: settingsData }, { data: bookingsData }] = await Promise.all([
        supabase.from('availability_slots').select('*').eq('is_active', true),
        supabase.from('settings').select('*').single(),
        supabase.from('bookings').select('booking_date, start_time').in('status', ['confirmed', 'pending']),
      ]);
      if (slotsData) setSlots(slotsData);
      if (settingsData) setSettings(settingsData);
      if (bookingsData) setBookedSlots(bookingsData);

      const slotDays = [...new Set((slotsData || []).map((s: AvailabilitySlot) => s.day_of_week))];
      const days = getAvailableDates(settingsData?.booking_advance_days || 30, slotDays);
      setAvailableDates(days);
      setLoading(false);
    }
    load();
  }, []);

  const datesPerPage = 7;
  const visibleDates = availableDates.slice(calPage * datesPerPage, (calPage + 1) * datesPerPage);

  const getSlotsForDate = (date: Date) => {
    const dayOfWeek = getDay(date);
    return slots.filter(s => s.day_of_week === dayOfWeek && s.is_active);
  };

  const isSlotBooked = (date: Date, slot: AvailabilitySlot) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedSlots.some(b => b.booking_date === dateStr && b.start_time === slot.start_time);
  };

  async function handleCheckout() {
    if (!selectedDate || !selectedSlot || !settings) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedSlot.start_time,
          endTime: selectedSlot.end_time,
          durationMinutes: selectedDuration,
          patientName: form.name,
          patientEmail: form.email,
          patientPhone: form.phone,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const price = settings ? formatPrice(settings.session_price_cents, settings.currency) : '...';

  const steps = [
    { id: 'slot', label: 'Pick a slot' },
    { id: 'duration', label: 'Duration' },
    { id: 'details', label: 'Your details' },
    { id: 'payment', label: 'Payment' },
  ];
  const stepIndex = steps.findIndex(s => s.id === step);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-sage-600 hover:text-sage-700">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-800">Book a Session</h1>
            <p className="text-sm text-gray-500">Dr. Saad El Mahdy</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                i < stepIndex ? 'bg-sage-600 text-white' :
                i === stepIndex ? 'bg-sage-600 text-white ring-4 ring-sage-100' :
                'bg-gray-100 text-gray-400'
              }`}>{i < stepIndex ? '✓' : i + 1}</div>
              <span className={`text-xs hidden sm:block ${ i === stepIndex ? 'text-sage-600 font-medium' : 'text-gray-400' }`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${ i < stepIndex ? 'bg-sage-600' : 'bg-gray-100' }`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Slot picker */}
        {step === 'slot' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-sage-600" /> Choose a date &amp; time</h2>

            {/* Week nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalPage(p => Math.max(0, p - 1))} disabled={calPage === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">Showing {calPage * datesPerPage + 1}–{Math.min((calPage + 1) * datesPerPage, availableDates.length)} of {availableDates.length} available days</span>
              <button onClick={() => setCalPage(p => p + 1)} disabled={(calPage + 1) * datesPerPage >= availableDates.length} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {visibleDates.map(date => {
                const dateSlots = getSlotsForDate(date);
                const available = dateSlots.some(s => !isSlotBooked(date, s));
                const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    disabled={!available}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-sage-600 bg-sage-50' :
                      available ? 'border-gray-100 hover:border-sage-300 hover:bg-sage-50' :
                      'border-gray-100 opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs text-gray-400">{DAY_SHORT[getDay(date)]}</span>
                    <span className="text-lg font-bold text-gray-800">{format(date, 'd')}</span>
                    <span className="text-xs text-gray-400">{format(date, 'MMM')}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Available times on {formatDate(selectedDate)}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getSlotsForDate(selectedDate).map(slot => {
                    const booked = isSlotBooked(selectedDate, slot);
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={booked}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected ? 'border-sage-600 bg-sage-600 text-white' :
                          booked ? 'border-gray-100 text-gray-300 cursor-not-allowed' :
                          'border-gray-200 hover:border-sage-400 text-gray-700'
                        }`}
                      >
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        {booked && <span className="ml-2 text-xs">(booked)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep('duration')}
                disabled={!selectedDate || !selectedSlot}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Duration */}
        {step === 'duration' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-sage-600" /> Session duration</h2>
            {selectedDate && selectedSlot && (
              <p className="text-gray-500 text-sm mb-6">{formatDate(selectedDate)} · {formatTime(selectedSlot.start_time)}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.minutes}
                  onClick={() => setSelectedDuration(opt.minutes)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedDuration === opt.minutes
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <span className="font-medium text-gray-800">{opt.label}</span>
                  {settings && <span className="text-sage-600 font-semibold">{formatPrice(settings.session_price_cents, settings.currency)}</span>}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">All sessions are fixed-price regardless of duration.</p>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep('slot')} className="btn-secondary">Back</button>
              <button onClick={() => setStep('details')} className="btn-primary">Continue</button>
            </div>
          </div>
        )}

        {/* Step 3 — Patient details */}
        {step === 'details' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-sage-600" /> Your details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
                <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">Your Google Meet link will be sent here.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number (optional)</label>
                <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for session (optional)</label>
                <textarea className="input resize-none" rows={3} placeholder="Brief description of what you'd like to discuss..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep('duration')} className="btn-secondary">Back</button>
              <button
                onClick={() => setStep('payment')}
                disabled={!form.name.trim() || !form.email.trim()}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Review & pay */}
        {step === 'payment' && settings && selectedDate && selectedSlot && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Review &amp; Pay</h2>
            <div className="bg-sage-50 rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{formatTime(selectedSlot.start_time)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{DURATION_OPTIONS.find(d => d.minutes === selectedDuration)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Patient</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{form.email}</span>
              </div>
              <div className="border-t border-sage-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-sage-700 text-lg">{price}</span>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
            <p className="text-xs text-gray-400 mb-4">You will be redirected to Stripe to complete payment. After paying, you'll receive a confirmation email with your Google Meet link.</p>
            <div className="flex justify-between">
              <button onClick={() => setStep('details')} className="btn-secondary" disabled={submitting}>Back</button>
              <button onClick={handleCheckout} disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Pay {price}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
