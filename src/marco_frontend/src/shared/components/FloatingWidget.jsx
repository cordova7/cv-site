import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const Z_INDEX_KEY = '__marco_widget_zindex__';

const getContainerMetrics = (container) => {
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const layoutWidth = container.clientWidth || container.offsetWidth || rect.width;
  const layoutHeight = container.clientHeight || container.offsetHeight || rect.height;
  const scaleX = layoutWidth ? rect.width / layoutWidth : 1;
  const scaleY = layoutHeight ? rect.height / layoutHeight : 1;
  return { rect, width: layoutWidth, height: layoutHeight, scaleX, scaleY };
};

const FloatingWidget = ({
  children,
  title = '',
  defaultPosition = { x: 0.5, y: 0.25 },
  className = '',
  onClose = () => {},
}) => {
  const widgetRef = useRef(null);
  const containerRectRef = useRef(null);
  const initializedRef = useRef(false);
  const dragState = useRef({
    active: false,
    originX: 0,
    originY: 0,
    startX: 0,
    startY: 0,
  });

  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 320, y: 240 };
    return {
      x: window.innerWidth * defaultPosition.x,
      y: window.innerHeight * defaultPosition.y,
    };
  });
  const [zIndex, setZIndex] = useState(9995);

  const clampPosition = useCallback((coords) => {
    const bounds = containerRectRef.current
      ? containerRectRef.current
      : { rect: { left: 0, top: 0 }, width: window.innerWidth, height: window.innerHeight, scaleX: 1, scaleY: 1 };

    const widgetEl = widgetRef.current;
    const widgetWidth = widgetEl?.offsetWidth ?? 0;
    const widgetHeight = widgetEl?.offsetHeight ?? 0;
    const halfWidth = widgetWidth ? widgetWidth / 2 : 120;
    const halfHeight = widgetHeight ? widgetHeight / 2 : 90;
    const padding = 10;

    const minX = Math.min(halfWidth + padding, bounds.width - halfWidth - padding);
    const maxX = Math.max(halfWidth + padding, bounds.width - halfWidth - padding);
    const minY = Math.min(halfHeight + padding, bounds.height - halfHeight - padding);
    const maxY = Math.max(halfHeight + padding, bounds.height - halfHeight - padding);

    return {
      x: clamp(coords.x, minX, maxX),
      y: clamp(coords.y, minY, maxY),
    };
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!dragState.current.active) return;
      const bounds = containerRectRef.current;
      if (!bounds) return;

      const currentX = (event.clientX - bounds.rect.left) / bounds.scaleX;
      const currentY = (event.clientY - bounds.rect.top) / bounds.scaleY;
      const deltaX = currentX - dragState.current.startX;
      const deltaY = currentY - dragState.current.startY;

      setPosition(
        clampPosition({
          x: dragState.current.originX + deltaX,
          y: dragState.current.originY + deltaY,
        })
      );
    },
    [clampPosition]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current.active = false;
    widgetRef.current?.removeAttribute('data-dragging');
    document.documentElement.removeAttribute('data-widget-dragging');
    widgetRef.current?.closest('.app')?.removeAttribute('data-widget-dragging');
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const bringToFront = useCallback(() => {
    if (typeof window === 'undefined') return;
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
    const metrics = getContainerMetrics(container);
    containerRectRef.current = metrics;
    return metrics;
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    const bounds = resolveContainer();
    if (!bounds) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    bringToFront();

    widgetRef.current?.setAttribute('data-dragging', 'true');
    document.documentElement.setAttribute('data-widget-dragging', 'true');
    widgetRef.current?.closest('.app')?.setAttribute('data-widget-dragging', 'true');

    dragState.current = {
      active: true,
      originX: position.x,
      originY: position.y,
      startX: (event.clientX - bounds.rect.left) / bounds.scaleX,
      startY: (event.clientY - bounds.rect.top) / bounds.scaleY,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    const refreshContainer = () => {
      const metrics = resolveContainer();
      if (!metrics) return;

      setPosition((prev) => {
        const next = initializedRef.current
          ? prev
          : {
              x: metrics.width * defaultPosition.x,
              y: metrics.height * defaultPosition.y,
            };

        initializedRef.current = true;
        return clampPosition(next);
      });
    };

    const rafId = window.requestAnimationFrame(refreshContainer);
    window.addEventListener('resize', refreshContainer);

    return () => {
      window.cancelAnimationFrame?.(rafId);
      window.removeEventListener('resize', refreshContainer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeAttribute('data-widget-dragging');
    };
  }, [clampPosition, defaultPosition.x, defaultPosition.y, handlePointerMove, handlePointerUp, resolveContainer]);

  const widgetStyles = useMemo(
    () => ({
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex,
    }),
    [position, zIndex]
  );

  return (
    <div
      ref={widgetRef}
      className={`floating-widget ${className}`}
      style={widgetStyles}
      onPointerDown={bringToFront}
    >
      <div className="floating-widget-drag-handle" onPointerDown={handlePointerDown} role="presentation">
        <img
          className="floating-widget-logo"
          src="/assets/logo.png"
          alt=""
          aria-hidden="true"
          width="24"
          height="24"
          loading="eager"
          decoding="async"
        />
        {title && <span className="floating-widget-title">{title}</span>}
        <button
          className="floating-widget-close"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          aria-label="Close window"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="floating-widget-content">{children}</div>
    </div>
  );
};

export default FloatingWidget;
