/**
 * Real UI elements that lift off each screen during the "exploded UI" beat.
 *
 * Rectangles are normalised to the 1320 x 2868 screenshots: x from the left,
 * y from the TOP, both 0..1. They were measured on the real images, so each
 * lifted layer is pixel-identical to the element beneath it. `radius` is in
 * source pixels (of the 1320px-wide image); `lift` is in phone-local units
 * (the phone is 2.8 tall, 0.15 deep). `parent` is the index of the layer the
 * element sits on (its shadow falls on that layer instead of the screen).
 */
export type LayerSpec = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  radius: number;
  lift: number;
  parent?: number;
};

const pill = (y0: number, y1: number) => ((y1 - y0) * 2868) / 2;

export const KGAY_LAYERS: LayerSpec[] = [
  // "Next Adventure" card (orange/purple gradient border)
  { x0: 0.0456, x1: 0.9544, y0: 0.2432, y1: 0.699, radius: 66, lift: 0.26 },
  // COUNTDOWN pill inside the card
  { x0: 0.0755, x1: 0.3365, y0: 0.2578, y1: 0.2855, radius: pill(0.2578, 0.2855), lift: 0.5, parent: 0 },
  // "Experiences of a Lifetime" title
  { x0: 0.088, x1: 0.912, y0: 0.13, y1: 0.174, radius: 26, lift: 0.2 },
  // Floating tab bar
  { x0: 0.164, x1: 0.836, y0: 0.9245, y1: 0.9825, radius: pill(0.9245, 0.9825), lift: 0.34 },
];

export const BETWEENACTS_LAYERS: LayerSpec[] = [
  // "Trending Now" Paddington card, including the WEST END / MUSICAL tags on its top edge
  { x0: 0.0545, x1: 0.9445, y0: 0.2355, y1: 0.4888, radius: 14, lift: 0.24 },
  // Paddington poster inside it
  { x0: 0.0555, x1: 0.405, y0: 0.2476, y1: 0.4884, radius: 12, lift: 0.46, parent: 0 },
  // "All Shows" red filter chip
  { x0: 0.0525, x1: 0.2495, y0: 0.1372, y1: 0.1708, radius: 16, lift: 0.3 },
  // Bottom tab bar
  { x0: 0.037, x1: 0.963, y0: 0.8995, y1: 0.979, radius: pill(0.8995, 0.979), lift: 0.22 },
  // Red "+" button
  { x0: 0.4405, x1: 0.5595, y0: 0.9115, y1: 0.9665, radius: 79, lift: 0.44, parent: 3 },
];
