-- Add avatar_url column to doctor_profiles for storing profile images
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;