-- Ensure receptionist/admin replies are valid in chat_messages.role.

DO $$
DECLARE
  enum_schema TEXT;
BEGIN
  SELECT n.nspname
  INTO enum_schema
  FROM pg_type t
  JOIN pg_namespace n
    ON n.oid = t.typnamespace
  WHERE t.typname = 'enum_chat_messages_role'
  LIMIT 1;

  IF enum_schema IS NULL THEN
    RAISE EXCEPTION
      'Could not find enum_chat_messages_role';
  END IF;

  EXECUTE format(
    'ALTER TYPE %I.enum_chat_messages_role ADD VALUE IF NOT EXISTS %L',
    enum_schema,
    'admin'
  );
END
$$;

SELECT
  n.nspname AS schema_name,
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e
  ON t.oid = e.enumtypid
JOIN pg_namespace n
  ON n.oid = t.typnamespace
WHERE t.typname = 'enum_chat_messages_role'
ORDER BY e.enumsortorder;
