-- Create suggestions table
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    suggestion_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert suggestions (authenticated or anonymous feedback submissions)
CREATE POLICY "Enable insert for all users" 
    ON public.suggestions FOR INSERT 
    WITH CHECK (true);

-- Allow select access for viewing (or we can restrict to admins, but for sandbox simplicity allow select)
CREATE POLICY "Enable select for all users" 
    ON public.suggestions FOR SELECT 
    USING (true);
