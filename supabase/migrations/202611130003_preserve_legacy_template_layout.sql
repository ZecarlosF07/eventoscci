-- While the previous frontend is live, its saves must retain the layout it renders.
do $$
declare
  v_definition text;
  v_anchor text := 'v_config || ''{"layout_version":2}''';
begin
  select pg_get_functiondef('public.save_certificate_template(jsonb,jsonb)'::regprocedure) into v_definition;
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible template layout assignment'; end if;
  execute replace(v_definition, v_anchor,
    'v_config - ''layout_version'' || case when p_template ? ''expected_updated_at''
      or v_old.template_config->>''layout_version'' = ''2'' then ''{"layout_version":2}''::jsonb else ''{}''::jsonb end');
end;
$$;
