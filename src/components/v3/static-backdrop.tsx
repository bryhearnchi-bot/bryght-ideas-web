/**
 * The non-WebGL stand-in: used while the 3D chunk loads, and as the
 * permanent backdrop when WebGL is unavailable. A dotted lightbulb glow
 * built from gradients only.
 */
export function StaticBackdrop() {
  return (
    <div className="sg-static" aria-hidden="true">
      <div className="sg-static-glow" />
      <div className="sg-static-dots" />
    </div>
  );
}
