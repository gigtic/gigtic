-- Create user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) NOT NULL,
    reported_id UUID REFERENCES public.users(id) NOT NULL,
    reason TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policies for user_reports
CREATE POLICY "Users can insert their own reports" ON public.user_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view reports they created" ON public.user_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.user_reports
    FOR SELECT USING (
        (auth.jwt() ->> 'email' IN ('vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com', 'hello@gigtic.in') OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE admin_whitelist.email = auth.jwt() ->> 'email'))
    );

CREATE POLICY "Admins can update reports" ON public.user_reports
    FOR UPDATE USING (
        (auth.jwt() ->> 'email' IN ('vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com', 'hello@gigtic.in') OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE admin_whitelist.email = auth.jwt() ->> 'email'))
    );

-- Create reports bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for reports bucket
CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Admins can read screenshots" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'reports' AND
        (auth.jwt() ->> 'email' IN ('vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com', 'hello@gigtic.in') OR EXISTS (SELECT 1 FROM public.admin_whitelist WHERE admin_whitelist.email = auth.jwt() ->> 'email'))
    );

-- Public can view reports bucket since it's a public bucket
CREATE POLICY "Public can view reports bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'reports');
