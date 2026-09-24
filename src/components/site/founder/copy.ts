import { siteConfig } from "@/config/site";

/**
 * Short UI strings for the founder section, all lifted straight out of
 * siteConfig.founder so the page never says anything the copy doesn't.
 */
const f = siteConfig.founder;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "Over 20 years at the intersection of technology and business: ..."
const yearsMatch = /Over (\d+) years ([^:.]+)/.exec(f.bio);
export const YEARS = yearsMatch ? Number(yearsMatch[1]) : 20;
export const YEARS_CAPTION = yearsMatch ? `years ${yearsMatch[2].trim()}` : "years";

// "...: enterprise IT in hospitality, recruiting technology platforms, and now a studio..."
const pathMatch = /:\s*([^,]+),\s*([^,]+),\s*and now/.exec(f.bio);
const early = pathMatch ? pathMatch[1].trim() : "enterprise IT in hospitality";
const middle = pathMatch ? pathMatch[2].trim() : "recruiting technology platforms";

export type Stop = {
  label: string;
  /** Phrase in the bio this stop lights up (exact substring). */
  phrase: string;
  /** Which bio paragraph holds the phrase. */
  para: 0 | 1;
  now?: boolean;
};

export const STOPS: Stop[] = [
  { label: cap(early), phrase: early, para: 0 },
  { label: cap(middle), phrase: middle, para: 0 },
  { label: siteConfig.name, phrase: siteConfig.name, para: 1, now: true },
];

/** "journey", from "the culmination of that journey". */
export const PATH_LABEL = /journey/i.test(f.bio2) ? "The journey" : "Path";

/** Split a paragraph into plain text and the stop phrases it contains. */
export function splitBio(text: string, para: 0 | 1) {
  const parts: Array<{ text: string; stop?: number }> = [];
  let rest = text;
  const stops = STOPS.map((s, i) => ({ ...s, i })).filter((s) => s.para === para);
  while (rest.length) {
    let best: { at: number; i: number; phrase: string } | null = null;
    for (const s of stops) {
      const at = rest.indexOf(s.phrase);
      if (at >= 0 && (!best || at < best.at)) best = { at, i: s.i, phrase: s.phrase };
    }
    if (!best) {
      parts.push({ text: rest });
      break;
    }
    if (best.at > 0) parts.push({ text: rest.slice(0, best.at) });
    parts.push({ text: best.phrase, stop: best.i });
    rest = rest.slice(best.at + best.phrase.length);
    // Each phrase is marked once.
    const k = stops.findIndex((s) => s.i === best.i);
    stops.splice(k, 1);
  }
  return parts;
}
