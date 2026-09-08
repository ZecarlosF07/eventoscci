import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityContentFieldsProps } from "@/features/activities/components/ActivityContentFields/types/activity-content-fields.types";
import { ActivityProgramImageFields } from "@/features/activities/components/ActivityProgramImageFields";

export function ActivityContentFields({ activity, bannerError, programError }: ActivityContentFieldsProps) {
  return (
    <>
      <FormField error={bannerError} hint="Usa proporción horizontal 5:2 (por ejemplo, 2500 × 1000 px). JPG, PNG o WebP; máximo 5 MB." label="Banner" name="banner">
        <Input accept="image/jpeg,image/png,image/webp" id="banner" name="banner" type="file" />
      </FormField>
      <input name="banner_path" type="hidden" value={activity?.banner_path ?? ""} />
      <input name="program" type="hidden" value={activity?.program ?? ""} />
      <input name="syllabus" type="hidden" value={activity?.syllabus ?? ""} />
      <ActivityProgramImageFields error={programError} initialPaths={activity?.program_image_paths ?? []} />
    </>
  );
}
