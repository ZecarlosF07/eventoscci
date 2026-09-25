-- A published paid activity must have a positive tariff for each enabled audience.
-- Older drafts remain editable, and archived historical records are not rewritten.
alter table public.activities
  add constraint activities_exclusive_general_price_zero check (
    not members_only or general_price = 0
  ) not valid,
  add constraint activities_published_paid_prices_positive check (
    status <> 'published' or is_free or (
      member_price > 0 and (members_only or general_price > 0)
    )
  ) not valid;
