"use client";

/**
 * The headline's last word, rolling like a departure board.
 *
 * The `roll` keyframes in globals.css step through four positions, so this
 * expects exactly four words; the first word is repeated at the end of the
 * stack so the loop lands back where it started.
 */
export function RollingWord({ words }: { words: string[] }) {
  if (words.length === 0) return null;

  const stack = [...words, words[0]];

  return (
    <span
      aria-label={words[0]}
      className="inline-block h-[1em] overflow-hidden bg-black align-bottom text-offwhite"
      style={{ padding: "0 0.12em", borderRadius: "0.06em" }}
    >
      <span aria-hidden="true" className="animate-roll flex flex-col">
        {stack.map((word, i) => (
          <span key={`${word}-${i}`} className="block h-[1em] leading-[1em]">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
