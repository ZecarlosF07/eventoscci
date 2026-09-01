import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityLocationMapProps } from "@/features/activities/components/ActivityLocationMap/types/activity-location-map.types";
import {
  getGoogleMapsDirectionsUrl,
  isGoogleMapsEmbedUrl,
} from "@/features/activities/utils/activity-maps";

export function ActivityLocationMap({ activity }: ActivityLocationMapProps) {
  const venue = activity.venue;
  if (
    activity.modality === "virtual" ||
    !venue ||
    !isGoogleMapsEmbedUrl(venue.maps_embed_url)
  ) return null;

  const directionsUrl = getGoogleMapsDirectionsUrl(venue.name, venue.address);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={2}>Cómo llegar</Heading>
          <Text className="mt-2">{venue.name}</Text>
          <Text size="sm">{venue.address}</Text>
          {venue.reference ? <Text size="sm">Referencia: {venue.reference}</Text> : null}
        </div>
        <a className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 bg-white px-4 py-2 text-sm font-semibold text-cci-950 transition hover:border-cci-500 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-800" href={directionsUrl} rel="noreferrer" target="_blank">Abrir en Google Maps ↗</a>
      </div>
      <div className="mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-cci-100 ring-1 ring-cci-200 sm:aspect-[16/7]">
        <iframe allowFullScreen className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={venue.maps_embed_url} title={`Mapa de ${activity.title}`} />
      </div>
    </section>
  );
}
