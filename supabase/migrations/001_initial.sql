-- Run this manually in Supabase SQL editor if auto-migration is unavailable
SET search_path TO "user_32b62920", public;

CREATE TABLE IF NOT EXISTS "user_32b62920".availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_32b62920".bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES "user_32b62920".availability_slots(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes BETWEEN 5 AND 120),
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INT,
  meet_link TEXT,
  confirmation_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_32b62920".settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_price_cents INT NOT NULL DEFAULT 10000,
  currency TEXT NOT NULL DEFAULT 'usd',
  admin_email TEXT NOT NULL DEFAULT 'dr.saad@example.com',
  max_duration_minutes INT NOT NULL DEFAULT 120,
  min_duration_minutes INT NOT NULL DEFAULT 30,
  booking_advance_days INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_32b62920".blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_slot_date ON "user_32b62920".bookings(slot_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON "user_32b62920".bookings(status);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day ON "user_32b62920".availability_slots(day_of_week);

INSERT INTO "user_32b62920".availability_slots (day_of_week, start_time, end_time, is_active) VALUES
(1, '09:00', '11:00', true),
(1, '14:00', '16:00', true),
(2, '10:00', '12:00', true),
(2, '15:00', '17:00', true),
(3, '09:00', '11:00', true),
(3, '13:00', '15:00', true),
(4, '10:00', '12:00', true),
(4, '14:00', '16:00', true),
(5, '09:00', '11:00', true),
(5, '13:00', '15:00', true)
ON CONFLICT DO NOTHING;

INSERT INTO "user_32b62920".settings (session_price_cents, currency, admin_email)
VALUES (10000, 'usd', 'dr.saad@example.com')
ON CONFLICT DO NOTHING;
