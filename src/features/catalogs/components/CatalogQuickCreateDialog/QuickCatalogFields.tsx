import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import type { QuickCatalogFieldsProps } from "@/features/catalogs/components/CatalogQuickCreateDialog/types/catalog-quick-create-dialog.types";

export function QuickCatalogFields({ errors, kind }: QuickCatalogFieldsProps) {
  const error = (name: string) => errors?.[name]?.[0];

  if (kind === "venues") return (
    <div className="grid gap-4">
      <FormField error={error("name")} label="Nombre del lugar" name="name" required><Input id="quick-name" name="name" required /></FormField>
      <FormField error={error("address")} label="Dirección" name="address" required><Input id="quick-address" name="address" required /></FormField>
      <FormField error={error("maps_embed_url")} hint="Copia el atributo src de Google Maps." label="URL de inserción" name="maps_embed_url" required><Input id="quick-map" name="maps_embed_url" required type="url" /></FormField>
      <FormField label="Referencia" name="reference"><Input id="quick-reference" name="reference" /></FormField>
    </div>
  );

  if (kind === "contacts") return (
    <div className="grid gap-4">
      <FormField error={error("label")} label="Nombre identificador" name="label" required><Input id="quick-label" name="label" placeholder="Eventos CCI" required /></FormField>
      <FormField error={error("contact_name")} label="Responsable" name="contact_name" required><Input id="quick-contact-name" name="contact_name" required /></FormField>
      <FormField error={error("whatsapp_phone")} label="WhatsApp" name="whatsapp_phone" required><Input id="quick-whatsapp" name="whatsapp_phone" required type="tel" /></FormField>
      <FormField error={error("email")} label="Correo" name="email"><Input id="quick-email" name="email" type="email" /></FormField>
    </div>
  );

  if (kind === "categories") return (
    <div className="grid gap-4">
      <FormField error={error("name")} label="Nombre" name="name" required><Input id="quick-category-name" name="name" required /></FormField>
      <FormField label="Descripción" name="description"><Textarea id="quick-category-description" name="description" /></FormField>
      <input name="sort_order" type="hidden" value="0" />
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField error={error("first_names")} label="Nombres" name="first_names" required><Input id="quick-first-names" name="first_names" required /></FormField>
      <FormField error={error("last_names")} label="Apellidos" name="last_names" required><Input id="quick-last-names" name="last_names" required /></FormField>
      <FormField label="Cargo o título" name="professional_title"><Input id="quick-title" name="professional_title" /></FormField>
      <FormField label="Organización" name="organization"><Input id="quick-organization" name="organization" /></FormField>
      <FormField label="Especialidades" hint="Separadas por comas." name="specialties"><Input id="quick-specialties" name="specialties" /></FormField>
      <FormField label="Fotografía" name="photo"><Input accept="image/jpeg,image/png,image/webp" id="quick-photo" name="photo" type="file" /></FormField>
      <div className="sm:col-span-2"><FormField label="Biografía" name="bio"><Textarea id="quick-bio" name="bio" /></FormField></div>
    </div>
  );
}
