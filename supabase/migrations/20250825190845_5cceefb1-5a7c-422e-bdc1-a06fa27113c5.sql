-- Fix the handle_new_user function to correctly capture signup data
-- The signup form sends 'full_name' not separate first_name/last_name

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_value text;
  first_name_value text;
  last_name_value text;
BEGIN
  -- Get the full name from user metadata
  full_name_value := COALESCE(new.raw_user_meta_data->>'full_name', '');
  
  -- Split full name into first and last name
  IF full_name_value != '' THEN
    -- Find the first space to split first and last name
    first_name_value := TRIM(SPLIT_PART(full_name_value, ' ', 1));
    -- Everything after the first word becomes last name
    last_name_value := TRIM(SUBSTRING(full_name_value FROM POSITION(' ' IN full_name_value) + 1));
    
    -- If there's no space, put everything in first_name
    IF last_name_value = '' THEN
      last_name_value := '';
    END IF;
  ELSE
    first_name_value := '';
    last_name_value := '';
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, phone)
  VALUES (
    new.id,
    first_name_value,
    last_name_value,
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  
  RETURN new;
END;
$$;