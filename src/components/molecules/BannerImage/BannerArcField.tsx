import {
  BANNER_ARC_CENTER,
  BANNER_ARC_RADII,
} from "@/components/molecules/BannerImage/constants/banner-arcs.constants";
import type { BannerArcFieldProps } from "@/components/molecules/BannerImage/types/banner-arc-field.types";

export function BannerArcField({ illuminated = false, mirrored = false }: BannerArcFieldProps) {
  const positionClassName = mirrored ? "right-0 translate-x-[88%]" : "left-0 -translate-x-[88%]";
  const reflectionClassName = mirrored ? "-scale-x-100" : "";
  const colorClassName = illuminated ? "text-cci-lime" : "text-cci-lime/30";

  return (
    <div className={`absolute top-1/2 h-[180%] aspect-square -translate-y-1/2 ${positionClassName}`}>
      <svg className={`size-full overflow-visible ${reflectionClassName}`} fill="none" focusable="false" viewBox="0 0 1000 1000">
        <g className={colorClassName} stroke="currentColor" strokeWidth={illuminated ? 1.5 : 1}>
          {BANNER_ARC_RADII.map((radius) => (
            <circle cx={BANNER_ARC_CENTER} cy={BANNER_ARC_CENTER} key={radius} r={radius} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </div>
  );
}
