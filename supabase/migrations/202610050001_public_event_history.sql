-- A read-only event catalog. Pagination is calculated after aggregating all
-- active sessions, under the caller's existing row-level security policies.
alter table public.activities add constraint activities_event_reserved_slug
  check (type <> 'event' or slug <> 'realizados');

create function public.get_public_event_page(
  p_view text default 'upcoming',
  p_page integer default 1,
  p_page_size integer default 12,
  p_category_id uuid default null,
  p_modality public.activity_modality default null,
  p_is_free boolean default null,
  p_date date default null,
  p_query text default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_view is null or p_view not in ('upcoming', 'past')
    or p_page is null or p_page < 1
    or p_page_size is null or p_page_size not between 1 and 12 then
    raise exception 'INVALID_EVENT_PAGE' using errcode = '22023';
  end if;

  with eligible as (
    select activity.id, sessions.last_end, sessions.next_start
    from public.activities activity
    join lateral (
      select max(coalesce(d.ends_at, d.starts_at)) as last_end,
        min(d.starts_at) filter (where coalesce(d.ends_at, d.starts_at) > now()) as next_start,
        bool_or((d.starts_at at time zone 'America/Lima')::date >= p_date) as matches_date
      from public.activity_dates d
      where d.activity_id = activity.id and d.deleted_at is null
    ) sessions on sessions.last_end is not null
    left join public.categories category on category.id = activity.category_id
    where activity.type = 'event' and activity.is_listed
      and activity.deleted_at is null and activity.published_at is not null
      and (
        (p_view = 'past' and activity.status in ('published', 'finished') and sessions.last_end <= now())
        or (p_view = 'upcoming' and activity.status in ('published', 'cancelled') and sessions.last_end > now())
      )
      and (p_category_id is null or activity.category_id = p_category_id)
      and (p_modality is null or activity.modality = p_modality)
      and (p_is_free is null or activity.is_free = p_is_free)
      and (p_date is null or sessions.matches_date)
      and (nullif(btrim(p_query), '') is null or strpos(
        lower(concat_ws(' ', activity.title, activity.short_description, category.name)),
        lower(btrim(p_query))) > 0)
  ), page as (
    select id, row_number() over (
      order by case when p_view = 'past' then last_end end desc,
        case when p_view = 'upcoming' then next_start end asc, id asc
    ) as position
    from eligible
    order by position
    offset (p_page::bigint - 1) * p_page_size limit p_page_size
  )
  select jsonb_build_object(
    'activity_ids', coalesce((select jsonb_agg(id order by position) from page), '[]'::jsonb),
    'total', (select count(*) from eligible)
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function public.get_public_event_page(text, integer, integer, uuid, public.activity_modality, boolean, date, text) from public;
grant execute on function public.get_public_event_page(text, integer, integer, uuid, public.activity_modality, boolean, date, text) to anon, authenticated, service_role;
