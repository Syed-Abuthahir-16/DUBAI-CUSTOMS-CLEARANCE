-- Create deletion_logs table
CREATE TABLE IF NOT EXISTS public.deletion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    user_name TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deletion_logs ENABLE ROW LEVEL SECURITY;

-- Enable insert access for deletion log recording
CREATE POLICY "Enable insert for all users" 
    ON public.deletion_logs FOR INSERT 
    WITH CHECK (true);

-- Enable select access for users checking their logs (or admin purposes)
CREATE POLICY "Enable select for all users" 
    ON public.deletion_logs FOR SELECT 
    USING (true);
