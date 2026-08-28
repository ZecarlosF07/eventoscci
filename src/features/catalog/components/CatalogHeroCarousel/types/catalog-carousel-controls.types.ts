export interface CatalogCarouselControlsProps {
  currentIndex: number;
  isAutoPlaying: boolean;
  itemCount: number;
  onNext: () => void;
  onPause: () => void;
  onPlay: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
}
