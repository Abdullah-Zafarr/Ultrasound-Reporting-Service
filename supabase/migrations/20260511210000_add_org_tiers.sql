-- Add tier column to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tier text DEFAULT 'enterprise' CHECK (tier IN ('individual', 'professional', 'enterprise'));

-- Update existing organizations to enterprise by default
UPDATE public.organizations SET tier = 'enterprise' WHERE tier IS NULL;
