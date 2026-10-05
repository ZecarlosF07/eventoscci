import type { ActivityDetail } from "@/features/activities/types/activity.types";

export function seoActivity(overrides: Partial<ActivityDetail> = {}): ActivityDetail {
  return {
    academic_hours: null, additional_info: null, address: null,
    allows_student_registration: true, banner_path: null, capacity: null,
    category_id: null, certificate_general_price: 0, certificate_member_price: 0,
    certificate_mode: "none", contact_email: null, contact_id: null,
    contact_name: null, contact_phone: null, created_at: "2026-09-01T00:00:00Z",
    created_by: null, deleted_at: null, deleted_by: null,
    description: "Encuentro empresarial abierto al público en Ica.",
    duration_text: null, general_price: 170, id: "ae000000-0000-4000-8000-000000000001",
    is_free: false, is_listed: true, location_name: null, maps_embed_url: null,
    member_free_passes_per_company: 0, member_price: 150, members_only: false,
    modality: "in_person", objective: null, payment_note: null,
    presale_ends_at: "2026-10-21T05:00:00Z", presale_general_price: 160,
    presale_member_price: 140, program: "09:00 Apertura y presentación del encuentro.",
    program_image_paths: ["event/program.png"], published_at: "2026-09-01T00:00:00Z",
    registration_close_at: null, registration_open_at: null,
    registrations_closed_manually: false, short_description: "Encuentro empresarial en Ica.",
    slug: "encuentro", status: "published", syllabus: null, target_audience: null,
    title: "Encuentro empresarial", type: "event", updated_at: "2026-09-01T00:00:00Z",
    updated_by: null, venue_id: null, category: null, contact: null, speakers: [],
    venue: { id: "venue", name: "Auditorio", address: "Calle Principal 100", maps_embed_url: "", reference: null },
    dates: [{ id: "date", activity_id: "activity", created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z", deleted_at: null, deleted_by: null,
      starts_at: "2026-11-01T20:00:00Z", ends_at: "2026-11-01T22:00:00Z", label: null, sort_order: 0 }],
    ...overrides,
  };
}
