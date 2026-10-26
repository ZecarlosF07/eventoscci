import policy from "@/features/privacy/constants/privacy-policy.json";

export const PRIVACY_POLICY = policy;
export const PRIVACY_VERSION = policy.version;
export const PRIVACY_ROUTE = "/privacidad";
export const PRIVACY_CONTACT = policy.contact;
export const PRIVACY_ERRORS = {
  PRIVACY_CONSENT_REQUIRED: "Debes aceptar el tratamiento de datos personales para continuar.",
  PRIVACY_POLICY_CHANGED: "La Política de privacidad cambió. Actualiza la página para revisarla y aceptar la versión vigente.",
};
