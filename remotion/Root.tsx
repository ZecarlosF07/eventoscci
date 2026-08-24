import { Composition, Folder } from "remotion";

import { CampusCciVideo } from "./CampusCciVideo";
import { CatalogScene } from "./scenes/CatalogScene";
import { CertificateScene } from "./scenes/CertificateScene";
import { IntroScene } from "./scenes/IntroScene";
import { PlayerScene } from "./scenes/PlayerScene";
import { ProgressScene } from "./scenes/ProgressScene";

export function RemotionRoot() {
  return (
    <>
      <Folder name="Escenas-Campus-CCI">
        <Composition component={IntroScene} durationInFrames={75} fps={30} height={1080} id="CCI-01-Identidad" width={1920} />
        <Composition component={CatalogScene} durationInFrames={100} fps={30} height={1080} id="CCI-02-Catalogo" width={1920} />
        <Composition component={PlayerScene} durationInFrames={110} fps={30} height={1080} id="CCI-03-Reproductor" width={1920} />
        <Composition component={ProgressScene} durationInFrames={100} fps={30} height={1080} id="CCI-04-Progreso" width={1920} />
        <Composition component={CertificateScene} durationInFrames={95} fps={30} height={1080} id="CCI-05-Certificado" width={1920} />
      </Folder>
      <Composition component={CampusCciVideo} durationInFrames={420} fps={30} height={1080} id="CampusCci" width={1920} />
    </>
  );
}
