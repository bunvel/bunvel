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


-- 1. SCHEMAS
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email             TEXT UNIQUE,
  phone             TEXT UNIQUE,

  email_confirmed   BOOLEAN NOT NULL DEFAULT false,
  phone_confirmed   BOOLEAN NOT NULL DEFAULT false,

  password_hash     TEXT,                       -- store hashed password
  provider          TEXT NOT NULL DEFAULT 'email',
  providers         JSONB NOT NULL DEFAULT '{}'::jsonb,

  user_metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  app_metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,

  last_sign_in_at   TIMESTAMPTZ,
  banned_until      TIMESTAMPTZ,

  is_anonymous      BOOLEAN NOT NULL DEFAULT false,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_auth_users_email ON auth.users (email);
CREATE INDEX idx_auth_users_phone ON auth.users (phone);
CREATE INDEX idx_auth_users_created_at ON auth.users (created_at);
CREATE INDEX idx_auth_users_user_metadata ON auth.users USING GIN (user_metadata);
CREATE INDEX idx_auth_users_app_metadata ON auth.users USING GIN (app_metadata);

CREATE OR REPLACE FUNCTION auth.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auth_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();
