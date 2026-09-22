/**
 * Tiny shared channel between the HTML page (which knows the scroll
 * position) and the WebGL scene (which reads it every frame). Kept outside
 * React state so scrolling never re-renders the page.
 */

type Listener = () => void;

export const signalStore = {
  /** 0 bulb · 1 phone · 2 globe · 3 network · 4 ring · 5 wave (everything below services) */
  morph: 0,
  /** Brightness of the field, lowered behind dense content. */
  dim: 1,
  pointer: { x: 0, y: 0, active: false },
  listeners: new Set<Listener>(),
};

export function setSignal(morph: number, dim: number) {
  if (morph === signalStore.morph && dim === signalStore.dim) return;
  signalStore.morph = morph;
  signalStore.dim = dim;
  signalStore.listeners.forEach((fn) => fn());
}

export function subscribeSignal(fn: Listener) {
  signalStore.listeners.add(fn);
  return () => {
    signalStore.listeners.delete(fn);
  };
}
