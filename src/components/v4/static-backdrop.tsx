/**
 * The non-WebGL stand-in: used while the 3D chunk loads, and as the
 * permanent backdrop when WebGL is unavailable. A dotted lightbulb glow
 * built from gradients only.
 */
export function StaticBackdrop() {
  return (
    <div className="so-static" aria-hidden="true">
      <div className="so-static-glow" />
      <div className="so-static-dots" />
    </div>
  );
}
