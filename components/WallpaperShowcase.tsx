"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type WallpaperShowcaseProps = {
  images: string[];
  storageKey?: string;
  introIntervalMs?: number;
  ambientIntervalMs?: number;
  introOncePerSession?: boolean;
};

function getNextIndex(currentIndex: number, total: number) {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

export default function WallpaperShowcase({
  images,
  storageKey = "marco.wallpaperIndex.v1",
  introIntervalMs = 10_000,
  ambientIntervalMs = 180_000,
  introOncePerSession = true,
}: WallpaperShowcaseProps) {
  const imagesNormalized = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useRef(false);
  const phaseRef = useRef<"intro" | "ambient">("intro");
  const timersRef = useRef<{ intro?: number; ambient?: number }>({});

  useEffect(() => {
    if (typeof window.matchMedia === "function") {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  useEffect(() => {
    if (imagesNormalized.length === 0) return;

    let nextIndex = 0;
    try {
      const last = Number.parseInt(window.localStorage.getItem(storageKey) ?? "", 10);
      if (Number.isFinite(last)) {
        nextIndex = ((last % imagesNormalized.length) + imagesNormalized.length) % imagesNormalized.length;
      }
    } catch {
      // ignore localStorage issues (private mode, etc.)
    }

    setActiveIndex(nextIndex);
  }, [imagesNormalized, storageKey]);

  useEffect(() => {
    imagesNormalized.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    });
  }, [imagesNormalized]);

  useEffect(() => {
    const src = imagesNormalized[activeIndex];
    if (!src) return;

    try {
      window.localStorage.setItem(storageKey, String(activeIndex));
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent("marco:wallpaper-changed", { detail: { index: activeIndex, url: src } }));
  }, [activeIndex, imagesNormalized, storageKey]);

  const shuffle = () => {
    setActiveIndex((prev) => {
      const next = getNextIndex(prev, imagesNormalized.length);
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ background?: string; url?: string; index?: number }>;
      const nextIndex = customEvent.detail?.index;
      const nextUrl = customEvent.detail?.url ?? customEvent.detail?.background;

      if (typeof nextIndex === "number" && Number.isFinite(nextIndex)) {
        setActiveIndex(((nextIndex % imagesNormalized.length) + imagesNormalized.length) % imagesNormalized.length);
        return;
      }

      if (nextUrl) {
        const normalized = nextUrl.startsWith("/assets/") ? nextUrl : `/assets/${nextUrl.replace(/^\/+/, "")}`;
        const foundIndex = imagesNormalized.findIndex((img) => img === normalized);
        if (foundIndex >= 0) {
          setActiveIndex(foundIndex);
          return;
        }
      }

      shuffle();
    };

    window.addEventListener("marco:shuffle-wallpaper", handler as EventListener);
    return () => window.removeEventListener("marco:shuffle-wallpaper", handler as EventListener);
  }, [imagesNormalized]);

  const clearTimers = () => {
    if (timersRef.current.intro) window.clearInterval(timersRef.current.intro);
    if (timersRef.current.ambient) window.clearInterval(timersRef.current.ambient);
    timersRef.current = {};
  };

  const startAmbient = () => {
    phaseRef.current = "ambient";
    if (prefersReducedMotion.current) return;
    if (imagesNormalized.length <= 1) return;
    if (ambientIntervalMs <= 0) return;

    timersRef.current.ambient = window.setInterval(() => {
      setActiveIndex((prev) => getNextIndex(prev, imagesNormalized.length));
    }, ambientIntervalMs);
  };

  useEffect(() => {
    if (imagesNormalized.length === 0) return;

    clearTimers();

    if (prefersReducedMotion.current) return;

    const sessionKey = "marco.wallpaperIntro.v1";
    const introAlreadyShown = (() => {
      if (!introOncePerSession) return false;
      try {
        return window.sessionStorage.getItem(sessionKey) === "1";
      } catch {
        return false;
      }
    })();

    if (imagesNormalized.length <= 1 || introAlreadyShown || introIntervalMs <= 0) {
      startAmbient();
      return;
    }

    try {
      window.sessionStorage.setItem(sessionKey, "1");
    } catch {
      // ignore
    }

    phaseRef.current = "intro";
    let steps = 0;
    timersRef.current.intro = window.setInterval(() => {
      steps += 1;
      setActiveIndex((prev) => getNextIndex(prev, imagesNormalized.length));
      if (steps >= imagesNormalized.length - 1) {
        clearTimers();
        startAmbient();
      }
    }, introIntervalMs);

    return clearTimers;
  }, [ambientIntervalMs, imagesNormalized, introIntervalMs, introOncePerSession]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearTimers();
        return;
      }

      if (phaseRef.current === "intro") return;
      clearTimers();
      startAmbient();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [ambientIntervalMs, imagesNormalized.length]);

  if (imagesNormalized.length === 0) return null;

  return (
    <div className="marco-wallpaper" aria-hidden="true">
      <div className="marco-wallpaper-stack">
        {imagesNormalized.map((src, index) => (
          <div
            key={src}
            className={`marco-wallpaper-layer${index === activeIndex ? " is-active" : ""}`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
        <div className="marco-wallpaper-vignette" />
        <div className="marco-wallpaper-noise" />
      </div>
    </div>
  );
}
