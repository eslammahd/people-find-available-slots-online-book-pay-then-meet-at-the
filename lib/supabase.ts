import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'user_32b62920' },
});

export type AvailabilitySlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type Booking = {
  id: string;
  slot_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripe_session_id?: string;
  amount_paid?: number;
  meet_link?: string;
};

export type Settings = {
  id: string;
  session_price_cents: number;
  currency: string;
  admin_email: string;
  max_duration_minutes: number;
  min_duration_minutes: number;
  booking_advance_days: number;
};
