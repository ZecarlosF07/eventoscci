import type { PlaybackTrackerProps } from "@/features/progress/types/progress.types";

export interface YouTubeLessonVideoProps extends PlaybackTrackerProps {
  videoId: string;
}

export interface YouTubePlayerInstance {
  destroy: () => void;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

export interface YouTubePlayerEvent {
  target: YouTubePlayerInstance;
}

export interface YouTubePlayerStateEvent extends YouTubePlayerEvent {
  data: number;
}

export interface YouTubePlayerOptions {
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubePlayerStateEvent) => void;
  };
  height: string;
  host: string;
  playerVars: Record<string, number>;
  videoId: string;
  width: string;
}

export interface YouTubeApi {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayerInstance;
  PlayerState: { ENDED: number; PAUSED: number; PLAYING: number };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

