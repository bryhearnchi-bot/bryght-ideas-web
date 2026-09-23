/** Props every lower page section receives from SignalOrbitPage. */
export type SectionProps = {
  /** prefers-reduced-motion: no continuous or scroll-scrubbed motion. */
  reduced: boolean;
  /** true / false once known; null during SSR and first client render. */
  webgl: boolean | null;
  /** Mouse or trackpad (hover-capable, fine pointer). False on touch. */
  finePointer: boolean;
};
