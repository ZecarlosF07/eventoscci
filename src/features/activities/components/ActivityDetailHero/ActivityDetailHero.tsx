import Image from "next/image";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityDetailHeroProps } from "@/features/activities/components/ActivityDetailHero/types/activity-detail-hero.types";
import { ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import {
  getActivityBannerUrl,
  getModalityLabel,
} from "@/features/activities/utils/activity-formatters";

function InstitutionalArtwork() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-cci-800">
      <span className="absolute -right-20 -top-24 size-72 rounded-full border border-cci-lime/55" />
      <span className="absolute -right-8 -top-16 size-56 rounded-full border border-cci-lime/30" />
      <span className="absolute -bottom-32 -left-24 size-80 rounded-full border border-cci-sage/25" />
      <span className="absolute bottom-8 right-8 text-6xl font-bold tracking-tighter text-white/10 sm:text-8xl">CCI</span>
    </div>
  );
}

export function ActivityDetailHero({ activity }: ActivityDetailHeroProps) {
  const bannerUrl = getActivityBannerUrl(activity.banner_path);
  return (
    <header className="mt-5 overflow-hidden rounded-3xl bg-cci-950 text-white shadow-xl shadow-cci-950/15 sm:mt-6 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <div className="relative aspect-[16/10] min-h-60 lg:order-2 lg:aspect-auto lg:min-h-[25rem]">
        {bannerUrl ? (
          <Image alt={`Banner de ${activity.title}`} className="object-cover" fill preload sizes="(min-width: 1024px) 54vw, 100vw" src={bannerUrl} />
        ) : <InstitutionalArtwork />}
        <div className="absolute inset-0 bg-gradient-to-t from-cci-950/35 to-transparent lg:bg-gradient-to-r" />
      </div>
      <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-cci-lime text-cci-950 ring-0">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
          <Badge className="bg-white/10 text-white ring-white/15">{getModalityLabel(activity.modality)}</Badge>
          {activity.category ? <Badge className="bg-white/10 text-white ring-white/15">{activity.category.name}</Badge> : null}
        </div>
        <Heading className="mt-5 text-white" level={1}>{activity.title}</Heading>
        {activity.short_description ? <Text className="mt-4 max-w-2xl text-white/70" size="lg">{activity.short_description}</Text> : null}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/70">
          {activity.duration_text ? <span>Duración: {activity.duration_text}</span> : null}
          {activity.academic_hours !== null ? <span>{activity.academic_hours} horas académicas</span> : null}
          {activity.members_only ? <span className="text-cci-lime">Exclusiva para asociados</span> : null}
        </div>
      </div>
    </header>
  );
}
