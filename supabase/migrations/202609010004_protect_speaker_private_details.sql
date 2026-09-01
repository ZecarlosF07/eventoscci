revoke all on table public.speaker_private_details from public, anon;
grant select, insert, update, delete on table public.speaker_private_details to authenticated;
