-- Create user_files table to track PDFs and generated CSV documents
CREATE TABLE IF NOT EXISTS public.user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf' | 'csv'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own files" 
    ON public.user_files FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own files" 
    ON public.user_files FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
    ON public.user_files FOR DELETE 
    USING (auth.uid() = user_id);
