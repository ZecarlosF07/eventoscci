"use client";

import { usePathname } from "next/navigation";

import { WhatsAppCommunityButton } from "@/components/atoms/WhatsAppCommunityButton";
import { isEventContactPage } from "@/features/activities/utils/activity-public-contact";

export function PublicCommunityButton() {
  // Event pages render their own button using the activity's server-side policy.
  return isEventContactPage(usePathname()) ? null : <WhatsAppCommunityButton />;
}
