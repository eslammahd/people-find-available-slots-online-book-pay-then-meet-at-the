import { createAdminClient } from '@/lib/supabase/admin';
import { format } from 'date-fns';
import { CheckCircle, Video, Mail, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
const SCHEMA = process.env.SUPABASE_SCHEMA || 'public';
type BookingRow = { id: string; guest_email: string; duration_minutes: number; google_meet_link?: string | null; availability_slots?: { start_time: string } | null };
export default async function SuccessPage({ searchParams }: { searchParams: { booking_id?: string } }) {
  const { booking_id } = searchParams;
  if (!booking_id) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-slate-500">Invalid booking reference.</p>
      <Link href="/book" className="btn-primary mt-4 inline-block">Book a Session</Link>
    </div>
  );
  const supabase = createAdminClient();
  const { data: booking } = await supabase.schema(SCHEMA).from('bookings').select('*, availability_slots(*)').eq('id', booking_id).single();
  if (!booking) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-slate-500">Booking not found.</p>
      <Link href="/book" className="btn-primary mt-4 inline-block">Book a Session</Link>
    </div>
  );
  const b = booking as unknown as BookingRow;
  const slot = b.availability_slots;
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="card text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">You're Booked!</h1>
        <p className="text-slate-500 text-sm">Your session with Dr. Saad El Mahdy is confirmed.</p>
      </div>
      <div className="card mb-6 space-y-4">
        <h2 className="font-semibold text-slate-700">Session Details</h2>
        {slot && (
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">{format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-xs text-slate-400">{format(new Date(slot.start_time), 'h:mm a')}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <p className="text-sm text-slate-700">{b.duration_minutes} minutes</p>
        </div>
        {b.google_meet_link ? (
          <div className="flex items-start gap-3">
            <Video className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Google Meet Link</p>
              <a href={b.google_meet_link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline break-all">{b.google_meet_link}</a>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Video className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Google Meet Link</p>
              <p className="text-xs text-slate-400">Being generated &#8212; you'll receive it by email shortly.</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <p className="text-sm text-slate-700">Confirmation sent to <strong>{b.guest_email}</strong></p>
        </div>
      </div>
      <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-700 text-center mb-6">
        <strong>What's next?</strong> Check your email for session details and your Google Meet link.
      </div>
      <div className="text-center">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 hover:underline">&larr; Back to home</Link>
      </div>
    </div>
  );
}
