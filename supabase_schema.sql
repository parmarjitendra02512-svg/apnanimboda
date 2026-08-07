-- Apna Nimboda: Supabase Migration Schema
-- Copy and paste this entirely into the Supabase SQL Editor and click "RUN"

-- 1. Create Users Table
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  father_name TEXT,
  caste TEXT,
  gotra TEXT,
  village TEXT,
  pincode TEXT,
  district TEXT,
  state TEXT,
  business_details TEXT,
  blood_group TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'business', 'enterprise')),
  plan_expiry TIMESTAMPTZ,
  is_approved BOOLEAN DEFAULT false,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Auth Requests Table (For pending registrations and resets)
CREATE TABLE public.auth_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('register', 'password_reset')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  data JSONB, -- Stores form data or new password hash
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create System Logs Table (Analytics, searches, clicks, errors)
CREATE TABLE public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_type TEXT NOT NULL CHECK (log_type IN ('search', 'click', 'error', 'security', 'report')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Metrics Table (For high-level counters like pageViews)
CREATE TABLE public.metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT UNIQUE NOT NULL,
  value BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Create an index for faster lookups on mobile numbers
CREATE INDEX idx_users_mobile ON public.users(mobile);
CREATE INDEX idx_auth_requests_mobile ON public.auth_requests(mobile);
CREATE INDEX idx_system_logs_type ON public.system_logs(log_type);

-- Trigger to automatically update "updated_at" on the users table
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
