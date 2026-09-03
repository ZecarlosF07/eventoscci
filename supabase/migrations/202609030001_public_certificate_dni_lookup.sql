create index if not exists idx_audit_logs_certificate_search_ip
on public.audit_logs(ip_address, created_at desc)
where action = 'certificate.public_search';

create index if not exists idx_audit_logs_certificate_search_document
on public.audit_logs((new_data->>'document_number'), created_at desc)
where action in ('certificate.public_search', 'certificate.public_search.rate_limited');

create or replace function public.get_public_certificate(p_access_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'certificate_code', certificate.certificate_code,
    'certificate_type', certificate.certificate_type,
    'status', certificate.status,
    'participant_name', certificate.participant_name_snapshot,
    'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot,
    'date_text', certificate.date_text_snapshot,
    'academic_hours', certificate.academic_hours_snapshot,
    'issued_at', certificate.issued_at,
    'revoked_at', certificate.revoked_at,
    'revocation_reason', certificate.revocation_reason,
    'download_available', certificate.status = 'issued' and certificate.file_path is not null,
    'source_activity_id', activity.id,
    'source_activity_type', activity.type,
    'source_category_id', activity.category_id
  )
  from public.certificates certificate
  left join public.registrations registration
    on registration.id = certificate.registration_id
  left join public.activities activity
    on activity.id = registration.activity_id
  where certificate.access_token::text = lower(btrim(p_access_token))
    and certificate.deleted_at is null
  limit 1;
$$;

create or replace function public.search_public_certificates_by_dni(
  p_document_number text,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_actor_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document_number text := btrim(left(coalesce(p_document_number, ''), 20));
  v_person public.people%rowtype;
  v_certificates jsonb := '[]'::jsonb;
  v_recommendation_context jsonb;
  v_result_count integer := 0;
  v_outcome text;
begin
  if p_ip_address is not null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('certificate-search:' || pg_catalog.host(p_ip_address), 0)
    );
  end if;

  if p_ip_address is not null and (
    select count(*) >= 60
    from (
      select 1
      from public.audit_logs audit
      where audit.action = 'certificate.public_search'
        and audit.ip_address = p_ip_address
        and audit.created_at >= now() - interval '10 minutes'
      limit 60
    ) recent_searches
  ) then
    insert into public.audit_logs (
      actor_user_id, action, entity_type, new_data, ip_address, user_agent
    ) values (
      p_actor_user_id,
      'certificate.public_search.rate_limited',
      'certificate_public_query',
      jsonb_build_object(
        'document_number', v_document_number,
        'outcome', 'rate_limited',
        'result_count', 0
      ),
      p_ip_address,
      left(p_user_agent, 500)
    );
    return jsonb_build_object(
      'status', 'rate_limited',
      'participant_name', null,
      'certificates', '[]'::jsonb,
      'recommendation_context', null
    );
  end if;

  if v_document_number !~ '^[0-9]{8}$' then
    insert into public.audit_logs (
      actor_user_id, action, entity_type, new_data, ip_address, user_agent
    ) values (
      p_actor_user_id,
      'certificate.public_search',
      'certificate_public_query',
      jsonb_build_object(
        'document_number', v_document_number,
        'outcome', 'invalid',
        'result_count', 0
      ),
      p_ip_address,
      left(p_user_agent, 500)
    );
    return jsonb_build_object(
      'status', 'invalid',
      'participant_name', null,
      'certificates', '[]'::jsonb,
      'recommendation_context', null
    );
  end if;

  select * into v_person
  from public.people person
  where person.document_type = 'dni'
    and person.document_number = v_document_number
    and person.deleted_at is null
  limit 1;

  if found then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'access_token', certificate.access_token,
        'academic_hours', certificate.academic_hours_snapshot,
        'certificate_code', certificate.certificate_code,
        'certificate_type', certificate.certificate_type,
        'condition', certificate.condition_snapshot,
        'date_text', certificate.date_text_snapshot,
        'download_available', certificate.status = 'issued' and certificate.file_path is not null,
        'issued_at', certificate.issued_at,
        'participant_name', certificate.participant_name_snapshot,
        'revocation_reason', certificate.revocation_reason,
        'status', certificate.status,
        'title', certificate.title_snapshot
      ) order by certificate.issued_at desc
    ), '[]'::jsonb), count(*)::integer
    into v_certificates, v_result_count
    from public.certificates certificate
    where certificate.person_id = v_person.id
      and certificate.deleted_at is null;

    select jsonb_build_object(
      'source_activity_id', activity.id,
      'source_activity_type', activity.type,
      'source_category_id', activity.category_id
    )
    into v_recommendation_context
    from public.certificates certificate
    join public.registrations registration
      on registration.id = certificate.registration_id
    join public.activities activity
      on activity.id = registration.activity_id
    where certificate.person_id = v_person.id
      and certificate.certificate_type = 'activity'
      and certificate.deleted_at is null
    order by certificate.issued_at desc
    limit 1;
  end if;

  v_outcome := case when v_result_count > 0 then 'found' else 'not_found' end;
  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, new_data, ip_address, user_agent
  ) values (
    p_actor_user_id,
    'certificate.public_search',
    'certificate_public_query',
    case when v_result_count > 0 then v_person.id else null end,
    jsonb_build_object(
      'document_number', v_document_number,
      'outcome', v_outcome,
      'result_count', v_result_count
    ),
    p_ip_address,
    left(p_user_agent, 500)
  );

  return jsonb_build_object(
    'status', v_outcome,
    'participant_name', case
      when v_result_count > 0 then concat_ws(' ', v_person.first_names, v_person.last_names)
      else null
    end,
    'certificates', v_certificates,
    'recommendation_context', v_recommendation_context
  );
end;
$$;

revoke execute on function public.search_public_certificates_by_dni(text, inet, text, uuid)
from public, anon, authenticated;
grant execute on function public.search_public_certificates_by_dni(text, inet, text, uuid)
to service_role;

comment on function public.search_public_certificates_by_dni(text, inet, text, uuid) is
  'Consulta pública mediada por servidor y registra cada búsqueda de certificados por DNI.';
