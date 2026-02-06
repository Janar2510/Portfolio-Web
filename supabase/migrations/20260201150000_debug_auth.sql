-- Debug function to check auth context
create or replace function public.get_debug_auth()
returns jsonb as $$
begin
  return jsonb_build_object(
    'auth_uid', auth.uid(),
    'role', auth.role(),
    'jwt', current_setting('request.jwt.claims', true)
  );
end;
$$ language plpgsql security definer;
