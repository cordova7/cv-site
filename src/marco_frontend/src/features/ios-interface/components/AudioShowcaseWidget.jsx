import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import audioTracks from '../config/audioTracks';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const AudioShowcaseWidget = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coverFailed, setCoverFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState('high');
  const [waveData, setWaveData] = useState(new Uint8Array(32));

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const widgetRef = useRef(null);
  const containerRectRef = useRef(null);
  const dragState = useRef({ active: false, originX: 0, originY: 0, startX: 0, startY: 0 });
  const [widgetPos, setWidgetPos] = useState(() => ({
    x: 60,
    y: 120,
  }));
  const [zIndex, setZIndex] = useState(9995);
  const Z_INDEX_KEY = '__marco_audio_zindex__';

  const currentTrack = audioTracks[currentIndex] || audioTracks[0] || null;

  useEffect(() => {
    setCoverFailed(false);
  }, [currentTrack?.cover]);

  // ── Web Audio API setup ────────────────────────────────────────────────────

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const connectAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 64;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }
    if (!sourceRef.current || sourceRef.current.context !== ctx) {
      try { sourceRef.current?.disconnect(); } catch (_) {}
      sourceRef.current = ctx.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    }
  }, [getAudioCtx]);

  // ── Animation loop: read analyser and update waveData ─────────────────────

  useEffect(() => {
    const tick = () => {
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setWaveData(data);
      }
      if (isPlaying) rafRef.current = requestAnimationFrame(tick);
    };
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      // decay wave gracefully when paused
      setWaveData(prev => {
        const next = new Uint8Array(prev.length);
        for (let i = 0; i < prev.length; i++) next[i] = Math.max(0, prev[i] - 4);
        return next;
      });
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  // ── Drag ─────────────────────────────────────────────────────────────────

  const bringToFront = useCallback(() => {
    const next = (window[Z_INDEX_KEY] || 9995) + 1;
    window[Z_INDEX_KEY] = next;
    setZIndex(next);
  }, []);

  const resolveContainer = useCallback(() => {
    const widgetEl = widgetRef.current;
    const container =
      widgetEl?.offsetParent ||
      widgetEl?.closest('.app') ||
      document.querySelector('.app') ||
      document.body;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    // Use the unscaled (layout) dimensions so drag bounds aren't
    // shrunk by the iPad frame's CSS transform. FloatingWidget uses
    // the same approach via getContainerMetrics.
    const layoutWidth = container.clientWidth || container.offsetWidth || rect.width;
    const layoutHeight = container.clientHeight || container.offsetHeight || rect.height;
    const scaleX = layoutWidth ? rect.width / layoutWidth : 1;
    const scaleY = layoutHeight ? rect.height / layoutHeight : 1;
    containerRectRef.current = { rect, layoutWidth, layoutHeight, scaleX, scaleY };
    return containerRectRef.current;
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current.active = false;
    widgetRef.current?.removeAttribute('data-dragging');
    document.documentElement.removeAttribute('data-widget-dragging');
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!dragState.current.active) return;
    const bounds = containerRectRef.current;
    const widgetEl = widgetRef.current;
    const widgetW = widgetEl?.offsetWidth ?? 360;
    const widgetH = widgetEl?.offsetHeight ?? 260;
    if (!bounds) return;
    const layoutW = bounds.layoutWidth || bounds.width;
    const layoutH = bounds.layoutHeight || bounds.height;
    const scaleX = bounds.scaleX || 1;
    const scaleY = bounds.scaleY || 1;
    const padding = 10;
    // Convert client coords into unscaled (layout) coords
    const localX = (event.clientX - bounds.rect.left) / scaleX;
    const localY = (event.clientY - bounds.rect.top) / scaleY;
    setWidgetPos({
      x: clamp(localX - dragState.current.startX, padding, Math.max(padding, layoutW - widgetW - padding)),
      y: clamp(localY - dragState.current.startY, padding, Math.max(padding, layoutH - widgetH - padding)),
    });
  }, []);

  const handleDragPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    const bounds = resolveContainer();
    if (!bounds) return;
    event.preventDefault();
    event.stopPropagation();
    bringToFront();
    widgetRef.current?.setAttribute('data-dragging', 'true');
    document.documentElement.setAttribute('data-widget-dragging', 'true');
    const scaleX = bounds.scaleX || 1;
    const scaleY = bounds.scaleY || 1;
    dragState.current = {
      active: true,
      originX: widgetPos.x,
      originY: widgetPos.y,
      // startX/startY are in unscaled (layout) coords matching what we write to style
      startX: (event.clientX - bounds.rect.left) / scaleX - widgetPos.x,
      startY: (event.clientY - bounds.rect.top) / scaleY - widgetPos.y,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [widgetPos, handlePointerMove, handlePointerUp, bringToFront, resolveContainer]);

  useEffect(() => {
    const r = resolveContainer();
    if (r) {
      // Position widget in the top-center of the iPad frame container
      const layoutW = r.layoutWidth || r.width;
      const layoutH = r.layoutHeight || r.height;
      setWidgetPos({
        x: (layoutW - 360) / 2,
        y: layoutH * 0.15,
      });
    }
    const onResize = () => resolveContainer();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handlePointerMove, handlePointerUp, resolveContainer]);

  // ── Track navigation ──────────────────────────────────────────────────────

  const nextTrack = () => {
    if (!audioTracks.length) return;
    setCurrentIndex(prev => (prev + 1) % audioTracks.length);
  };

  const prevTrack = () => {
    if (!audioTracks.length) return;
    setCurrentIndex(prev => (prev - 1 + audioTracks.length) % audioTracks.length);
  };

  const onEnded = () => nextTrack();

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      connectAnalyser();
      audio.play?.();
    } else {
      audio.pause?.();
    }
  };

  const trackLabel = useMemo(() => {
    if (!currentTrack) return 'No track selected';
    return `${currentTrack.title}${currentTrack.artist ? ` · ${currentTrack.artist}` : ''}`;
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volumeLevel === 'high' ? 1 : 0.4;
  }, [volumeLevel]);

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const remainingTime = duration > 0 ? Math.max(0, duration - currentTime) : 0;
  const remainingLabel = duration > 0 ? `-${formatTime(remainingTime)}` : '0:00';

  const handleSeek = (event) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  };

  // ── Wave bars ─────────────────────────────────────────────────────────────

  const BAR_COUNT = 32;
  const bars = useMemo(() => {
    const maxH = 40;
    const minH = 3;
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const v = waveData[i] ?? 0;
      const h = v === 0 ? minH : Math.max(minH, (v / 255) * maxH);
      const hue = 140 + (i / BAR_COUNT) * 40;
      const lightness = 50 + (v / 255) * 20;
      return { h, hue, lightness };
    });
  }, [waveData]);

  const widgetStyle = useMemo(() => ({
    position: 'fixed',
    left: `${widgetPos.x}px`,
    top: `${widgetPos.y}px`,
    zIndex,
    cursor: 'default',
    userSelect: 'none',
    width: 'min(360px, calc(100vw - 32px))',
    maxWidth: '360px',
    boxSizing: 'border-box',
  }), [widgetPos, zIndex]);

  const handleWidgetPointerDown = useCallback((event) => {
    // Only start drag if the user didn't click on an interactive element
    if (event.button !== 0) return;
    if (event.target.closest('button, input, [role="button"], audio, .ios-music-progress-bar, .ios-music-control, .ios-music-close-btn')) {
      return;
    }
    handleDragPointerDown(event);
  }, [handleDragPointerDown]);

  return (
    <div
      ref={widgetRef}
      className="ios-token-widget ios-music-widget"
      style={widgetStyle}
      role="group"
      aria-label="Audio showcase"
      onPointerDown={(e) => { bringToFront(); handleWidgetPointerDown(e); }}
    >
      {/* ── Drag handle + close ── */}
      <div
        className="ios-music-drag-row"
        onPointerDown={handleDragPointerDown}
        role="presentation"
      >
        <div className="ios-music-drag-dots" aria-hidden="true">
          <svg viewBox="0 0 40 6" width="40" height="6" fill="none">
            {[4, 14, 24, 34].map(cx => (
              <circle key={cx} cx={cx} cy="3" r="1.5" fill="rgba(255,255,255,0.45)" />
            ))}
          </svg>
        </div>
        <button
          className="ios-music-close-btn"
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={onClose}
          aria-label="Close audio player"
        >
          ×
        </button>
      </div>

      {/* ── Header: cover + meta + waves ── */}
      <div className="ios-music-header">
        <div className="ios-music-cover" aria-hidden="true">
          {!coverFailed && currentTrack?.cover ? (
            <img
              src={currentTrack.cover}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <span>♪</span>
          )}
        </div>
        <div className="ios-music-meta">
          <div className="ios-music-title-row">
            <span className="ios-music-title">{currentTrack?.title || 'No track'}</span>
            <span
              className={`ios-music-dot ios-music-dot-${currentTrack ? (isPlaying ? 'on' : 'off') : 'empty'}`}
              aria-label={currentTrack ? (isPlaying ? 'Playing' : 'Paused') : 'Empty'}
              title={currentTrack ? (isPlaying ? 'Playing' : 'Paused') : 'Empty'}
            />
          </div>
          <span className="ios-music-artist" title={trackLabel}>
            {currentTrack?.artist || 'Add tracks in config/audioTracks.js'}
          </span>
        </div>

        {/* ── Live wave visualiser ── */}
        <div className="ios-music-waves" aria-hidden="true">
          {bars.map((bar, i) => (
            <div
              key={i}
              className="ios-music-wave-bar"
              style={{
                height: `${bar.h}px`,
                background: `hsl(${bar.hue}, 80%, ${bar.lightness}%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="ios-music-progress">
        <div className="ios-music-time">{formatTime(currentTime)}</div>
        <button
          className="ios-music-progress-bar"
          type="button"
          onClick={handleSeek}
          ref={progressRef}
          aria-label="Seek"
        >
          <span className="ios-music-progress-track" />
          <span className="ios-music-progress-fill" style={{ width: `${progressPct}%` }} />
          <span className="ios-music-progress-dot" style={{ left: `${progressPct}%` }} />
        </button>
        <div className="ios-music-time">{remainingLabel}</div>
      </div>

      {/* ── Controls ── */}
      <div className="ios-music-controls" aria-label="Player controls">
        <button className="ios-music-control" type="button" onClick={prevTrack} aria-label="Previous track">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M7 6h2v12H7zM10 12l9-6v12z" />
          </svg>
        </button>
        <button
          className="ios-music-control ios-music-control-play"
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M7 6h4v12H7zM13 6h4v12h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M8 6l11 6-11 6z" />
            </svg>
          )}
        </button>
        <button className="ios-music-control" type="button" onClick={nextTrack} aria-label="Next track">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M15 6h2v12h-2zM5 18V6l9 6z" />
          </svg>
        </button>
        <button
          className="ios-music-control ios-music-control-output"
          type="button"
          onClick={() => setVolumeLevel(prev => prev === 'high' ? 'low' : 'high')}
          aria-label={volumeLevel === 'high' ? 'Lower volume' : 'Raise volume'}
        >
          {volumeLevel === 'high' ? (
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M5 10h6l4-3v10l-4-3H5z" />
              <path d="M17 8a4 4 0 010 8" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M19 6a6 6 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M5 10h6l4-3v10l-4-3H5z" />
              <path d="M17 10a2 2 0 010 4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Audio element ── */}
      {currentTrack?.src ? (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onEnded={onEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={(event) => {
            const nextDuration = event?.currentTarget?.duration;
            setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
            setCurrentTime(0);
            setIsPlaying(false);
          }}
          onTimeUpdate={(event) => {
            const time = event?.currentTarget?.currentTime ?? 0;
            setCurrentTime(time);
          }}
          preload="metadata"
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', opacity: 0.6 }}>
          Add MP3 files to /public/assets/music/ and update config/audioTracks.js
        </div>
      )}
    </div>
  );
};

export default AudioShowcaseWidget;
