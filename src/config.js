const SELECT = 'select';
const RECT = 'rect';
const CIRCLE = 'circle';
const ARROW = 'arrow';
const LINE = 'line';
const PENCIL = 'pencil';
const TEXT = 'text';
const ERASER = 'eraser';
const SOLID = 'solid';
const DASH = 'dash';

export default {
  // SELECT,
  // RECT,
  // CIRCLE,
  // ARROW,
  // LINE,
  // PENCIL,
  // TEXT,
  // ERASER,
  SOLID,
  DASH,
  TOOL_LIST: {
    SELECT,
    RECT,
    CIRCLE,
    ARROW,
    LINE,
    PENCIL,
    TEXT,
    ERASER,
  },
  MAX_ZOOM: 9,
  MIN_ZOOM: 0.1,
  SELECTION_COLOR: 'rgba(100, 100, 255, 0.3)',
  COLORS: [
    "blue",
    "green",
    "yellow",
    "orange",
    "red",
    "black",
    "white"
  ],
  LINE_WIDTH: 6,
  LINE_TYPE_LIST: [SOLID, DASH],
  FONT_SIZE: [14, 16, 18, 20, 22, 24, 26, 28, 30],
  DASH_ARRAY: [5, 5],
};
