-- Make treatment_frequency column nullable since it's being removed from the app
ALTER TABLE public.user_preferences 
ALTER COLUMN treatment_frequency DROP NOT NULL;