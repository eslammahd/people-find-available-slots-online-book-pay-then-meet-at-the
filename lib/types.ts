export interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price_cents: number;
  is_booked: boolean;
  created_at: string;
}
export interface Booking {
  id: string;
  slot_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  duration_minutes: number;
  price_cents: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  google_meet_link?: string;
  calendar_event_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  availability_slots?: AvailabilitySlot;
}
