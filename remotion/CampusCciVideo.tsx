import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { CatalogScene } from "./scenes/CatalogScene";
import { CertificateScene } from "./scenes/CertificateScene";
import { IntroScene } from "./scenes/IntroScene";
import { PlayerScene } from "./scenes/PlayerScene";
import { ProgressScene } from "./scenes/ProgressScene";

export function CampusCciVideo() {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={75} name="Identidad CCI"><IntroScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={100} name="Catálogo"><CatalogScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={110} name="Reproductor"><PlayerScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={100} name="Progreso"><ProgressScene /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={95} name="Certificado"><CertificateScene /></TransitionSeries.Sequence>
    </TransitionSeries>
  );
}
