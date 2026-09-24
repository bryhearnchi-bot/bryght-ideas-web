"use client";

import type { ReactNode } from "react";
import { useLoopClock } from "./hooks";
import type { DemoProps } from "./types";

/*
 * 01 · AI-augmented development
 * A miniature editor. The human types; the AI offers the next two lines as a
 * ghost; Tab accepts them; the human keeps going. Lines the AI wrote keep a
 * thin blue bar in the gutter.
 */

type Kind = "k" | "f" | "t" | "v" | "p" | "_";
type Tok = [Kind, string];

const LINES: Tok[][] = [
  [["k", "async"], ["_", " "], ["k", "function"], ["_", " "], ["f", "ship"], ["p", "("], ["v", "idea"], ["p", ": "], ["t", "Idea"], ["p", ") {"]],
  [["_", "  "], ["k", "const"], ["_", " "], ["v", "app"], ["p", " = "], ["k", "await"], ["_", " "], ["f", "build"], ["p", "("], ["v", "idea"], ["p", ");"]],
  [["_", "  "], ["k", "await"], ["_", " "], ["f", "test"], ["p", "("], ["v", "app"], ["p", ");"]],
  [["_", "  "], ["k", "return"], ["_", " "], ["f", "deploy"], ["p", "("], ["v", "app"], ["p", ");"]],
  [["p", "}"]],
  [],
  [["f", "ship"], ["p", "("], ["v", "yourIdea"], ["p", ");"]],
];

const LEN = LINES.map((l) => l.reduce((n, [, s]) => n + s.length, 0));

/* Timeline, ms. */
const LOOP = 9800;
const CH = 44;
const L1 = 400;
const L2 = 2050;
const GHOST = 3700;
const PRESS = 4850;
const ACCEPT = 5050;
const L5 = 5550;
const L7 = 5950;
const FADE = 9050;
/** Reduced motion shows the loop's finished frame. */
const FINAL = 8600;

const typed = (t: number, start: number, len: number) =>
  Math.max(0, Math.min(len, Math.floor((t - start) / CH)));

type LineState = { n: number; ghost?: boolean };
type Status = "writing" | "suggest" | "accepted" | "ready";

function frame(t: number) {
  const lines: LineState[] = [{ n: typed(t, L1, LEN[0]) }];
  const l2Done = L2 + LEN[1] * CH;
  const l7Done = L7 + LEN[6] * CH;
  let caret = { line: 0, col: lines[0].n };
  let status: Status = "writing";

  if (t >= L2) {
    lines.push({ n: typed(t, L2, LEN[1]) });
    caret = { line: 1, col: lines[1].n };
  }
  if (t >= l2Done + 250) {
    // Auto-indent onto line 3.
    if (t < GHOST) {
      lines.push({ n: 2 });
    } else if (t < ACCEPT) {
      lines.push({ n: LEN[2], ghost: true }, { n: LEN[3], ghost: true });
      status = "suggest";
    } else {
      lines.push({ n: LEN[2] }, { n: LEN[3] });
      status = "accepted";
    }
    caret = t < ACCEPT ? { line: 2, col: 2 } : { line: 3, col: LEN[3] };
  }
  if (t >= L5) {
    lines.push({ n: typed(t, L5, LEN[4]) });
    caret = { line: 4, col: lines[4].n };
  }
  if (t >= L7 - 200) {
    lines.push({ n: 0 });
    caret = { line: 5, col: 0 };
  }
  if (t >= L7) {
    lines.push({ n: typed(t, L7, LEN[6]) });
    caret = { line: 6, col: lines[6].n };
    status = t >= l7Done + 400 ? "ready" : "writing";
  }
  return {
    lines,
    caret,
    status,
    pressed: t >= PRESS && t < ACCEPT + 60,
    flash: t >= ACCEPT && t < ACCEPT + 700,
    fade: t >= FADE,
    accepted: t >= ACCEPT,
  };
}

function renderTokens(line: Tok[], count: number, from = 0): ReactNode[] {
  const out: ReactNode[] = [];
  let pos = 0;
  line.forEach(([kind, text], i) => {
    const a = Math.max(from, pos);
    const b = Math.min(count, pos + text.length);
    if (b > a) {
      out.push(
        <span key={i} className={`so-ap-tk-${kind}`}>
          {text.slice(a - pos, b - pos)}
        </span>,
      );
    }
    pos += text.length;
  });
  return out;
}

const STATUS_LABEL: Record<Status, string> = {
  writing: "Writing",
  suggest: "AI suggestion",
  accepted: "Accepted",
  ready: "Ready",
};

export function CodeDemo({ play, hero, reduced }: DemoProps) {
  const clock = useLoopClock(LOOP, play && !reduced, hero ? 1.7 : 1);
  const t = reduced ? FINAL : clock;
  const f = frame(t);

  return (
    <div
      className="so-ap-code"
      data-play={play && !reduced ? "true" : undefined}
      data-fade={f.fade ? "true" : undefined}
    >
      <div className="so-ap-bar">
        <span className="so-ap-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="so-ap-tab" data-on="true">
          ship.ts
        </span>
        <span className="so-ap-tab">types.ts</span>
        <span className="so-ap-status" data-s={f.status}>
          <span className="so-ap-status-dot" />
          {STATUS_LABEL[f.status]}
        </span>
      </div>
      <div className="so-ap-lines">
        {f.lines.map((ls, i) => {
          const isCaret = f.caret.line === i;
          const ai = i === 2 || i === 3;
          const tokens = LINES[i];
          let body: ReactNode;
          if (ls.ghost && i === 2) {
            // Caret sits after the indent; the rest of the line is the ghost.
            body = (
              <>
                {renderTokens(tokens, 2)}
                <span className="so-ap-caret" />
                <span className="so-ap-ghost">{renderTokens(tokens, ls.n, 2)}</span>
                <span className="so-ap-chip">AI</span>
                <span className="so-ap-key" data-down={f.pressed ? "true" : undefined}>
                  Tab
                </span>
              </>
            );
          } else if (ls.ghost) {
            body = <span className="so-ap-ghost">{renderTokens(tokens, ls.n)}</span>;
          } else {
            body = (
              <>
                {renderTokens(tokens, ls.n)}
                {isCaret && <span className="so-ap-caret" />}
              </>
            );
          }
          return (
            <div
              key={i}
              className="so-ap-line"
              data-cur={isCaret ? "true" : undefined}
              data-ai={ai && f.accepted ? "true" : undefined}
              data-ghost={ls.ghost ? "true" : undefined}
              data-flash={ai && f.flash ? "true" : undefined}
            >
              <span className="so-ap-ln">{i + 1}</span>
              <span className="so-ap-src">{body}</span>
            </div>
          );
        })}
        <span className="so-ap-mini">
          {f.lines.map((ls, i) => (
            <i
              key={i}
              data-ai={(i === 2 || i === 3) && f.accepted ? "true" : undefined}
              style={{ width: `${Math.round(ls.n * 1.4)}px`, opacity: ls.ghost ? 0.5 : 1 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
