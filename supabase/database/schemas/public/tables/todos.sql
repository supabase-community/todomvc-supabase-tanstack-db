CREATE TABLE public.todos (
  id        uuid    DEFAULT gen_random_uuid() NOT NULL,
  title     text    NOT NULL,
  completed boolean DEFAULT false
);

CREATE POLICY "Enable all access for all users" ON public.todos
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.todos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.todos
  ADD CONSTRAINT todos_pkey PRIMARY KEY (id);

GRANT ALL ON public.todos TO anon;

GRANT ALL ON public.todos TO authenticated;

GRANT ALL ON public.todos TO service_role;