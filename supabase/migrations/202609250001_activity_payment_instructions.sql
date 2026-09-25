-- Public payment guidance for paid activities, including member-only events.
alter table public.activities
  add column payment_note text;

alter table public.activities
  add constraint activities_payment_note_length check (
    payment_note is null or length(payment_note) <= 600
  );

create or replace function public.validate_activity_payment_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
begin
  -- Check the final row: save_activity writes the core row and the note in one transaction.
  select * into v_activity from public.activities where id = new.id;
  if not found then
    return null;
  end if;
  if v_activity.is_free and v_activity.payment_note is not null then
    raise exception 'Una actividad gratuita no puede tener indicaciones de pago.'
      using errcode = '23514', constraint = 'activities_free_payment_note_null';
  end if;
  if v_activity.status = 'published' and not v_activity.is_free
    and nullif(btrim(v_activity.payment_note), '') is null then
    raise exception 'Indica cómo realizar el pago antes de publicar.'
      using errcode = '23514', constraint = 'activities_published_payment_note_required';
  end if;
  return null;
end;
$$;

create constraint trigger validate_activity_payment_note
after insert or update on public.activities
deferrable initially deferred
for each row execute function public.validate_activity_payment_note();

create or replace function public.save_activity(
  p_activity jsonb,
  p_dates jsonb,
  p_speakers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id uuid;
  v_payment_note text := nullif(btrim(p_activity->>'payment_note'), '');
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if v_payment_note is not null and length(v_payment_note) > 600 then
    raise exception 'La nota de pago supera los 600 caracteres.'
      using errcode = '23514', constraint = 'activities_payment_note_length';
  end if;
  if coalesce((p_activity->>'status')::public.activity_status, 'draft') = 'published'
    and not coalesce((p_activity->>'is_free')::boolean, false)
    and v_payment_note is null then
    raise exception 'Indica cómo realizar el pago antes de publicar.'
      using errcode = '23514', constraint = 'activities_published_payment_note_required';
  end if;

  v_activity_id := public.save_activity_without_listing(p_activity, p_dates, p_speakers);
  update public.activities
  set is_listed = coalesce((p_activity->>'is_listed')::boolean, true),
      payment_note = case when is_free then null else v_payment_note end
  where id = v_activity_id;
  return v_activity_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb)
  to authenticated, service_role;
