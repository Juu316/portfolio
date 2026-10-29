/**
 * Shaped paper edges as `clip-path: polygon()` values: receipt teeth,
 * postcard scallops and ticket notches. Polygons scale with the element
 * (x in %, depth in px), so no image or gradient is needed.
 */

type Point = [string, string];

const pct = (n: number) => `${+n.toFixed(3)}%`;
const join = (points: Point[]) => `polygon(${points.map(([x, y]) => `${x} ${y}`).join(", ")})`;

/** One edge running left to right; `at(y)` places a depth on that edge. */
function edge(
  kind: "teeth" | "scallops",
  count: number,
  at: (depth: number) => string,
  depth: number,
) {
  const points: Point[] = [];
  const steps = kind === "teeth" ? 2 : 8;
  for (let i = 0; i < count; i++) {
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const x = ((i + t) / count) * 100;
      // Teeth: a valley then a peak. Scallops: a half circle rising from the edge.
      const rise = kind === "teeth" ? (s % 2 ? 1 : 0) : Math.sin(Math.PI * t);
      points.push([pct(x), at(depth * (1 - rise))]);
    }
  }
  points.push(["100%", at(depth)]);
  return points;
}

/** Receipt: saw teeth along the top and/or bottom. */
export function teeth({ top = true, bottom = true, count = 48, depth = 8 } = {}) {
  const topEdge: Point[] = top
    ? edge("teeth", count, (d) => `${d}px`, depth)
    : [
        ["0%", "0"],
        ["100%", "0"],
      ];
  const bottomEdge: Point[] = bottom
    ? edge("teeth", count, (d) => `calc(100% - ${d}px)`, depth).reverse()
    : [
        ["100%", "100%"],
        ["0%", "100%"],
      ];
  return join([...topEdge, ...bottomEdge]);
}

/** Postcard or letter: half-circle scallops along the top or the bottom. */
export function scallops(side: "top" | "bottom", count = 12, depth = 14) {
  if (side === "top") {
    return join([
      ...edge("scallops", count, (d) => `${d}px`, depth),
      ["100%", "100%"],
      ["0%", "100%"],
    ]);
  }
  return join([
    ["0%", "0"],
    ["100%", "0"],
    ...edge("scallops", count, (d) => `calc(100% - ${d}px)`, depth).reverse(),
  ]);
}

/** A half-circle bite of radius r, centred on a point of an edge, drawn as points. */
function bite(cx: string, cy: string, r: number, from: number, to: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = from + ((to - from) * i) / 10;
    points.push([
      `calc(${cx} + ${+(r * Math.cos(a)).toFixed(2)}px)`,
      `calc(${cy} + ${+(r * Math.sin(a)).toFixed(2)}px)`,
    ]);
  }
  return points;
}

/**
 * Ticket or coupon: two notches facing each other.
 * "vertical" cuts the top and bottom edges at `at` (the cut line runs down);
 * "horizontal" cuts the left and right edges at `at` (the cut line runs across).
 */
export function notches(direction: "vertical" | "horizontal", at = 46, r = 14) {
  const p = pct(at);
  const { PI } = Math;
  if (direction === "vertical") {
    return join([
      ["0%", "0%"],
      ...bite(p, "0%", r, PI, 0),
      ["100%", "0%"],
      ["100%", "100%"],
      ...bite(p, "100%", r, 0, -PI),
      ["0%", "100%"],
    ]);
  }
  return join([
    ["0%", "0%"],
    ["100%", "0%"],
    ...bite("100%", p, r, -PI / 2, -PI * 1.5),
    ["100%", "100%"],
    ["0%", "100%"],
    ...bite("0%", p, r, PI / 2, -PI / 2),
  ]);
}
