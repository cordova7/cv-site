import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_TRACKS = [
  {
    id: 'track-1',
    title: 'Carefree Summer',
    artist: 'Jan Cyrka',
    src: '/assets/music/Carefree-Summer.mp3',
    cover: '/assets/music/Carefree-Summer.png',
  },
  {
    id: 'track-2',
    title: 'Down Under',
    artist: 'Men At Work',
    src: '/assets/music/Down-Under.mp3',
    cover: '/assets/music/Down-Under.png',
  },
];

const PumpFunTokenWidget = ({ tracks = DEFAULT_TRACKS }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coverFailed, setCoverFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState('high');
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const currentTrack = tracks[currentIndex] || tracks[0] || null;

  useEffect(() => {
    setCoverFailed(false);
  }, [currentTrack?.cover]);

  const nextTrack = () => {
    if (!tracks.length) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    if (!tracks.length) return;
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const onEnded = () => nextTrack();

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
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

  return (
    <div className="ios-token-widget ios-music-widget" role="group" aria-label="Music player">
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
            <span className="ios-music-title">{currentTrack?.title || 'Untitled'}</span>
            <span className="ios-music-status">{currentTrack ? (isPlaying ? 'Playing' : 'Paused') : 'No track'}</span>
          </div>
          <span className="ios-music-artist" title={trackLabel}>
            {currentTrack?.artist || 'Artist'}
          </span>
        </div>
        <div className="ios-music-audio" aria-hidden="true">
          <svg viewBox="0 0 24 16" role="presentation" focusable="false">
            <rect x="1" y="7" width="2" height="8" rx="1" />
            <rect x="6" y="3" width="2" height="12" rx="1" />
            <rect x="11" y="1" width="2" height="14" rx="1" />
            <rect x="16" y="5" width="2" height="10" rx="1" />
            <rect x="21" y="8" width="2" height="7" rx="1" />
          </svg>
        </div>
      </div>

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
          onClick={() => setVolumeLevel((prev) => (prev === 'high' ? 'low' : 'high'))}
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
        <div className="ios-token-widget-chart-fallback">Add an MP3 in /public/assets/music</div>
      )}
    </div>
  );
};

export default PumpFunTokenWidget;