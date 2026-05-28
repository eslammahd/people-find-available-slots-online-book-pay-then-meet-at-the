import { createAdminClient } from '@/lib/supabase/admin';
import BookingCalendar from '@/components/BookingCalendar';
import { AvailabilitySlot } from '@/lib/types';
export const dynamic = 'force-dynamic';
const SCHEMA = process.env.SUPABASE_SCHEMA || 'public';
export default async function BookPage() {
  const supabase = createAdminClient();
  const { data: slots } = await supabase
    .schema(SCHEMA)
    .from('availability_slots')
    .select('*')
    .eq('is_booked', false)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });
  const availableSlots: AvailabilitySlot[] = slots || [];
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Available Sessions</h1>
        <p className="text-slate-500">Select a time slot. All sessions are via Google Meet &mdash; you'll receive the link by email after payment.</p>
      </div>
      {availableSlots.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400 text-lg mb-2">No slots available right now.</p>
          <p className="text-slate-400 text-sm">Please check back soon or contact Dr. Saad directly.</p>
        </div>
      ) : (
        <BookingCalendar slots={availableSlots} />
      )}
    </div>
  );
}
