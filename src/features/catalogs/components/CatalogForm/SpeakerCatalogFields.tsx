import Image from "next/image";

import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FIELD_LIMITS } from "@/constants/field-limits";
import type { SpeakerCatalogFieldsProps } from "@/features/catalogs/components/CatalogForm/types/catalog-form.types";
import { getSpeakerImageUrl } from "@/features/speakers/utils/speaker-image";

export function SpeakerCatalogFields({ activeControl, contactFirst = false, errors, speaker }: SpeakerCatalogFieldsProps) {
  const error = (name: string) => errors?.[name]?.[0];
  const photoUrl = getSpeakerImageUrl(speaker?.photo_path ?? null);
  const contactFields = <>
    <FormField error={error("email")} hint={contactFirst ? "Necesario para emitir y enviar el certificado." : undefined} label="Correo interno" name="email"><Input defaultValue={speaker?.private_details?.email ?? ""} id="email" name="email" type="email" /></FormField>
    <FormField error={error("phone")} label="Teléfono interno" name="phone"><Input defaultValue={speaker?.private_details?.phone ?? ""} id="phone" maxLength={FIELD_LIMITS.phone} name="phone" type="tel" /></FormField>
  </>;
  return <div className="grid gap-5 md:grid-cols-2">
    <FormField error={error("first_names")} label="Nombres" name="first_names" required><Input defaultValue={speaker?.first_names} id="first_names" maxLength={FIELD_LIMITS.personName} name="first_names" required /></FormField>
    <FormField error={error("last_names")} label="Apellidos" name="last_names" required><Input defaultValue={speaker?.last_names} id="last_names" maxLength={FIELD_LIMITS.personName} name="last_names" required /></FormField>
    {contactFirst ? contactFields : null}
    <FormField error={error("professional_title")} label="Cargo o título profesional" name="professional_title"><Input defaultValue={speaker?.professional_title ?? ""} id="professional_title" name="professional_title" /></FormField>
    <FormField error={error("organization")} label="Organización" name="organization"><Input defaultValue={speaker?.organization ?? ""} id="organization" name="organization" /></FormField>
    <div className="md:col-span-2"><FormField error={error("specialties")} hint="Separadas por comas." label="Especialidades" name="specialties"><Input defaultValue={speaker?.specialties.join(", ")} id="specialties" name="specialties" /></FormField></div>
    <FormField error={error("linkedin_url")} label="LinkedIn público" name="linkedin_url"><Input defaultValue={speaker?.linkedin_url ?? ""} id="linkedin_url" name="linkedin_url" type="url" /></FormField>
    <FormField error={error("website_url")} label="Sitio web público" name="website_url"><Input defaultValue={speaker?.website_url ?? ""} id="website_url" name="website_url" type="url" /></FormField>
    <div className="md:col-span-2"><FormField error={error("bio")} label="Biografía pública" name="bio"><Textarea defaultValue={speaker?.bio ?? ""} id="bio" name="bio" /></FormField></div>
    {!contactFirst ? contactFields : null}
    <div className="md:col-span-2"><FormField error={error("notes")} label="Notas internas" name="notes"><Textarea defaultValue={speaker?.private_details?.notes ?? ""} id="notes" name="notes" /></FormField></div>
    <FormField error={error("photo")} hint="JPG, PNG o WebP. Máximo 5 MB." label="Fotografía" name="photo"><Input accept="image/jpeg,image/png,image/webp" id="photo" name="photo" type="file" /></FormField>
    {photoUrl ? <Image alt={`Fotografía de ${speaker?.first_names ?? "ponente"}`} className="size-24 rounded-2xl object-cover" height={96} src={photoUrl} width={96} /> : null}
    {activeControl}
  </div>;
}
