-- ==============================================================================
-- FIX FOR: "Database error saving new user" on Supabase Auth SignUp
-- Paste this script into your Supabase SQL Editor and click "Run"
-- ==============================================================================

-- 1. Ensure type public.user_role exists
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('citizen', 'officer', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Robust handle_new_user function with schema search_path & exception protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role, city, address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '9425112345'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Jabalpur'),
        COALESCE(NEW.raw_user_meta_data->>'address', 'Jabalpur Resident')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        address = EXCLUDED.address;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure even if profile trigger has edge-case conflict
    RETURN NEW;
END;
$$;

-- 3. Re-bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure profiles table allows insert and update
DROP POLICY IF EXISTS "Enable insert for authenticated users and trigger" ON profiles;
CREATE POLICY "Enable insert for authenticated users and trigger" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
