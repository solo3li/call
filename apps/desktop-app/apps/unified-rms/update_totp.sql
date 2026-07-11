UPDATE "UserTenants" SET "TotpSecretKey" = 'ADMINSECRETKEY222222222222222222' WHERE "Email" LIKE 'admin@%' OR "Email" LIKE 'owner@%';
UPDATE "UserTenants" SET "TotpSecretKey" = 'MANAGERSECRETKEY2222222222222222' WHERE "Email" LIKE 'staff4@%';

-- we need to update the actual tenant schemas too. Let's find the tenant schemas:
DO $$ 
DECLARE 
    schema_name text;
BEGIN
    FOR schema_name IN SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%' LOOP
        EXECUTE format('UPDATE %I."AspNetUsers" SET "TotpSecretKey" = ''ADMINSECRETKEY222222222222222222'' WHERE "Role" = ''Owner'';', schema_name);
        EXECUTE format('UPDATE %I."AspNetUsers" SET "TotpSecretKey" = ''MANAGERSECRETKEY2222222222222222'' WHERE "Role" = ''Manager'';', schema_name);
    END LOOP;
END $$;
