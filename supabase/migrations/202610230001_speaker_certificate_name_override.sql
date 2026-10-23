-- JSON input stays compatible with existing clients. Only a new certificate
-- accepts the override; retries and regeneration keep the original snapshot.
do $$
declare
  v_definition text;
  v_name_expression text := 'concat_ws('' '', v_speaker.first_names, v_speaker.last_names), v_activity.title, v_role,';
  v_validation_anchor text := 'if length(v_role) > 120 then raise exception ''VALIDATION_ERROR'' using errcode = ''22023''; end if;';
begin
  select pg_get_functiondef('public.prepare_speaker_certificates(uuid,uuid,jsonb)'::regprocedure)
    into v_definition;
  if strpos(v_definition, v_name_expression) = 0 or strpos(v_definition, v_validation_anchor) = 0 then
    raise exception 'Speaker certificate preparation definition is not compatible with name overrides';
  end if;
  v_definition := replace(v_definition, v_name_expression,
    'coalesce(nullif(btrim(v_item->>''full_name''), ''''), concat_ws('' '', v_speaker.first_names, v_speaker.last_names)), v_activity.title, v_role,');
  v_definition := replace(v_definition, v_validation_anchor, v_validation_anchor || E'\n' ||
    'if v_item ? ''full_name'' and (jsonb_typeof(v_item->''full_name'') <> ''string''
      or length(btrim(v_item->>''full_name'')) < 2 or length(btrim(v_item->>''full_name'')) > 241)
     then raise exception ''VALIDATION_ERROR'' using errcode = ''22023''; end if;');
  execute v_definition;
end;
$$;
