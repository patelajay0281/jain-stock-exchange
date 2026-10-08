-- JAIN STOCK EXCHANGE — restricted server-side admin control verification
CREATE OR REPLACE FUNCTION public.jse_verify_admin_control_password(p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path=public,extensions,pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_control_settings
    WHERE id=1
      AND password_hash=extensions.crypt(COALESCE(p_password,''),password_hash)
  );
$$;
REVOKE ALL ON FUNCTION public.jse_verify_admin_control_password(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.jse_verify_admin_control_password(text) FROM anon;
REVOKE ALL ON FUNCTION public.jse_verify_admin_control_password(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.jse_verify_admin_control_password(text) TO service_role;
