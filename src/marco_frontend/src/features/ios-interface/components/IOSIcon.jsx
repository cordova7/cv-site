import React, { useId } from 'react';

const ICONS = {
  'at-sign': {
    nodes: [
      { tag: 'circle', props: { cx: 12, cy: 12, r: 4 } },
      { tag: 'path', props: { d: 'M16 8v5a3 3 0 0 1-6 0v-1' } },
      { tag: 'path', props: { d: 'M16 8a6 6 0 1 0 2.4 4.8' } },
    ],
  },
  'file-text': {
    nodes: [
      { tag: 'path', props: { d: 'M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' } },
      { tag: 'path', props: { d: 'M14 2v6h6' } },
      { tag: 'path', props: { d: 'M9 13h6' } },
      { tag: 'path', props: { d: 'M9 17h6' } },
    ],
  },
  folder: {
    nodes: [
      { tag: 'path', props: { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' } },
    ],
  },
  'finder-app': ({ ids }) => ({
    defs: [
      {
        tag: 'linearGradient',
        props: { id: ids.face, x1: '0', y1: '0', x2: '1', y2: '1' },
        children: [
          { tag: 'stop', props: { offset: '0%', stopColor: '#38BDF8' } },
          { tag: 'stop', props: { offset: '100%', stopColor: '#2563EB' } },
        ],
      },
      {
        tag: 'linearGradient',
        props: { id: ids.faceRight, x1: '0', y1: '0', x2: '1', y2: '1' },
        children: [
          { tag: 'stop', props: { offset: '0%', stopColor: '#93C5FD' } },
          { tag: 'stop', props: { offset: '100%', stopColor: '#60A5FA' } },
        ],
      },
    ],
    nodes: [
      { tag: 'rect', props: { x: 3, y: 3, width: 18, height: 18, rx: 5, fill: `url(#${ids.face})` } },
      { tag: 'path', props: { d: 'M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6z', fill: `url(#${ids.faceRight})` } },
      { tag: 'path', props: { d: 'M12 6v12', stroke: 'rgba(15, 23, 42, 0.45)', strokeWidth: 1 } },
      { tag: 'path', props: { d: 'M7.5 10.2h.1M16.5 10.2h.1', stroke: 'rgba(15, 23, 42, 0.75)', strokeWidth: 1.6, strokeLinecap: 'round' } },
      { tag: 'path', props: { d: 'M8.2 14.2c1.2 1 2.5 1.5 3.8 1.5s2.6-.5 3.8-1.5', stroke: 'rgba(15, 23, 42, 0.7)', strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' } },
    ],
  }),
  'linkedin-app': ({ ids }) => ({
    defs: [
      {
        tag: 'linearGradient',
        props: { id: ids.face, x1: '0', y1: '0', x2: '1', y2: '1' },
        children: [
          { tag: 'stop', props: { offset: '0%', stopColor: '#0A66C2' } },
          { tag: 'stop', props: { offset: '100%', stopColor: '#1D4ED8' } },
        ],
      },
    ],
    nodes: [
      { tag: 'rect', props: { x: 3, y: 3, width: 18, height: 18, rx: 5, fill: `url(#${ids.face})` } },
      { tag: 'circle', props: { cx: 8.6, cy: 9.1, r: 1.2, fill: '#FFFFFF' } },
      { tag: 'rect', props: { x: 7.6, y: 11, width: 2, height: 6, rx: 0.8, fill: '#FFFFFF' } },
      { tag: 'path', props: { d: 'M12 11.2h2.2c1.5 0 2.8 1.1 2.8 2.7V17h-2v-3c0-.9-.5-1.4-1.3-1.4H12v4.4h-2v-5.8z', fill: '#FFFFFF' } },
    ],
  }),
  image: {
    nodes: [
      { tag: 'rect', props: { x: 3, y: 5, width: 18, height: 14, rx: 2 } },
      { tag: 'circle', props: { cx: 8.5, cy: 10.5, r: 1.5 } },
      { tag: 'path', props: { d: 'm21 15-4.5-4.5-6 6L7 13l-4 4' } },
    ],
  },
  'portfolio-app': ({ ids }) => ({
    defs: [
      {
        tag: 'linearGradient',
        props: { id: ids.sky, x1: '0', y1: '0', x2: '1', y2: '1' },
        children: [
          { tag: 'stop', props: { offset: '0%', stopColor: '#0F172A' } },
          { tag: 'stop', props: { offset: '100%', stopColor: '#1F2937' } },
        ],
      },
      {
        tag: 'linearGradient',
        props: { id: ids.land, x1: '0', y1: '0', x2: '1', y2: '1' },
        children: [
          { tag: 'stop', props: { offset: '0%', stopColor: '#FDE68A' } },
          { tag: 'stop', props: { offset: '100%', stopColor: '#F59E0B' } },
        ],
      },
    ],
    nodes: [
      { tag: 'rect', props: { x: 3, y: 3, width: 18, height: 18, rx: 5, fill: `url(#${ids.sky})` } },
      { tag: 'rect', props: { x: 6, y: 9, width: 12, height: 8, rx: 2.2, fill: `url(#${ids.land})` } },
      { tag: 'rect', props: { x: 6.8, y: 10.2, width: 10.4, height: 4.6, rx: 1.6, fill: 'rgba(255, 255, 255, 0.18)' } },
      { tag: 'path', props: { d: 'M9 9.2V8a3 3 0 0 1 6 0v1.2', fill: 'none', stroke: '#FDE68A', strokeWidth: 1.4, strokeLinecap: 'round' } },
      { tag: 'path', props: { d: 'M6 12h12', stroke: 'rgba(15, 23, 42, 0.4)', strokeWidth: 1 } },
      { tag: 'circle', props: { cx: 12, cy: 12, r: 0.9, fill: 'rgba(15, 23, 42, 0.35)' } },
    ],
  }),
  compass: {
    nodes: [
      { tag: 'circle', props: { cx: 12, cy: 12, r: 10 } },
      { tag: 'path', props: { d: 'm16 8-2.5 6.5L8 16l2.5-6.5z' } },
    ],
  },
  'message-circle': {
    nodes: [{ tag: 'path', props: { d: 'M21 11.5a8.4 8.4 0 0 1-1.3 4.5 8.5 8.5 0 0 1-7.2 4 8.4 8.4 0 0 1-4.5-1.3L3 21l1.3-3.9A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3a8.5 8.5 0 0 1 9.5 8.5z' } }],
  },
  send: {
    nodes: [{ tag: 'path', props: { d: 'M22 2 11 13' } }, { tag: 'path', props: { d: 'M22 2 15 22l-4-9-9-4z' } }],
  },
  sparkles: {
    nodes: [
      { tag: 'path', props: { d: 'm12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z' } },
      { tag: 'path', props: { d: 'm5 3 .8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8z' } },
      { tag: 'path', props: { d: 'm19 14 .7 1.9L22 17l-2.3.8L19 20l-.7-2.2L16 17l2.3-.8z' } },
    ],
  },
  'music-note': {
    nodes: [
      { tag: 'path', props: { d: 'M9 18V5l12-2v13' } },
      { tag: 'circle', props: { cx: 6, cy: 18, r: 3 } },
      { tag: 'circle', props: { cx: 18, cy: 16, r: 3 } },
    ],
  },
};

const IOSIcon = ({ name, className = '', strokeWidth = 1.6 }) => {
  const iconSource = ICONS[name];
  const uid = useId();
  const ids = {
    face: `${uid}-face`,
    faceRight: `${uid}-face-right`,
    sky: `${uid}-sky`,
    land: `${uid}-land`,
  };
  const icon = typeof iconSource === 'function' ? iconSource({ ids }) : iconSource;
  if (!icon) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      className={`ios-icon-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {icon.defs && <defs>{icon.defs.map((def, index) => {
        const Tag = def.tag;
        const children = def.children || [];
        return (
          <Tag key={`${name}-def-${index}`} {...def.props}>
            {children.map((child, childIndex) => {
              const ChildTag = child.tag;
              return <ChildTag key={`${name}-def-${index}-${childIndex}`} {...child.props} />;
            })}
          </Tag>
        );
      })}</defs>}
      {icon.nodes.map((node, index) => {
        const Tag = node.tag;
        return <Tag key={`${name}-${index}`} {...node.props} />;
      })}
    </svg>
  );
};

export default IOSIcon;
