import type {
  ActivityDateInput,
  ActivityFormInput,
  ActivitySpeakerInput,
} from "@/features/activities/types/activity-form.types";

function stringValue(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function parseDates(formData: FormData): ActivityDateInput[] {
  const starts = formData.getAll("date_starts_at").map(String);
  const ends = formData.getAll("date_ends_at").map(String);
  const labels = formData.getAll("date_label").map(String);
  const sortOrders = formData.getAll("date_sort_order").map(Number);

  return starts
    .map((startsAt, index) => ({
      ends_at: ends[index] ?? "",
      label: labels[index] ?? "",
      sort_order: sortOrders[index] ?? index,
      starts_at: startsAt,
    }))
    .filter((date) => date.starts_at.trim());
}

function parseSpeakers(formData: FormData): ActivitySpeakerInput[] {
  return formData.getAll("speaker_id").map(String).map((speakerId, index) => ({
    role_label: stringValue(formData, `speaker_role_${speakerId}`),
    sort_order: Number(stringValue(formData, `speaker_order_${speakerId}`)) || index,
    speaker_id: speakerId,
  }));
}

export function parseActivityFormData(formData: FormData): ActivityFormInput {
  return {
    academic_hours: stringValue(formData, "academic_hours"),
    additional_info: stringValue(formData, "additional_info"),
    address: stringValue(formData, "address"),
    banner_path: stringValue(formData, "banner_path"),
    capacity: stringValue(formData, "capacity"),
    category_id: stringValue(formData, "category_id"),
    contact_email: stringValue(formData, "contact_email"),
    contact_name: stringValue(formData, "contact_name"),
    contact_phone: stringValue(formData, "contact_phone"),
    dates: parseDates(formData),
    description: stringValue(formData, "description"),
    duration_text: stringValue(formData, "duration_text"),
    general_price: stringValue(formData, "general_price"),
    id: stringValue(formData, "id"),
    is_free: formData.get("is_free") === "on",
    location_name: stringValue(formData, "location_name"),
    member_price: stringValue(formData, "member_price"),
    members_only: formData.get("members_only") === "on",
    modality: stringValue(formData, "modality") as ActivityFormInput["modality"],
    objective: stringValue(formData, "objective"),
    program: stringValue(formData, "program"),
    registration_close_at: stringValue(formData, "registration_close_at"),
    registration_open_at: stringValue(formData, "registration_open_at"),
    registrations_closed_manually:
      formData.get("registrations_closed_manually") === "on",
    short_description: stringValue(formData, "short_description"),
    slug: stringValue(formData, "slug"),
    speakers: parseSpeakers(formData),
    status: stringValue(formData, "status") as ActivityFormInput["status"],
    syllabus: stringValue(formData, "syllabus"),
    target_audience: stringValue(formData, "target_audience"),
    title: stringValue(formData, "title"),
    type: stringValue(formData, "type") as ActivityFormInput["type"],
    virtual_url: stringValue(formData, "virtual_url"),
  };
}
