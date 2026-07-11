echo "DO \$\$ DECLARE schema_name text; BEGIN FOR schema_name IN SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%' LOOP" > update.sql
echo "EXECUTE format('UPDATE %I.\"AspNetUsers\" SET \"TotpSecretKey\" = ''MANAGERSECRETKEY2222222222222222'', \"Role\" = ''Manager'' WHERE \"NormalizedUserName\" LIKE ''STAFF4@%%'';', schema_name);" >> update.sql
echo "EXECUTE format('UPDATE %I.\"AspNetUsers\" SET \"TotpSecretKey\" = ''CHEFSECRETKEY2222222222222222222'', \"Role\" = ''Chef'' WHERE \"NormalizedUserName\" LIKE ''STAFF1@%%'';', schema_name);" >> update.sql
echo "EXECUTE format('UPDATE %I.\"AspNetUsers\" SET \"TotpSecretKey\" = ''CASHIERSECRETKEY2222222222222222'', \"Role\" = ''Cashier'' WHERE \"NormalizedUserName\" LIKE ''STAFF2@%%'';', schema_name);" >> update.sql
echo "EXECUTE format('UPDATE %I.\"AspNetUsers\" SET \"TotpSecretKey\" = ''AGENTSECRETKEY222222222222222222'', \"Role\" = ''Agent'' WHERE \"NormalizedUserName\" LIKE ''STAFF3@%%'';', schema_name);" >> update.sql
echo "END LOOP; END \$\$;" >> update.sql
