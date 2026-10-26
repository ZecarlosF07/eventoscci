import { z } from "zod";

import { PRIVACY_ERRORS, PRIVACY_VERSION } from "@/features/privacy/constants/privacy.constants";

// Business schemas remain compatible with legacy clients during staged rollout.
export const privacyTransportShape = {
  privacy_accepted: z.boolean().optional(),
  privacy_version: z.string().optional(),
  marketing_accepted: z.boolean().optional(),
};

// New public forms always require explicit acceptance, independently of rollout.
export const privacyInputSchema = z.object({
  privacy_accepted: z.literal(true, { error: PRIVACY_ERRORS.PRIVACY_CONSENT_REQUIRED }),
  privacy_version: z.literal(PRIVACY_VERSION, { error: PRIVACY_ERRORS.PRIVACY_POLICY_CHANGED }),
  marketing_accepted: z.boolean().default(false),
});
