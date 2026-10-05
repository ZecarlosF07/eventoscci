import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { BANNER_DIMENSIONS_HINT } from "@/components/molecules/BannerImage/constants/banner-design.constants";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityContentFieldsProps } from "@/features/activities/components/ActivityContentFields/types/activity-content-fields.types";
import { ActivityProgramImageFields } from "@/features/activities/components/ActivityProgramImageFields";

export function ActivityContentFields({ activity, bannerError, programError, showProgramText = false }: ActivityContentFieldsProps) {
  return (
    <>
      <FormField error={bannerError} hint={`Opcional. Puedes agregarlo después. ${BANNER_DIMENSIONS_HINT}. JPG, PNG o WebP, máximo 5 MB.`} label="Banner" name="banner">
        <Input accept="image/jpeg,image/png,image/webp" id="banner" name="banner" type="file" />
      </FormField>
      <input name="banner_path" type="hidden" value={activity?.banner_path ?? ""} />
      {showProgramText ? <FormField hint="Describe las sesiones, temas y horarios. Este texto complementa las imágenes y se mostrará en la ficha del evento." label="Programa en texto" name="program"><Textarea defaultValue={activity?.program ?? ""} id="program" name="program" rows={5} /></FormField> : <input name="program" type="hidden" value={activity?.program ?? ""} />}
      <input name="syllabus" type="hidden" value={activity?.syllabus ?? ""} />
      <ActivityProgramImageFields error={programError} initialPaths={activity?.program_image_paths ?? []} />
    </>
  );
}
