import * as THREE from "three";

/**
 * Founder card channel between the HTML section, the founder rig and the
 * particle field. Plain mutable state read and written every frame; never
 * React state.
 *
 * Writers:
 *   Founder section          -> el (the card's layout box)
 *   founder rig (prio -1)    -> anchor, presence, reveal, glow, hover, dotPx
 *   particle field (prio 0)  -> morph (its damped morph, read next frame)
 * Readers:
 *   particle field           -> anchor, reveal, glow, hover, dotPx (shape 7)
 *   founder rig              -> el, morph
 */
export const founder = {
  /** The HTML placeholder whose box the WebGL card fills. */
  el: null as HTMLElement | null,
  /**
   * Card-local -> world transform (card 1 wide, 1.25 tall, centred, +z out
   * of the photo). Written by the rig every frame, whether or not the photo
   * has loaded, so the halftone always sits exactly on the HTML box.
   */
  anchor: new THREE.Object3D(),
  /** 0 while the card is far off screen, 1 once it is within ~1.5 screens. */
  presence: 0,
  /** Scan-wipe progress of the photo, 0..1 (1 = photo fully solid). */
  reveal: 0,
  /**
   * How much the card owns the particles, 0..1: follows the particle
   * morph's closeness to the portrait. Photo opacity and the halftone's
   * fade both scale with it, so an exit dissolves the photo back into dots.
   */
  hold: 0,
  /** Scanner lens over the photo: card-local x, y and strength 0..1. */
  hover: new THREE.Vector3(0, 0, 0),
  /** Halftone pitch in device pixels (card width in px * dpr / cols). */
  dotPx: 4,
  /** The particle field's damped morph (so the rig can gate the reveal). */
  morph: 0,
};
