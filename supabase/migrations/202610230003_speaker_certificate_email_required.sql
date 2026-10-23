-- Profiles may remain incomplete; new speaker certificate issuance requires email.
create function public.speaker_certificate_email_is_valid(p_email text)
returns boolean language sql immutable set search_path = '' as $function$
  -- Same format as the installed Zod email validator; keep the parity test.
  select coalesce(btrim(p_email) ~ $email$^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$$email$, false);
$function$;

create function public.assert_speaker_certificate_email(p_speaker_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_email text;
begin
  -- Lock the private row so removing/changing email cannot race finalization.
  select btrim(email) into v_email from public.speaker_private_details where speaker_id = p_speaker_id for update;
  if not public.speaker_certificate_email_is_valid(v_email) then
    raise exception 'SPEAKER_EMAIL_REQUIRED' using errcode = 'P0001';
  end if;
  return v_email;
end;
$$;

create function public.require_speaker_certificate_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.recipient_type = 'speaker' then
    if tg_op = 'INSERT' then
      perform public.assert_speaker_certificate_email(new.speaker_id);
    elsif old.file_path is null and new.file_path is not null then
      perform public.assert_speaker_certificate_email(new.speaker_id);
    end if;
  end if;
  return new;
end;
$$;
create trigger require_speaker_certificate_email before insert or update of file_path on public.certificates
for each row execute function public.require_speaker_certificate_email();

-- Preserve signatures, frozen snapshots and idempotent retrieval of issued history.
do $$
declare v_definition text; v_signature text; v_anchor text; v_speaker_expression text;
begin
  for v_signature, v_speaker_expression in select * from (values
    ('public.prepare_speaker_certificates(uuid,uuid,jsonb)', 'v_speaker.id'),
    ('public.claim_speaker_certificate(uuid)', 'v_speaker_id'),
    ('public.finalize_speaker_certificate(uuid,text,text,uuid)', 'v_certificate.speaker_id')
  ) definitions(signature, speaker_expression) loop
    select pg_get_functiondef(v_signature::regprocedure) into v_definition;
    v_anchor := 'perform public.assert_speaker_document(' || v_speaker_expression || ');';
    if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible speaker certificate definition: %', v_signature; end if;
    v_definition := replace(v_definition, v_anchor, v_anchor || E'\n      perform public.assert_speaker_certificate_email(' || v_speaker_expression || ');');
    if v_signature like '%finalize_speaker_certificate%' then
      v_anchor := 'select nullif(btrim(email), '''') into v_email from public.speaker_private_details where speaker_id = v_certificate.speaker_id;';
      if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible notification email lookup'; end if;
      v_definition := replace(v_definition, v_anchor, 'v_email := public.assert_speaker_certificate_email(v_certificate.speaker_id);');
    end if;
    execute v_definition;
  end loop;
end;
$$;

revoke all on function public.speaker_certificate_email_is_valid(text), public.assert_speaker_certificate_email(uuid),
  public.require_speaker_certificate_email() from public, anon, authenticated, service_role;
