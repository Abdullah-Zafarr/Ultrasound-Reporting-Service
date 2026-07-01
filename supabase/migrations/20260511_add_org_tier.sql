-- Add tier column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'individual' 
CHECK (tier IN ('individual', 'professional', 'enterprise'));

-- Default existing orgs to enterprise for the demo
UPDATE public.organizations SET tier = 'enterprise';
