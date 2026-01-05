-- connect to postgres DB
\c postgres

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_database WHERE datname = 'bunvel'
  ) THEN
    CREATE DATABASE bunvel
      WITH
      OWNER = postgres
      ENCODING = 'UTF8'
      TEMPLATE = template0;
  END IF;
END $$;