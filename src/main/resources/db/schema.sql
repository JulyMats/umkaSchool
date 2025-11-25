-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2025-10-11 22:04:01.004

-- Schema: school
CREATE SCHEMA school;
-- Set the search path to use it by default
SET search_path TO school;

-- Enums
CREATE TYPE guardian_relationship AS ENUM ('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER');
CREATE TYPE theme_mode AS ENUM ('LIGHT', 'DARK');
CREATE TYPE homework_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- tables
-- Table: app_user
CREATE TABLE app_user (
    app_user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role varchar(16) NOT NULL CHECK (user_role IN ('STUDENT', 'TEACHER', 'ADMIN')),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    password_hash varchar(255) NOT NULL,
    salt varchar(255),
    app_language varchar(10) NOT NULL DEFAULT 'EN',
    avatar_url varchar(512) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    last_login_at timestamptz NULL,
    app_theme theme_mode NOT NULL DEFAULT 'LIGHT'
);

-- Table: teacher
CREATE TABLE teacher (
    teacher_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id uuid NOT NULL REFERENCES app_user(app_user_id) ON DELETE CASCADE,
    bio text,
    phone varchar(50)
);

-- Table: guardian
CREATE TABLE guardian (
    guardian_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(50) NOT NULL,
    relationship guardian_relationship NOT NULL DEFAULT 'FATHER'
);

-- Table: student_group
CREATE TABLE student_group (
    student_group_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    code char(5) UNIQUE NOT NULL,
    teacher_id uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: student
CREATE TABLE student (
    student_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id uuid NOT NULL REFERENCES app_user(app_user_id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    guardian_id uuid NOT NULL REFERENCES guardian(guardian_id),
    student_group_id uuid REFERENCES student_group(student_group_id) ON DELETE SET NULL,
    date_of_birth date NOT NULL,
    enrollment_date timestamptz NOT NULL DEFAULT now(),
    last_activity_at timestamptz
);

-- Table: exercise_type
CREATE TABLE exercise_type (
    exercise_type_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    base_difficulty int NOT NULL CHECK (base_difficulty BETWEEN 1 AND 10),
    avg_time_seconds int NOT NULL,
    parameter_ranges jsonb,
    created_by uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: exercise
CREATE TABLE exercise (
    exercise_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_type_id uuid NOT NULL REFERENCES exercise_type(exercise_type_id) ON DELETE CASCADE,
    parameters jsonb NOT NULL,
    difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
    points int NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_by uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: daily_challenge
CREATE TABLE daily_challenge (
    daily_challenge_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date date UNIQUE NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    created_by uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: daily_challenge_exercise
CREATE TABLE daily_challenge_exercise (
    daily_challenge_id uuid NOT NULL REFERENCES daily_challenge(daily_challenge_id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES exercise(exercise_id) ON DELETE CASCADE,
    order_index int DEFAULT 0,
    PRIMARY KEY (daily_challenge_id, exercise_id)
);

-- Table: homework
CREATE TABLE homework (
    homework_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    teacher_id uuid NOT NULL REFERENCES teacher(teacher_id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: homework_exercise
CREATE TABLE homework_exercise (
    homework_id uuid NOT NULL REFERENCES homework(homework_id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES exercise(exercise_id) ON DELETE CASCADE,
    order_index int DEFAULT 0,
    required_attempts int DEFAULT 1,
    PRIMARY KEY (homework_id, exercise_id)
);

-- Table: homework_assignment
CREATE TABLE homework_assignment (
    homework_assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id uuid NOT NULL REFERENCES homework(homework_id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES teacher(teacher_id) ON DELETE SET NULL,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    due_date timestamptz NOT NULL,
    homework_assignment_status homework_status NOT NULL DEFAULT 'PENDING'
);

-- Table: homework_assignment_student_group
CREATE TABLE homework_assignment_student_group (
    homework_assignment_id uuid NOT NULL REFERENCES homework_assignment(homework_assignment_id) ON DELETE CASCADE,
    student_group_id uuid NOT NULL REFERENCES student_group(student_group_id) ON DELETE CASCADE,
    PRIMARY KEY (homework_assignment_id, student_group_id)
);

-- Table: homework_assignment_student
CREATE TABLE homework_assignment_student (
    homework_assignment_id uuid NOT NULL REFERENCES homework_assignment(homework_assignment_id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    PRIMARY KEY (homework_assignment_id, student_id)
);

-- Table: exercise_attempt
CREATE TABLE exercise_attempt (
    attempt_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES exercise(exercise_id),
    started_at timestamptz,
    completed_at timestamptz,
    score int NOT NULL,
    settings jsonb NOT NULL DEFAULT '{}',
    total_attempts bigint NOT NULL DEFAULT 0,
    total_correct bigint NOT NULL DEFAULT 0
);

-- Table: achievement
CREATE TABLE achievement (
    achievement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    icon_url varchar(512) NOT NULL,
    required_criteria jsonb NOT NULL,
    points int NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: student_achievement
CREATE TABLE student_achievement (
    student_id uuid NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    achievement_id uuid NOT NULL REFERENCES achievement(achievement_id),
    earned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, achievement_id)
);

-- Table: progress_snapshot
CREATE TABLE progress_snapshot (
       progress_snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       student_id uuid NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
       snapshot_date date NOT NULL,
       total_practice_seconds bigint NOT NULL DEFAULT 0,
       current_streak int NOT NULL DEFAULT 0,
       total_attempts bigint NOT NULL DEFAULT 0,
       total_correct bigint NOT NULL DEFAULT 0,
       created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: user_token
CREATE TABLE user_token (
    token_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id uuid NOT NULL REFERENCES app_user(app_user_id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    token_type varchar(20) NOT NULL CHECK (token_type IN ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'REFRESH_TOKEN')),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    is_used boolean DEFAULT false
);

-- End of file.