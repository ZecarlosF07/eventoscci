import type { CatalogCarouselControlsProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-carousel-controls.types";

const CONTROL_CLASS = "flex size-10 items-center justify-center rounded-full border border-white/25 bg-cci-950/75 text-lg text-white shadow-lg backdrop-blur-md transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:size-11";

export function CatalogCarouselControls({
  currentIndex,
  isAutoPlaying,
  itemCount,
  onNext,
  onPause,
  onPlay,
  onPrevious,
  onSelect,
}: CatalogCarouselControlsProps) {
  if (itemCount < 2) return null;

  return (
    <div className="absolute right-4 top-[11.5rem] z-30 flex items-center gap-2 sm:right-6 sm:top-[18rem] lg:bottom-7 lg:right-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:top-auto">
      <span className="mr-1 rounded-full border border-white/20 bg-cci-950/75 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md sm:hidden">
        {currentIndex + 1}/{itemCount}
      </span>
      <div className="mr-1 hidden items-center gap-1.5 sm:flex">
        {Array.from({ length: itemCount }, (_, index) => (
          <button
            aria-label={`Mostrar elemento ${index + 1} de ${itemCount}`}
            aria-pressed={currentIndex === index}
            className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? "w-8 bg-cci-lime" : "w-2 bg-white/40 hover:bg-white/80"}`}
            key={index}
            onClick={() => onSelect(index)}
            type="button"
          />
        ))}
      </div>
      <button aria-label="Mostrar anterior" className={CONTROL_CLASS} onClick={onPrevious} type="button"><span aria-hidden="true">‹</span></button>
      <button aria-label={isAutoPlaying ? "Pausar carrusel" : "Reanudar carrusel"} className={CONTROL_CLASS} onClick={isAutoPlaying ? onPause : onPlay} type="button"><span aria-hidden="true">{isAutoPlaying ? "Ⅱ" : "▶"}</span></button>
      <button aria-label="Mostrar siguiente" className={CONTROL_CLASS} onClick={onNext} type="button"><span aria-hidden="true">›</span></button>
    </div>
  );
}
