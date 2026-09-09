export function HomeCampusVideo() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-cci-950 shadow-2xl shadow-cci-950/20">
      <video
        aria-label="Presentación del Campus Virtual CCI"
        className="size-full object-cover"
        controls
        playsInline
        poster="/assets/videos/campus-cci-poster.webp"
        preload="none"
      >
        <source src="/assets/videos/campus-cci.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
