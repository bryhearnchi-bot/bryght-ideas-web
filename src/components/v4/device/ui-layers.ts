/**
 * Real UI elements that lift off each screen during the "exploded UI" beat.
 *
 * Every screenshot is 921 x 2000. Each rectangle was measured on the real PNG
 * (edge scans plus zoomed crops) and is written in source pixels through
 * `px()`, which normalises it: x from the left, y from the TOP, both 0..1.
 * So each lifted layer is pixel-identical to the element beneath it at rest.
 * `radius` is in source pixels and matches the element's own corner; `lift`
 * is in phone-local units (the phone is 2.8 tall, 0.15 deep). `parent` is the
 * index of the layer the element sits on (it rides on that layer, and its
 * cavity and shadow fall on it); a parent must come before its children.
 * Layers lift in list order, a touch apart.
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

/** Screenshot size in pixels (all three apps). */
export const SHOT_W = 921;
export const SHOT_H = 2000;

/** A rectangle in source pixels (left, top, right, bottom) -> normalised spec fields. */
const px = (l: number, t: number, r: number, b: number) => ({
  x0: l / SHOT_W,
  x1: r / SHOT_W,
  y0: t / SHOT_H,
  y1: b / SHOT_H,
});

/** Trip Guide: the countdown cascades down the hero, then the CTA and the tab bar. */
export const KGAY_LAYERS: LayerSpec[] = [
  // "COUNTDOWN" chip (cyan outline, square corners)
  { ...px(25, 461, 258, 510), radius: 2, lift: 0.46 },
  // "166 DAYS", with the photo behind it
  { ...px(20, 522, 236, 604), radius: 12, lift: 0.32 },
  // Green "ROOMS AVAILABLE" tag
  { ...px(33, 1035, 362, 1085), radius: 2, lift: 0.38 },
  // Orange "BOOK THIS TRIP WITH KGAY" button
  { ...px(33, 1473, 888, 1552), radius: 3, lift: 0.28 },
  // Floating glass tab bar
  { ...px(43, 1826, 878, 1956), radius: 65, lift: 0.2 },
];

/** Broadway: the hero poster jumps out of the carousel, the rest of the page follows. */
export const BETWEENACTS_LAYERS: LayerSpec[] = [
  // "NOW PLAYING IN NEW YORK / BROADWAY" heading block
  { ...px(36, 270, 540, 386), radius: 14, lift: 0.24 },
  // Centre poster, "The Outsiders" (highest)
  { ...px(277, 443, 649, 975), radius: 3, lift: 0.52 },
  // "Critics / Audience" toggle
  { ...px(507, 1263, 875, 1330), radius: 34, lift: 0.3 },
  // No. 1 poster, Hamilton
  { ...px(148, 1371, 358, 1670), radius: 2, lift: 0.38 },
  // Red "+" button (a circle)
  { ...px(787, 1677, 883, 1774), radius: 49, lift: 0.44 },
];

/** Wallpaper editor: the card rises with its "Create" pill riding above it. */
export const MYCRUISECARD_LAYERS: LayerSpec[] = [
  // Rainbow wallpaper card
  { ...px(164, 312, 756, 1597), radius: 22, lift: 0.22 },
  // "Create Cruise Card" pill, overhanging the card's bottom edge (highest)
  { ...px(257, 1543, 665, 1621), radius: 39, lift: 0.5, parent: 0 },
  // Header: app icon + "MyCruiseCard" wordmark
  { ...px(132, 157, 530, 240), radius: 18, lift: 0.2 },
  // "Save to Phone" button
  { ...px(33, 1732, 450, 1850), radius: 22, lift: 0.3 },
  // "Share" button
  { ...px(471, 1732, 888, 1850), radius: 22, lift: 0.36 },
];
