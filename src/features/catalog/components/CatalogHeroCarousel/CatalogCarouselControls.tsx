import type { CatalogCarouselControlsProps } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-carousel-controls.types";

const CONTROL_CLASS = "flex size-11 items-center justify-center rounded-full border border-white/20 text-lg text-white transition hover:border-cci-lime hover:bg-cci-lime hover:text-cci-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime motion-reduce:transition-none";

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
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <div className="flex items-center gap-3">
        <p className="text-xs tabular-nums text-cci-200"><span className="font-bold text-white">{String(currentIndex + 1).padStart(2, "0")}</span> / {String(itemCount).padStart(2, "0")}</p>
        <div className="flex items-center">
          {Array.from({ length: itemCount }, (_, index) => (
            <button
              aria-label={`Mostrar destacado ${index + 1} de ${itemCount}`}
              aria-pressed={currentIndex === index}
              className="group flex size-8 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-lime sm:size-11"
              key={index}
              onClick={() => { onPause(); onSelect(index); }}
              type="button"
            >
              <span className={`h-1 rounded-full transition-all motion-reduce:transition-none ${currentIndex === index ? "w-7 bg-cci-lime" : "w-2 bg-white/35 group-hover:bg-white"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button aria-label="Mostrar anterior" className={CONTROL_CLASS} onClick={() => { onPause(); onPrevious(); }} type="button"><span aria-hidden="true">‹</span></button>
        <button aria-label={isAutoPlaying ? "Pausar carrusel" : "Reanudar carrusel"} className={CONTROL_CLASS} onClick={isAutoPlaying ? onPause : onPlay} type="button"><span aria-hidden="true">{isAutoPlaying ? "Ⅱ" : "▶"}</span></button>
        <button aria-label="Mostrar siguiente" className={CONTROL_CLASS} onClick={() => { onPause(); onNext(); }} type="button"><span aria-hidden="true">›</span></button>
      </div>
    </div>
  );
}
