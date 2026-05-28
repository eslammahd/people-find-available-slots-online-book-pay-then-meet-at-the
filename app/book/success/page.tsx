'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Mail, Video } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [booking, setBooking] = useState<{ patient_name: string; patient_email: string; booking_date: string; start_time: string; meet_link?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    async function confirm() {
      const res = await fetch(`/api/confirm?session_id=${sessionId}`);
      const data = await res.json();
      if (data.booking) setBooking(data.booking);
      setLoading(false);
    }
    confirm();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sage-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
      <div className="card max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
        {booking ? (
          <>
            <p className="text-gray-600 mb-6">Thank you, <strong>{booking.patient_name}</strong>. Your session is booked.</p>
            <div className="bg-sage-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{booking.start_time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Format</span>
                <span className="font-medium flex items-center gap-1"><Video className="w-3 h-3" /> Google Meet</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 justify-center mb-6">
              <Mail className="w-4 h-4" />
              <span>A confirmation with your Meet link has been sent to <strong>{booking.patient_email}</strong></span>
            </div>
          </>
        ) : (
          <p className="text-gray-600 mb-6">Your payment was received. Check your email for the confirmation and Google Meet link.</p>
        )}
        <Link href="/" className="btn-primary inline-block">Back to Home</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sage-600" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
