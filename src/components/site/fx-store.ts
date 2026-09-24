/**
 * Contract: HTML micro-interactions -> particle field.
 *
 * Writers: the Approach section (and any other HTML section) calls
 * emitRipple() when a card is hovered, tapped, or (on touch screens) scrolls
 * into focus. Reader: the particle field, which turns each live ripple into
 * an expanding ring that lifts and brightens the wave particles around that
 * point. Plain mutable state, never React state.
 */

export const MAX_RIPPLES = 4;

export type Ripple = {
  /** Viewport position in normalised device coords, -1..1 (+y up). */
  x: number;
  y: number;
  /** performance.now() / 1000 when the ripple started; -1 = unused slot. */
  start: number;
  /** 0..1 */
  strength: number;
};

export const fx = {
  ripples: Array.from({ length: MAX_RIPPLES }, (): Ripple => ({ x: 0, y: 0, start: -1, strength: 0 })),
  next: 0,
};

/** Start a ripple centred on a viewport point given in CSS pixels. */
export function emitRipple(clientX: number, clientY: number, strength = 1) {
  if (typeof window === "undefined") return;
  const r = fx.ripples[fx.next];
  r.x = (clientX / window.innerWidth) * 2 - 1;
  r.y = -((clientY / window.innerHeight) * 2 - 1);
  r.start = performance.now() / 1000;
  r.strength = Math.max(0, Math.min(1, strength));
  fx.next = (fx.next + 1) % MAX_RIPPLES;
}
