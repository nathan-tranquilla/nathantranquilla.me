// The NT mark, "Joined": three parallel lines draw the N, and its last stroke rises
// into the crossbar of the T, so the two letters share one set of lines. Every turn
// is a set of concentric arcs. Approved 2026-10-09.
//
// Drawn as a mask: each path is stroked wide in white, narrower in black, then a thin
// white line down the middle, which leaves three parallel lines. The black (gap) pass
// runs slightly past the open ends, so its soft edge can't leave a hairline across the
// gaps. The header logo and every favicon are drawn from this file.

// The lines span x 10.5–88 (the N's rounded corner to the crossbar's square end) and
// y 12.5–93.5. Both boxes are centred on that, not on the 100-unit grid.
export const VIEW_BOX = "5.25 9 88 88";

/** The N, then the T's crossbar, on a 100-unit grid. */
export const PATHS = ["M18 93.5 V20 L64 86 V20", "M40 20 H88"] as const;

/** The same paths, overshooting the open ends, for the gap pass. */
export const GAP_PATHS = ["M18 95 V20 L64 86 V20", "M38.5 20 H89.5"] as const;

/** Stroke width of each pass: outer band, gap, centre line. */
export const PASSES = [
  { width: 15, ink: "#fff", paths: PATHS },
  { width: 9, ink: "#000", paths: GAP_PATHS },
  { width: 3, ink: "#fff", paths: PATHS },
] as const;

/** Favicon tile: paper lines on ink navy. */
export const FAVICON = { tile: "#12233a", lines: "#faf8f0", viewBox: "-3.75 0 106 106" } as const;
