-- Fix critical security vulnerability in otp_codes table
-- Remove overly permissive RLS policies that allow public access

-- Drop the existing dangerous policies
DROP POLICY IF EXISTS "Allow read otp codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Allow update otp codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Allow insert otp codes" ON public.otp_codes;

-- Create secure policies that only allow server-side access
-- Only edge functions with service role key should access OTP codes
CREATE POLICY "Service role can manage otp codes" 
ON public.otp_codes 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- Add index for performance on email and expiry lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_expires 
ON public.otp_codes (email, expires_at) 
WHERE used = false;