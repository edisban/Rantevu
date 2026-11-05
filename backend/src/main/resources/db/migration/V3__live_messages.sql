-- Conversations are between two users, not tied to a single appointment
ALTER TABLE messages DROP COLUMN IF EXISTS appointment_id;

ALTER TABLE messages ADD COLUMN read_at TIMESTAMP(6) WITH TIME ZONE;
UPDATE messages SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE messages ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX ix_messages_pair ON messages (sender_id, receiver_id, created_at);
CREATE INDEX ix_messages_unread ON messages (receiver_id) WHERE read_at IS NULL;
