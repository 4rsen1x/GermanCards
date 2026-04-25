-- GermanCards: Supabase schema
-- Run this in your Supabase SQL editor at:
-- https://supabase.com/dashboard/project/_/sql/new

-- ─── Topics table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.topics (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Neues Thema',
  description TEXT,
  is_public   BOOLEAN     NOT NULL DEFAULT false,
  columns     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS topics_updated_at ON public.topics;
CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Users can read their own topics, and any public topic
CREATE POLICY "topics_select" ON public.topics
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Users can insert their own topics
CREATE POLICY "topics_insert" ON public.topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner can update their own topics (any field, including is_public)
-- Any authenticated user can update columns of a public topic (but cannot change is_public or user_id)
-- Combined into one policy so owner can still make a public topic private without WITH CHECK conflict
DROP POLICY IF EXISTS "topics_update" ON public.topics;
CREATE POLICY "topics_update" ON public.topics
  FOR UPDATE
  USING  (auth.uid() = user_id OR  is_public = true)
  WITH CHECK (auth.uid() = user_id OR  is_public = true);

-- Users can delete their own topics
CREATE POLICY "topics_delete" ON public.topics
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Role grants (required — RLS is checked AFTER table-level permissions) ───

GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT SELECT                         ON public.topics TO anon;

-- ─── Realtime ────────────────────────────────────────────────────────────────

-- Enable realtime for topics table
ALTER PUBLICATION supabase_realtime ADD TABLE public.topics;

-- ─── Index ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS topics_updated_at_idx ON public.topics(updated_at DESC);
