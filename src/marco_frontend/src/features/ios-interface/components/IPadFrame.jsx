import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_FRAME_VARS = {
  '--frame-tx': '0px',
  '--frame-ty': '0px',
  '--frame-rx': '0deg',
  '--frame-ry': '0deg',
  '--frame-rz': '0deg',
  '--frame-scale': '1',
  '--glare-x': '50%',
  '--glare-y': '35%',
  '--glare-opacity': '0',
};

const INTERACTIVE_SELECTOR = 'a,button,input,textarea,select,[role="button"],[contenteditable="true"]';
const DRAG_START_THRESHOLD = 12;
const FRAME_TRANSLATE_FACTOR = 0.65;
const FRAME_ROTATE_FACTOR = 0.0065;
const FRAME_SCALE_DROP_FACTOR = 0.00014;
const FRAME_MAX_SCALE_DROP = 0.028;
const CONTENT_TRANSLATE_FACTOR = 0.55;
const CONTENT_ROTATE_FACTOR = 0.003;
const CONTENT_SCALE_DROP_FACTOR = 0.00006;
const CONTENT_MAX_SCALE_DROP = 0.045;
const HOVER_MAX_TILT = 5.5;

const IPadFrame = ({ children }) => {
  const engravingText =
    typeof process !== 'undefined' && process.env
          ? (
           process.env.NEXT_PUBLIC_CV_NAME ||
           'Your Name'
         ).trim()
      : 'Your Name';

  const toastTimerRef = useRef(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastOpen(true);
    toastTimerRef.current = window.setTimeout(() => setToastOpen(false), 1700);
  };

  const copyToClipboard = async (text) => {
    const value = (text || '').trim();
    if (!value) return false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {}

    try {
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.top = '-1000px';
      el.style.left = '-1000px';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  };

  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const screenRef = useRef(null);

  const getIsDesktop = () => {
    if (typeof window === 'undefined') return false;
    const hasFinePointer = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: fine)').matches
      : false;
    return window.innerWidth >= 1024 && hasFinePointer;
  };

  const [isDesktop, setIsDesktop] = useState(getIsDesktop);

  const dragRef = useRef({
    active: false,
    kind: null, // 'frame' | 'content'
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const contentTargetsRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef(null);
  const pendingStartRef = useRef(null);

  const setFrameVars = (vars) => {
    const frameEl = frameRef.current;
    if (!frameEl) return;
    for (const [key, value] of Object.entries(vars)) {
      frameEl.style.setProperty(key, value);
    }
  };

  const resetFrameVars = () => setFrameVars(DEFAULT_FRAME_VARS);

  useEffect(() => {
    const onResize = () => setIsDesktop(getIsDesktop());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const contentDragEnabled = useMemo(() => isDesktop, [isDesktop]);

  const cacheContentTargets = () => {
    const screenEl = screenRef.current;
    if (!screenEl) return null;

    const appEl = screenEl.querySelector('.app');
    if (!appEl) return null;

    const homeEl = appEl.querySelector('.ios-home-screen');
    const homeContent = appEl.querySelector('.ios-home-content');
    const appGrid = appEl.querySelector('.ios-app-grid');
    const dock = appEl.querySelector('.ios-dock');
    const pageDots = appEl.querySelector('.ios-page-dots');

    return { screenEl, appEl, homeEl, homeContent, appGrid, dock, pageDots };
  };

  const startDrag = (kind, e, startPosition) => {
    const startX = startPosition?.x ?? e.clientX;
    const startY = startPosition?.y ?? e.clientY;

    dragRef.current.active = true;
    dragRef.current.kind = kind;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = startX;
    dragRef.current.startY = startY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    if (kind === 'frame') {
      frameRef.current?.setAttribute('data-dragging', 'true');
      setFrameVars({ '--glare-opacity': '0.22' });
    }

    if (kind === 'content') {
      const targets = cacheContentTargets();
      contentTargetsRef.current = targets;
      targets?.screenEl?.setAttribute('data-content-dragging', 'true');
      setFrameVars({ '--glare-opacity': '0.18' });
    }
  };

  const endDrag = () => {
    dragRef.current.active = false;
    dragRef.current.kind = null;
    dragRef.current.pointerId = null;
    pendingStartRef.current = null;

    frameRef.current?.removeAttribute('data-dragging');
    screenRef.current?.removeAttribute('data-content-dragging');

    const targets = contentTargetsRef.current;
    if (targets) {
      const elements = [targets.homeEl, targets.homeContent, targets.appGrid, targets.dock, targets.pageDots].filter(Boolean);
      for (const el of elements) el.style.transform = '';
      contentTargetsRef.current = null;
    }

    setFrameVars({ '--frame-tx': '0px', '--frame-ty': '0px', '--frame-rz': '0deg', '--frame-scale': '1', '--glare-opacity': '0' });
  };

  const scheduleFrameUpdate = (next) => {
    pendingRef.current = next;
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      const update = pendingRef.current;
      pendingRef.current = null;
      if (!update) return;
      setFrameVars(update.frameVars || {});
      if (update.contentTransform && contentTargetsRef.current) {
        const { homeEl, homeContent, appGrid, dock, pageDots } = contentTargetsRef.current;
        const elements = (homeEl ? [homeEl] : [homeContent, appGrid, dock, pageDots]).filter(Boolean);
        for (const el of elements) el.style.transform = update.contentTransform;
      }
    });
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      const frameEl = frameRef.current;
      if (!frameEl) return;

      let dragging = dragRef.current.active;

      if (!dragging && document.documentElement.hasAttribute('data-widget-dragging')) {
        return;
      }

      if (!dragging && pendingStartRef.current && pendingStartRef.current.pointerId === e.pointerId) {
        const deltaX = e.clientX - pendingStartRef.current.startX;
        const deltaY = e.clientY - pendingStartRef.current.startY;
        if (Math.abs(deltaX) > DRAG_START_THRESHOLD || Math.abs(deltaY) > DRAG_START_THRESHOLD) {
          if (pendingStartRef.current.kind === 'content') {
            startDrag('content', e, { x: pendingStartRef.current.startX, y: pendingStartRef.current.startY });
            screenRef.current?.setPointerCapture?.(e.pointerId);
          }
          pendingStartRef.current = null;
          dragging = dragRef.current.active;
        }
      }

      if (dragging) {
        if (dragRef.current.pointerId !== e.pointerId) return;
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        // Add resistance as we drag further.
        const resistance = Math.min(1, 1 / (Math.abs(deltaX) / 160 + 1));

        if (dragRef.current.kind === 'frame') {
          const rotateZ = (deltaX * FRAME_ROTATE_FACTOR) * resistance;
          const scale = 1 - Math.min(FRAME_MAX_SCALE_DROP, Math.abs(deltaX) * FRAME_SCALE_DROP_FACTOR);

          scheduleFrameUpdate({
            frameVars: {
              '--frame-tx': `${deltaX * resistance * FRAME_TRANSLATE_FACTOR}px`,
              '--frame-ty': `${deltaY * resistance * FRAME_TRANSLATE_FACTOR}px`,
              '--frame-rz': `${rotateZ}deg`,
              '--frame-scale': `${scale}`,
              '--glare-x': `${Math.max(0, Math.min(100, 50 + deltaX * 0.08))}%`,
              '--glare-y': `${Math.max(0, Math.min(100, 35 + deltaY * 0.08))}%`,
              '--glare-opacity': '0.22',
            },
          });

          e.preventDefault();
        } else if (dragRef.current.kind === 'content' && contentDragEnabled) {
          const contentResistance = resistance * CONTENT_TRANSLATE_FACTOR;
          const rotateZ = (deltaX * CONTENT_ROTATE_FACTOR) * contentResistance;
          const scale = 1 - Math.min(CONTENT_MAX_SCALE_DROP, Math.abs(deltaX) * CONTENT_SCALE_DROP_FACTOR);

          scheduleFrameUpdate({
            frameVars: {
              '--glare-x': `${Math.max(0, Math.min(100, 50 + deltaX * 0.06))}%`,
              '--glare-y': `${Math.max(0, Math.min(100, 35 + deltaY * 0.06))}%`,
              '--glare-opacity': '0.18',
            },
            contentTransform: `translate3d(${deltaX * contentResistance}px, ${deltaY * contentResistance}px, 0) rotate(${rotateZ}deg) scale(${scale})`,
          });
        }

        return;
      }

      // Hover tilt + dynamic glare for desktop.
      if (!isDesktop) return;

      const rect = frameEl.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        scheduleFrameUpdate({ frameVars: { '--frame-rx': '0deg', '--frame-ry': '0deg', '--glare-opacity': '0' } });
        return;
      }

      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1

      const tiltY = (px - 0.5) * HOVER_MAX_TILT; // rotateY
      const tiltX = (0.5 - py) * HOVER_MAX_TILT; // rotateX

      scheduleFrameUpdate({
        frameVars: {
          '--frame-rx': `${tiltX}deg`,
          '--frame-ry': `${tiltY}deg`,
          '--glare-x': `${Math.round(px * 100)}%`,
          '--glare-y': `${Math.round(py * 100)}%`,
          '--glare-opacity': '0.12',
        },
      });
    };

    const onPointerUp = (e) => {
      if (pendingStartRef.current && pendingStartRef.current.pointerId === e.pointerId) {
        pendingStartRef.current = null;
      }
      if (!dragRef.current.active) return;
      if (dragRef.current.pointerId !== e.pointerId) return;
      endDrag();
    };

    const onPointerCancel = (e) => {
      if (pendingStartRef.current && pendingStartRef.current.pointerId === e.pointerId) {
        pendingStartRef.current = null;
      }
      if (dragRef.current.active) {
        endDrag();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [contentDragEnabled, isDesktop]);

  useEffect(() => {
    resetFrameVars();
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.clearTimeout(toastTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (e) => {
    if (dragRef.current.active) return;
    if (!frameRef.current || !screenRef.current) return;

    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Prevent the iPad frame "content drag" effect when interacting with floating widgets.
    if (e.target.closest('.floating-widget')) return;

    const inScreen = e.target.closest('.ipad-frame-screen') !== null;

    if (!inScreen) {
      startDrag('frame', e);
      (containerRef.current ?? frameRef.current).setPointerCapture?.(e.pointerId);
      e.preventDefault();
      return;
    }

    if (!contentDragEnabled) return;
    if (e.pointerType !== 'mouse') return;
    if (e.target.closest(INTERACTIVE_SELECTOR)) return;

    // Only allow "content drag" effect if we're on the home screen.
    const hasHome = !!screenRef.current.querySelector('.ios-home-screen');
    if (!hasHome) return;

    pendingStartRef.current = {
      kind: 'content',
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const handleContainerPointerDown = (e) => {
    if (dragRef.current.active) return;
    if (!frameRef.current) return;

    // Ignore events that originate from inside the frame; those are handled by the frame's handler.
    if (e.target.closest('.ipad-frame')) return;

    if (e.pointerType === 'mouse' && e.button !== 0) return;

    startDrag('frame', e);
    containerRef.current?.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  return (
    <div ref={containerRef} className="ipad-frame-container" onPointerDown={handleContainerPointerDown}>
      <div ref={frameRef} className="ipad-frame" data-desktop={isDesktop} onPointerDown={handlePointerDown}>
        <div className="ipad-frame-bezel">
          <button
            type="button"
            className="ipad-frame-engraving"
            aria-label="Copy mint"
            title="Copy mint"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async (e) => {
              e.stopPropagation();
              const ok = await copyToClipboard(engravingText);
              showToast(ok ? 'Developer name copied' : 'Copy failed');
            }}
          >
            {engravingText}
          </button>
          <div className="ipad-frame-screen" ref={screenRef}>
            {children}
          </div>
          <div className="liquid-toast-layer" aria-live="polite" aria-atomic="true">
            <div className="liquid-toast" data-state={toastOpen ? 'open' : 'closed'}>
              {toastMessage}
            </div>
          </div>
          <div className="ipad-frame-glare" aria-hidden="true" />
          <div className="ipad-volume-up" />
          <div className="ipad-volume-down" />
          <div className="ipad-power-button" />
          <div className="ipad-bevel-effect" />
        </div>
      </div>

    </div>
  );
};

export default IPadFrame;
