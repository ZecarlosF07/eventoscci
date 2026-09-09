"use client";

import { useEffect, useRef } from "react";

export function HomeCampusVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.45 });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-cci-950 shadow-2xl shadow-cci-950/20">
      <video
        aria-label="Presentación del Campus Virtual CCI"
        className="size-full object-cover"
        loop
        muted
        playsInline
        poster="/assets/videos/campus-cci-poster.webp"
        preload="none"
        ref={videoRef}
      >
        <source src="/assets/videos/campus-cci.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
