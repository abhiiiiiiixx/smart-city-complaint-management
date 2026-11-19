-- ==============================================================================
-- SMART CITY: CITIZEN COMPLAINT MANAGEMENT SYSTEM (V2 - IDEMPOTENT)
-- Safe to re-run multiple times without duplicate policy errors.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerations & Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Rejected',
        'Reopened'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Sequence for Human-Readable Complaint IDs (SC-2026-0001)
CREATE SEQUENCE IF NOT EXISTS complaint_number_seq START 1;

-- ==============================================================================
-- 4. Tables Creation
-- ==============================================================================

-- Table: PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    city TEXT NOT NULL DEFAULT 'Indore',
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    head_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: OFFICERS
CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    designation TEXT NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: COMPLAINT_CATEGORIES
CREATE TABLE IF NOT EXISTS complaint_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    default_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    default_priority complaint_priority NOT NULL DEFAULT 'Medium',
    sla_hours INTEGER NOT NULL DEFAULT 48,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table: COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number VARCHAR(20) NOT NULL UNIQUE,
    citizen_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES complaint_categories(id) ON DELETE RESTRICT,
    assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority complaint_priority NOT NULL DEFAULT 'Medium',
    status complaint_status NOT NULL DEFAULT 'Submitted',
    address TEXT NOT NULL,
    ward_or_area TEXT NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    image_urls TEXT[] DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: COMPLAINT_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: COMPLAINT_UPDATES (Audit trail)
CREATE TABLE IF NOT EXISTS complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by_name TEXT,
    from_status complaint_status NOT NULL,
    to_status complaint_status NOT NULL,
    remarks TEXT NOT NULL,
    proof_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    complaint_number VARCHAR(20),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'status_change',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. Indexes for Performance & Scalability
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_officer ON complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ==============================================================================
-- 6. Trigger: Auto-generate Complaint ID (SC-2026-0001)
-- ==============================================================================
CREATE OR REPLACE FUNCTION generate_complaint_id()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    cur_year INT;
BEGIN
    IF NEW.complaint_number IS NULL OR NEW.complaint_number = '' THEN
        seq_val := nextval('complaint_number_seq');
        cur_year := EXTRACT(YEAR FROM CURRENT_DATE);
        NEW.complaint_number := 'SC-' || cur_year || '-' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_complaint_id ON complaints;
CREATE TRIGGER trg_set_complaint_id
BEFORE INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION generate_complaint_id();

-- ==============================================================================
-- 7. Trigger: Auto-create Profile on Supabase Auth SignUp
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role, city, address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', '9826000000'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Indore'),
        COALESCE(NEW.raw_user_meta_data->>'address', 'Indore Resident')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. Row Level Security (RLS) - Idempotent
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is officer
CREATE OR REPLACE FUNCTION is_officer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'officer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Profiles
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS: Departments (Public read, Admin manage)
DROP POLICY IF EXISTS "Public read departments" ON departments;
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage departments" ON departments;
CREATE POLICY "Admin manage departments" ON departments FOR ALL USING (is_admin());

-- RLS: Categories (Public read, Admin manage)
DROP POLICY IF EXISTS "Public read categories" ON complaint_categories;
CREATE POLICY "Public read categories" ON complaint_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON complaint_categories;
CREATE POLICY "Admin manage categories" ON complaint_categories FOR ALL USING (is_admin());

-- RLS: Officers (Public read, Admin manage)
DROP POLICY IF EXISTS "Public read officers" ON officers;
CREATE POLICY "Public read officers" ON officers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage officers" ON officers;
CREATE POLICY "Admin manage officers" ON officers FOR ALL USING (is_admin());

-- RLS: Complaints
DROP POLICY IF EXISTS "Complaints are viewable by all users" ON complaints;
CREATE POLICY "Complaints are viewable by all users" ON complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Citizens can insert complaints" ON complaints;
CREATE POLICY "Citizens can insert complaints" ON complaints FOR INSERT WITH CHECK (
    auth.uid() = citizen_id OR is_admin()
);

DROP POLICY IF EXISTS "Officers and Admin can update complaints" ON complaints;
CREATE POLICY "Officers and Admin can update complaints" ON complaints FOR UPDATE USING (
    is_admin() OR is_officer() OR auth.uid() = citizen_id
);

-- RLS: Complaint Updates
DROP POLICY IF EXISTS "Updates viewable by all" ON complaint_updates;
CREATE POLICY "Updates viewable by all" ON complaint_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Officers, Admins, Citizens insert updates" ON complaint_updates;
CREATE POLICY "Officers, Admins, Citizens insert updates" ON complaint_updates FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

-- RLS: Feedback
DROP POLICY IF EXISTS "Feedback viewable by all" ON feedback;
CREATE POLICY "Feedback viewable by all" ON feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Citizens insert own feedback" ON feedback;
CREATE POLICY "Citizens insert own feedback" ON feedback FOR INSERT WITH CHECK (
    auth.uid() = citizen_id
);

-- RLS: Notifications
DROP POLICY IF EXISTS "Users can only read own notifications" ON notifications;
CREATE POLICY "Users can only read own notifications" ON notifications FOR SELECT USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
    auth.uid() = user_id
);
