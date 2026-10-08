-- JAIN STOCK EXCHANGE — staff bootstrap authentication
CREATE OR REPLACE FUNCTION public.jse_login(p_username text,p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path=public,extensions,pg_temp
AS $$
DECLARE v_user users%ROWTYPE; v_bootstrap boolean:=false;
BEGIN
  SELECT * INTO v_user
  FROM users
  WHERE lower(username)=lower(p_username) AND is_active
    AND (
      (password_hash IS NOT NULL AND crypt(p_password,password_hash)=password_hash)
      OR
      (password_hash IS NULL AND lower(p_password)=lower(username))
    )
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid credentials'; END IF;
  v_bootstrap := v_user.password_hash IS NULL;
  RETURN jsonb_build_object(
    'user_id',v_user.id,'username',v_user.username,'email',v_user.email,
    'display_name',v_user.display_name,'role',v_user.role::text,
    'team_id',v_user.team_id,'institution_id',v_user.institution_id,
    'needs_password_change',v_bootstrap
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.jse_set_password(p_user_id bigint,p_new_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,extensions,pg_temp
AS $$
DECLARE v_user users%ROWTYPE;
BEGIN
  IF length(coalesce(p_new_password,''))<10 THEN RAISE EXCEPTION 'Password must be at least 10 characters'; END IF;
  SELECT * INTO v_user FROM public.users WHERE id=p_user_id AND is_active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active user not found'; END IF;
  UPDATE public.users
  SET password_hash=extensions.crypt(p_new_password,extensions.gen_salt('bf',10)),updated_at=now()
  WHERE id=p_user_id;
  RETURN jsonb_build_object('ok',true,'username',v_user.username,'needs_password_change',false);
END;
$$;

REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM anon;
REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.jse_set_password(bigint,text) TO service_role;
