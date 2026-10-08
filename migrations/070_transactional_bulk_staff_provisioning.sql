-- JAIN STOCK EXCHANGE — transactional bulk staff password provisioning
CREATE OR REPLACE FUNCTION public.jse_bulk_set_temporary_passwords(
  p_admin_user_id bigint,
  p_credentials jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,extensions,pg_temp
AS $$
DECLARE
  v_admin users%ROWTYPE;
  v_item jsonb;
  v_user users%ROWTYPE;
  v_username text;
  v_password text;
  v_credentials jsonb:='[]'::jsonb;
  v_count integer:=0;
BEGIN
  SELECT * INTO v_admin FROM public.users WHERE id=p_admin_user_id AND is_active FOR UPDATE;
  IF NOT FOUND OR v_admin.role<>'ADMIN' THEN RAISE EXCEPTION 'Administrator role required'; END IF;
  IF jsonb_typeof(p_credentials)<>'array' THEN RAISE EXCEPTION 'Credentials payload must be an array'; END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_credentials) LOOP
    v_username:=trim(v_item->>'username'); v_password:=v_item->>'temporary_password';
    IF v_username IS NULL OR v_username='' OR v_password IS NULL OR length(v_password)<12 THEN RAISE EXCEPTION 'Invalid temporary credential payload'; END IF;
    SELECT * INTO v_user FROM public.users WHERE lower(username)=lower(v_username) AND is_active=true AND role<>'ADMIN' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Active non-admin user not found: %',v_username; END IF;
    UPDATE public.users SET password_hash=extensions.crypt(v_password,extensions.gen_salt('bf',10)),must_change_password=true,updated_at=now() WHERE id=v_user.id;
    INSERT INTO public.audit_log(actor_user_id,actor_email,actor_role,action,what_happened,details_json)
    VALUES(v_admin.id,v_admin.email,v_admin.role,'STAFF_TEMP_PASSWORD_RESET','Administrator provisioned a temporary password for a staff account; target must change it at first login.',jsonb_build_object('target_user_id',v_user.id,'target_username',v_user.username,'bulk_operation',true));
    v_credentials:=v_credentials||jsonb_build_object('username',v_user.username,'display_name',coalesce(v_user.display_name,''),'role',v_user.role::text,'needs_password_change',true);
    v_count:=v_count+1;
  END LOOP;
  RETURN jsonb_build_object('ok',true,'count',v_count,'credentials',v_credentials,'warning','Temporary passwords are not stored in plaintext.');
END;
$$;
REVOKE ALL ON FUNCTION public.jse_bulk_set_temporary_passwords(bigint,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.jse_bulk_set_temporary_passwords(bigint,jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.jse_bulk_set_temporary_passwords(bigint,jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.jse_bulk_set_temporary_passwords(bigint,jsonb) TO service_role;