-- Sign-in is case-insensitive: the app now stores usernames and emails lower-case.
-- Bring existing accounts in line so "Edis" can still sign in after the change.
UPDATE users SET username = lower(trim(username)) WHERE username <> lower(trim(username));
UPDATE users SET email = lower(trim(email)) WHERE email <> lower(trim(email));
