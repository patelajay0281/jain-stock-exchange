-- JAIN STOCK EXCHANGE — server-side administrator control secret
CREATE TABLE IF NOT EXISTS public.admin_control_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_control_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_control_settings FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_control_settings FROM anon;
REVOKE ALL ON TABLE public.admin_control_settings FROM authenticated;
GRANT SELECT ON TABLE public.admin_control_settings TO service_role;
INSERT INTO public.admin_control_settings(id,password_hash,updated_at)
VALUES (1, '$2a$06$UaaIA9DovbeX.9Ei6NcFL.J/EyS2CeYhVi55EdgjJlSdvyxOw3ZWG', now())
ON CONFLICT (id) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=now();
