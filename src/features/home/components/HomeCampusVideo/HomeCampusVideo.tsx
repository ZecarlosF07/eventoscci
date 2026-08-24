import Image from "next/image";

export function HomeCampusVideo() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-cci-950 shadow-2xl shadow-cci-950/20">
      <video
        aria-label="Presentación del Campus Virtual CCI"
        autoPlay
        className="size-full object-cover motion-reduce:hidden"
        loop
        muted
        playsInline
        poster="/assets/videos/campus-cci-poster.png"
        preload="metadata"
      >
        <source src="/assets/videos/campus-cci.mp4" type="video/mp4" />
      </video>
      <Image
        alt="Vista previa del Campus Virtual CCI"
        className="hidden object-cover motion-reduce:block"
        fill
        sizes="(min-width: 1280px) 1152px, calc(100vw - 4rem)"
        src="/assets/videos/campus-cci-poster.png"
      />
    </div>
  );
}
