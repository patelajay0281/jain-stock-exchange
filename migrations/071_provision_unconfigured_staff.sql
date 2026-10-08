create or replace function public.jse_provision_unconfigured_staff()
returns jsonb
language plpgsql
security definer
set search_path to public, extensions, pg_temp
as $$
declare
  v_admin users%rowtype;
  v_row record;
  v_password text;
  v_items jsonb := '[]'::jsonb;
  v_count int := 0;
begin
  select * into v_admin
  from public.users
  where is_active and role='ADMIN'
  order by id
  limit 1
  for update;

  if not found then
    raise exception 'Active administrator account not found';
  end if;

  for v_row in
    select id, username, role, email
    from public.users
    where is_active
      and role in ('PIT_MANAGER','EXCHANGE','BANK','INSTITUTION','ASSOCIATE_ADMIN')
      and password_hash is null
    order by role, username
    for update
  loop
    v_password := 'JSE-' || encode(gen_random_bytes(15),'hex');

    update public.users
      set password_hash=extensions.crypt(v_password,extensions.gen_salt('bf',10)),
          must_change_password=true,
          updated_at=now()
    where id=v_row.id;

    insert into public.audit_log(
      actor_user_id, actor_email, actor_role, action, what_happened, details_json
    )
    values(
      v_admin.id, v_admin.email, v_admin.role,
      'STAFF_INITIAL_PROVISION',
      'System provisioned an unconfigured active staff account with a one-time temporary password; target must change it at first login.',
      jsonb_build_object(
        'target_user_id', v_row.id,
        'target_username', v_row.username,
        'target_role', v_row.role
      )
    );

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'username',v_row.username,
      'role',v_row.role,
      'email',v_row.email,
      'temporary_password',v_password
    ));
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('ok',true,'count',v_count,'credentials',v_items);
end;
$$;

revoke all on function public.jse_provision_unconfigured_staff() from public;
revoke all on function public.jse_provision_unconfigured_staff() from anon;
revoke all on function public.jse_provision_unconfigured_staff() from authenticated;
grant execute on function public.jse_provision_unconfigured_staff() to service_role;
