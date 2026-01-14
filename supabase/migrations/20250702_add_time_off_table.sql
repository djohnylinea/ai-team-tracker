-- Migration: Update time_off table for better tracking
-- Run this in your Supabase SQL Editor

-- Add notes column to time_off table if it doesn't exist
ALTER TABLE public.time_off ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_time_off_member_id ON public.time_off(member_id);
CREATE INDEX IF NOT EXISTS idx_time_off_org_id ON public.time_off(org_id);
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON public.time_off(start_date, end_date);

-- Create permissive policy if it doesn't exist
DO $$ BEGIN
  CREATE POLICY "Allow all operations on time_off"
    ON public.time_off
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
