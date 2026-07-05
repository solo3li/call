DO $$ 
DECLARE
    schema_name TEXT;
BEGIN
    FOR schema_name IN SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%' OR nspname = 'template_tenant' LOOP
        EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD COLUMN IF NOT EXISTS "DriverName" text;';
        EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD COLUMN IF NOT EXISTS "DriverPhone" text;';
    END LOOP;
END $$;
