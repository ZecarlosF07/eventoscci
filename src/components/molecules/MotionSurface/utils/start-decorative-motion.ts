import { BANNER_PAUSE_CONTROL_ID, MOTION_PREFERENCE } from "@/components/molecules/MotionSurface/constants/decorative-motion.constants";
import type { DecorativeMotion } from "@/components/molecules/MotionSurface/types/motion-surface.types";

/** Native animations keep decorative motion independent of component CSS. */
export function startDecorativeMotion(root: HTMLElement, motions: DecorativeMotion[], allowBannerPause: boolean) {
  const document = root.ownerDocument;
  const preference = document.defaultView?.matchMedia(MOTION_PREFERENCE);
  if (!preference) return () => {};
  let animations: Animation[] = [];

  function syncMotion() {
    if (preference?.matches) {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      root.dataset.motionState = "reduced";
      return;
    }
    if (!animations.length) {
      animations = motions.flatMap(({ selector, keyframes, options }) => {
        const target = selector ? root.querySelector<HTMLElement>(selector) : root;
        return target ? [target.animate(keyframes, options)] : [];
      });
    }
    const paused = allowBannerPause && document.querySelector<HTMLInputElement>(`#${BANNER_PAUSE_CONTROL_ID}`)?.checked;
    animations.forEach((animation) => paused ? animation.pause() : animation.play());
    root.dataset.motionState = paused ? "paused" : "running";
  }

  function handlePauseChange(event: Event) {
    if (event.target === document.getElementById(BANNER_PAUSE_CONTROL_ID)) syncMotion();
  }

  syncMotion();
  preference.addEventListener("change", syncMotion);
  if (allowBannerPause) document.addEventListener("change", handlePauseChange);

  return () => {
    preference.removeEventListener("change", syncMotion);
    if (allowBannerPause) document.removeEventListener("change", handlePauseChange);
    animations.forEach((animation) => animation.cancel());
    root.dataset.motionState = "static";
  };
}
