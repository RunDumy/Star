const React = require('react');

// Lightweight manual mock of react-konva components for Jest/jsdom tests.
// These stubs render simple DOM elements instead of initializing Konva/canvas.
const { forwardRef } = React;

// Remove known Konva props so they aren't passed to real DOM elements and
// causing React "unknown prop" warnings. Convert them to data- attributes
// to preserve testable information if needed.
const stripKonvaProps = (props) => {
  if (!props) return {};
  const konvaProps = [
    'fillLinearGradientStartPoint',
    'fillLinearGradientEndPoint',
    'fillLinearGradientColorStops',
    'fillRadialGradientStartPoint',
    'fillRadialGradientStartRadius',
    'fillRadialGradientEndPoint',
    'fillRadialGradientEndRadius',
    'fillRadialGradientColorStops',
    'shadowColor',
    'shadowBlur',
    'shadowOpacity',
    'lineCap',
    'lineJoin',
    'dash',
    'onTap',
  ];

  const out = {};
  Object.keys(props || {}).forEach((k) => {
    const val = props[k];
    if (konvaProps.includes(k)) {
      // skip functions entirely (event handlers)
      if (typeof val === 'function' || val == null) return;
      if (typeof val === 'object') {
        try {
          out[`data-${k.toLowerCase()}`] = JSON.stringify(val);
        } catch (e) {
          out[`data-${k.toLowerCase()}`] = String(val);
        }
      } else {
        out[`data-${k.toLowerCase()}`] = val;
      }
    } else {
      // Only set defined props
      if (val !== undefined) out[k] = val;
    }
  });

  return out;
};

const withChildren = (tagName, defaultProps = {}) => {
  return forwardRef(({ children, ...props }, ref) => React.createElement(tagName, { ...defaultProps, ...stripKonvaProps(props), ref }, children));
};

// Stage should provide a hidden <img> so tests that query by role 'img' (Konva canvas) succeed.
const Stage = forwardRef(({ children, width, height, ...props }, ref) => {
  return React.createElement(
    'div',
    { 'data-testid': 'MockStage', ref, width, height, ...props },
    // Make the mocked canvas image visible so tests using getByRole('img') can find it.
    React.createElement('img', { alt: 'konva-canvas', role: 'img', src: '', style: { display: 'block' } }),
    children
  );
});

module.exports = {
  Stage,
  Layer: withChildren('div', { 'data-testid': 'MockLayer' }),
  Group: withChildren('div', { 'data-testid': 'MockGroup' }),
  Rect: withChildren('div', { 'data-testid': 'MockRect' }),
  Circle: withChildren('div', { 'data-testid': 'MockCircle' }),
  Line: withChildren('div', { 'data-testid': 'MockLine' }),
  Image: forwardRef((props, ref) => {
    const safe = stripKonvaProps(props);
    Object.keys(safe).forEach((k) => {
      if (typeof safe[k] === 'function') delete safe[k];
    });
    return React.createElement('img', { ref, alt: safe.alt || '', src: safe.src || '', ...safe });
  }),
  Text: forwardRef(({ text, ...props }, ref) => {
    const safe = stripKonvaProps(props);
    Object.keys(safe).forEach((k) => {
      if (typeof safe[k] === 'function') delete safe[k];
    });
    return React.createElement('span', { ref, ...safe }, text);
  }),
  Transformer: withChildren('div', { 'data-testid': 'MockTransformer' }),

  // react-konva exports a few hooks / internals; stub common ones as no-ops.
  useImage: () => [null, false],
};
