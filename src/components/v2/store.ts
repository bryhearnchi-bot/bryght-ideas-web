/**
 * Shared, mutable scroll + pointer state for the Orbit stage.
 *
 * The HTML shell writes to it from scroll/pointer listeners; the WebGL scene
 * reads it inside useFrame. Keeping it outside React state means scrolling
 * never re-renders the page.
 */
class OrbitStore {
  /** Stage progress: 0 = hero, 1 = work intro, 2..4 = app i active. */
  t = 0;
  /** Pointer, normalised to -1..1 (desktop fine pointers only). */
  px = 0;
  py = 0;
  private listeners = new Set<() => void>();

  setProgress(t: number) {
    if (t === this.t) return;
    this.t = t;
    this.emit();
  }

  setPointer(x: number, y: number) {
    this.px = x;
    this.py = y;
    this.emit();
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }
}

export const orbitStore = new OrbitStore();

/** Number of scroll states on the stage (hero, intro, three apps). */
export const STAGE_STATES = 5;
