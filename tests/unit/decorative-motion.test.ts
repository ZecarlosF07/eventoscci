import assert from "node:assert/strict";
import test from "node:test";

import { BANNER_MOTIONS } from "@/components/molecules/MotionSurface/constants/decorative-motion.constants";
import { startDecorativeMotion } from "@/components/molecules/MotionSurface/utils/start-decorative-motion";

function motionFixture(reduced = false, paused = false) {
  const preference = Object.assign(new EventTarget(), { matches: reduced });
  const checkbox = Object.assign(new EventTarget(), { checked: paused });
  const animations: { state: string; currentTime: number; pause(): void; play(): void; cancel(): void }[] = [];
  const target = {
    animate() {
      const animation = {
        state: "running", currentTime: 123,
        pause() { this.state = "paused"; },
        play() { this.state = "running"; },
        cancel() { this.state = "cancelled"; },
      };
      animations.push(animation);
      return animation;
    },
  };
  const document = Object.assign(new EventTarget(), {
    defaultView: { matchMedia: () => preference },
    querySelector: () => checkbox,
    getElementById: () => checkbox,
  });
  checkbox.addEventListener("change", () => {
    const event = new Event("change");
    Object.defineProperty(event, "target", { value: checkbox });
    document.dispatchEvent(event);
  });
  const root = { ...target, ownerDocument: document, dataset: { motionState: "static" }, querySelector: () => target };
  // The fixture implements only the DOM operations used by the controller.
  const dispose = startDecorativeMotion(root as unknown as HTMLElement, BANNER_MOTIONS, true);
  return { root, preference, checkbox, animations, dispose };
}

test("pausar y reanudar conserva el progreso de las cuatro luces", () => {
  const { animations, checkbox, dispose, root } = motionFixture();
  assert.equal(animations.length, 4);
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(root.dataset.motionState, "paused");
  assert.ok(animations.every((animation) => animation.state === "paused" && animation.currentTime === 123));
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(root.dataset.motionState, "running");
  assert.equal(animations.length, 4);
  dispose();
  assert.ok(animations.every((animation) => animation.state === "cancelled"));
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(root.dataset.motionState, "static");
});

test("movimiento reducido evita animaciones y responde a cambios de preferencia", () => {
  const { animations, preference, checkbox, dispose, root } = motionFixture(true, true);
  assert.equal(animations.length, 0);
  assert.equal(root.dataset.motionState, "reduced");
  preference.matches = false;
  preference.dispatchEvent(new Event("change"));
  assert.equal(animations.length, 4);
  assert.equal(root.dataset.motionState, "paused");
  preference.matches = true;
  preference.dispatchEvent(new Event("change"));
  assert.ok(animations.every((animation) => animation.state === "cancelled"));
  assert.equal(root.dataset.motionState, "reduced");
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(animations.length, 4);
  dispose();
  preference.matches = false;
  preference.dispatchEvent(new Event("change"));
  assert.equal(animations.length, 4);
});
