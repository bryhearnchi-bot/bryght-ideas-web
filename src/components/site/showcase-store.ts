import * as THREE from "three";

/**
 * Contract between the page (HTML + scroll), the particle field and the
 * device rig. Plain mutable object read and written every frame; never put
 * it in React state.
 *
 * Writers:
 *   page (showcase section)  -> t, presence
 *   device rig (priority -1) -> anchors, glow, reveal
 * Readers:
 *   particle field           -> anchors, glow (shape 5 = phone outlines)
 *   device rig               -> t, presence
 */

export const PHONE_COUNT = 3;

/** Showcase stages: t is fractional between them. */
export const STAGE = {
  /** Particles have formed three phone outlines in a fan; phones still invisible. */
  OUTLINE: 0,
  /** Phones fully materialised in the fan. */
  FAN: 1,
  /** App i is front and centre (2 = KGAY Travel, 3 = BetweenActs, 4 = MyCruiseCard). */
  APP0: 2,
  APP1: 3,
  APP2: 4,
  /** Leaving: phones clear out as the page moves on to Approach. */
  EXIT: 5,
} as const;

export const showcase = {
  /** Scroll progress through the pinned Work showcase, clamped to [0, 5]. */
  t: 0,
  /**
   * 0 while the showcase is far away (more than ~1.5 viewports), ramping to 1
   * as it arrives. The rig mounts/loads phones once this is > 0 and can skip
   * work while it is 0.
   */
  presence: 0,
  /**
   * Phone-local -> world transforms for the three phones (KGAY, BetweenActs,
   * MyCruiseCard), in the units of phone-dims.ts. Written every frame by the rig in a
   * useFrame with priority -1 (runs before the particle field), whether or
   * not the phone meshes have loaded. matrixWorld is up to date after the rig
   * runs.
   */
  anchors: Array.from({ length: PHONE_COUNT }, () => new THREE.Object3D()),
  /**
   * Brightness multiplier for each phone's particle outline, 0..1. 1 = bright
   * outline (before the phone materialises), ~0.2 = faint aura around a solid
   * phone, 0 = gone.
   */
  glow: [1, 1, 1],
  /** Materialise amount per phone, 0..1 (informational for the page). */
  reveal: [0, 0, 0],
};
