-- JAIN STOCK EXCHANGE — secure staff password provisioning
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
UPDATE public.users SET must_change_password=true WHERE is_active=true AND password_hash IS NULL;

CREATE OR REPLACE FUNCTION public.jse_login(p_username text,p_password text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public,extensions,pg_temp AS $$
DECLARE v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM public.users
  WHERE lower(username)=lower(p_username) AND is_active=true
    AND password_hash IS NOT NULL
    AND crypt(p_password,password_hash)=password_hash LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid credentials'; END IF;
  RETURN jsonb_build_object('user_id',v_user.id,'username',v_user.username,'email',v_user.email,'display_name',v_user.display_name,'role',v_user.role::text,'team_id',v_user.team_id,'institution_id',v_user.institution_id,'needs_password_change',coalesce(v_user.must_change_password,false));
END; $$;

CREATE OR REPLACE FUNCTION public.jse_set_password(p_user_id bigint,p_new_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE v_user users%ROWTYPE;
BEGIN
  IF length(coalesce(p_new_password,''))<10 THEN RAISE EXCEPTION 'Password must be at least 10 characters'; END IF;
  SELECT * INTO v_user FROM public.users WHERE id=p_user_id AND is_active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active user not found'; END IF;
  UPDATE public.users SET password_hash=extensions.crypt(p_new_password,extensions.gen_salt('bf',10)),must_change_password=false,updated_at=now() WHERE id=p_user_id;
  RETURN jsonb_build_object('ok',true,'username',v_user.username,'needs_password_change',false);
END; $$;

CREATE OR REPLACE FUNCTION public.jse_set_temporary_password(p_admin_user_id bigint,p_target_user_id bigint,p_new_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE v_admin users%ROWTYPE; v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_admin FROM public.users WHERE id=p_admin_user_id AND is_active FOR UPDATE;
  IF NOT FOUND OR v_admin.role<>'ADMIN' THEN RAISE EXCEPTION 'Administrator role required'; END IF;
  IF length(coalesce(p_new_password,''))<12 THEN RAISE EXCEPTION 'Temporary password must be at least 12 characters'; END IF;
  SELECT * INTO v_user FROM public.users WHERE id=p_target_user_id AND is_active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active target user not found'; END IF;
  IF v_user.role='ADMIN' THEN RAISE EXCEPTION 'Use the administrator password change flow for an administrator account'; END IF;
  UPDATE public.users SET password_hash=extensions.crypt(p_new_password,extensions.gen_salt('bf',10)),must_change_password=true,updated_at=now() WHERE id=p_target_user_id;
  INSERT INTO public.audit_log(actor_user_id,actor_email,actor_role,action,what_happened,details_json)
  VALUES(v_admin.id,v_admin.email,v_admin.role,'STAFF_TEMP_PASSWORD_RESET','Administrator issued a temporary password for a staff account; target must change it at next login.',jsonb_build_object('target_user_id',v_user.id,'target_username',v_user.username));
  RETURN jsonb_build_object('ok',true,'username',v_user.username,'needs_password_change',true);
END; $$;
REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM anon;
REVOKE ALL ON FUNCTION public.jse_set_password(bigint,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.jse_set_password(bigint,text) TO service_role;
REVOKE ALL ON FUNCTION public.jse_set_temporary_password(bigint,bigint,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.jse_set_temporary_password(bigint,bigint,text) FROM anon;
REVOKE ALL ON FUNCTION public.jse_set_temporary_password(bigint,bigint,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.jse_set_temporary_password(bigint,bigint,text) TO service_role;