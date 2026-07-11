-- Drop old MVP policies that allowed user_id IS NULL
DROP POLICY IF EXISTS "Users can view their own declarations" ON public.declarations;
DROP POLICY IF EXISTS "Users can insert their own declarations" ON public.declarations;
DROP POLICY IF EXISTS "Users can update their own declarations" ON public.declarations;
DROP POLICY IF EXISTS "Users can delete their own declarations" ON public.declarations;

-- Create strict user-scoped policies
CREATE POLICY "Users can view their own declarations" 
    ON public.declarations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own declarations" 
    ON public.declarations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own declarations" 
    ON public.declarations FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own declarations" 
    ON public.declarations FOR DELETE 
    USING (auth.uid() = user_id);

-- Clean up any legacy anonymous/demo declarations with null user_id to prevent any potential data leaks
DELETE FROM public.declarations WHERE user_id IS NULL;
