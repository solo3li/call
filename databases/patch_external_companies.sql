DO $$ 
DECLARE
    schema_name TEXT;
BEGIN
    FOR schema_name IN SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%' OR nspname = 'template_tenant' LOOP
        
        -- Create ExternalCompanies table
        EXECUTE 'CREATE TABLE IF NOT EXISTS "' || schema_name || '"."ExternalCompanies" (
            "Id" uuid NOT NULL,
            "Name" text NOT NULL,
            "LogoUrl" text,
            "IsActive" boolean NOT NULL,
            "CreatedAt" timestamp with time zone NOT NULL,
            "TenantId" uuid NOT NULL,
            CONSTRAINT "PK_ExternalCompanies" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_ExternalCompanies_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public."Tenants" ("Id") ON DELETE CASCADE
        );';

        -- Add columns to Orders
        EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD COLUMN IF NOT EXISTS "CustomerPhone" text;';
        EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD COLUMN IF NOT EXISTS "ExternalCompanyId" uuid;';
        EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD COLUMN IF NOT EXISTS "ExternalOrderId" text;';

        BEGIN
            EXECUTE 'ALTER TABLE "' || schema_name || '"."Orders" ADD CONSTRAINT "FK_Orders_ExternalCompanies_ExternalCompanyId" FOREIGN KEY ("ExternalCompanyId") REFERENCES "' || schema_name || '"."ExternalCompanies" ("Id") ON DELETE SET NULL;';
        EXCEPTION WHEN duplicate_object THEN
            -- do nothing
        END;

    END LOOP;
END $$;
