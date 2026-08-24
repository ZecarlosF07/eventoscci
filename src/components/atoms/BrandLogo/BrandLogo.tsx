import Image from "next/image";

import type { BrandLogoProps } from "@/components/atoms/BrandLogo/types/brand-logo.types";
import { classNames } from "@/utils/class-names";

export function BrandLogo({
  className,
  light = false,
  preload = false,
}: BrandLogoProps) {
  return (
    <Image
      alt="Cámara de Comercio de Ica"
      className={classNames("h-auto w-44", className)}
      height={72}
      preload={preload}
      src={
        light
          ? "/assets/brand/cci-logo-white.webp"
          : "/assets/brand/cci-logo.webp"
      }
      width={200}
    />
  );
}
