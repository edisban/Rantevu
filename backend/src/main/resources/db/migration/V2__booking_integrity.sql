-- Providers registered before profiles were created automatically get an empty one, so they show up in search
INSERT INTO provider_profiles (user_id)
SELECT u.id FROM users u
WHERE u.role = 'ROLE_PROVIDER'
  AND NOT EXISTS (SELECT 1 FROM provider_profiles p WHERE p.user_id = u.id);

-- A provider can hold only one active (pending or accepted) appointment per time slot.
-- Older duplicates, if any, keep the earliest request and cancel the rest so the index can be built.
UPDATE appointments a SET status = 'CANCELLED'
WHERE a.status IN ('PENDING', 'ACCEPTED')
  AND EXISTS (
    SELECT 1 FROM appointments b
    WHERE b.provider_id = a.provider_id
      AND b.appointment_date = a.appointment_date
      AND b.status IN ('PENDING', 'ACCEPTED')
      AND b.id < a.id);

CREATE UNIQUE INDEX ux_appointments_active_slot
    ON appointments (provider_id, appointment_date)
    WHERE status IN ('PENDING', 'ACCEPTED');

CREATE INDEX ix_appointments_client ON appointments (client_id);

-- Leftover table from the removed /api/bookings feature; dropped only when it holds no data
DO $$
DECLARE has_rows BOOLEAN;
BEGIN
    IF to_regclass('public.bookings') IS NOT NULL THEN
        -- Dynamic SQL so the table name is only resolved when the table exists
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM bookings)' INTO has_rows;
        IF NOT has_rows THEN
            DROP TABLE bookings;
        END IF;
    END IF;
END $$;
