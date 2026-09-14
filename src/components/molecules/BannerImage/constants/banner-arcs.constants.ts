export const BANNER_ARC_CENTER = 500;
export const BANNER_ARC_COUNT = 40;
export const BANNER_ARC_GAP = 6;
export const BANNER_ARC_OUTER_RADIUS = 490;
export const BANNER_ARC_RADII = Array.from(
  { length: BANNER_ARC_COUNT },
  (_, index) => BANNER_ARC_OUTER_RADIUS - index * BANNER_ARC_GAP,
);
