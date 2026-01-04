-- Test schema initialization for Testcontainers PostgreSQL
CREATE SCHEMA IF NOT EXISTS school;
SET search_path TO school, public;

-- Create ENUM types (matching production schema)
CREATE TYPE guardian_relationship AS ENUM ('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER');
CREATE TYPE theme_mode AS ENUM ('LIGHT', 'DARK');
CREATE TYPE homework_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

