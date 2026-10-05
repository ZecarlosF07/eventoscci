export const ACTIVITY_LIST_SELECT = `
  id, banner_path, capacity, general_price, presale_general_price, presale_member_price, presale_ends_at, is_free, is_listed, member_price, member_free_passes_per_company, members_only,
  modality, published_at, registration_close_at, registration_open_at,
  registrations_closed_manually,
  short_description, slug, status, title, type,
  category:categories!activities_category_id_fkey(id, name, slug),
  dates:activity_dates!inner(id, activity_id, starts_at, ends_at, label, sort_order,
    created_at, updated_at, deleted_at, deleted_by)
`;
