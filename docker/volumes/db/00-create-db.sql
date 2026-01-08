-- Connect to postgres DB
\c postgres

DO $$
DECLARE
  db_name text;
  db_user text;
  db_password text;
  user_exists boolean;
BEGIN
  -- Get database configuration from environment variables with defaults
  BEGIN
    db_name := current_setting('POSTGRES_DB');
  EXCEPTION WHEN undefined_object THEN
    db_name := 'bunvel';
  END;

  BEGIN
    db_user := current_setting('POSTGRES_USER');
  EXCEPTION WHEN undefined_object THEN
    db_user := 'postgres';
  END;

  BEGIN
    db_password := current_setting('POSTGRES_PASSWORD');
  EXCEPTION WHEN undefined_object THEN
    db_password := 'postgres';
  END;

  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = db_user) INTO user_exists;

  -- Create or update user with password
  IF user_exists THEN
    EXECUTE format('ALTER USER %I WITH PASSWORD %L', db_user, db_password);
    RAISE NOTICE 'Updated password for user %', db_user;
  ELSE
    EXECUTE format('CREATE USER %I WITH PASSWORD %L', db_user, db_password);
    RAISE NOTICE 'Created user %', db_user;
  END IF;

  -- Create database if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_database WHERE datname = db_name
  ) THEN
    EXECUTE format(
      'CREATE DATABASE %I
       WITH
       OWNER = %I
       ENCODING = ''UTF8''
       TEMPLATE = template0',
      db_name,
      db_user
    );
    
    RAISE NOTICE 'Created database % with owner %', db_name, db_user;
  ELSE
    RAISE NOTICE 'Database % already exists', db_name;
  END IF;

  -- Grant all privileges on the database to the user
  EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', db_name, db_user);
  RAISE NOTICE 'Granted all privileges on % to %', db_name, db_user;

  -- Set default privileges for future objects
  EXECUTE format('ALTER DATABASE %I SET timezone TO ''UTC''', db_name);
  RAISE NOTICE 'Set timezone to UTC for database %', db_name;
END $$;