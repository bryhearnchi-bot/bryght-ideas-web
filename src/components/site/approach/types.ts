/** Every card demo gets the same three flags from its card. */
export type DemoProps = {
  /** In view and the tab is visible: loops may run. */
  play: boolean;
  /** Hovered (fine pointer) or the active card (touch): the demo's big moment. */
  hero: boolean;
  /** The hero moment came from a mouse hover (a deliberate act), not touch focus. */
  hover: boolean;
  /** prefers-reduced-motion: show the finished frame, no loops. */
  reduced: boolean;
};
