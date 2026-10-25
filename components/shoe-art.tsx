import { useId } from "react";
import type { Build, ShoeColors, Zone } from "@/data/products";

/**
 * Original, unbranded side-profile illustration of a Red Crown shoe.
 * Shares the colour zones and build options of the 3D model, so it doubles
 * as product imagery, the 3D poster and the no-WebGL fallback.
 */

type Pt = [number, number];

const UPPER = {
  low: "M62 186C46 160 48 122 64 100C70 92 82 90 92 95C112 106 132 116 152 116C172 116 186 102 194 90L212 82C222 82 226 90 224 98C282 118 360 148 420 166C468 166 518 158 554 166C582 174 594 194 580 206C500 209 420 210 340 207C240 204 140 192 62 186Z",
  high: "M62 186C44 150 44 92 58 58C64 48 78 46 90 50C120 62 148 72 168 72C184 72 194 62 202 52L220 46C230 46 234 54 232 62C252 84 300 116 340 138C370 152 400 162 420 166C468 166 518 158 554 166C582 174 594 194 580 206C500 209 420 210 340 207C240 204 140 192 62 186Z",
};

const LINING = {
  low: "M90 96C112 106 132 116 152 116C172 116 186 102 194 90C160 91 120 93 90 96Z",
  high: "M88 51C120 62 148 72 168 72C184 72 194 62 202 52C164 50 124 49 88 51Z",
};

const COLLAR = {
  low: "M66 100C72 92 82 90 92 95C112 106 132 116 152 116C172 116 186 102 194 90",
  high: "M60 58C66 48 78 46 90 50C120 62 148 72 168 72C184 72 194 62 202 52",
};

const TONGUE = {
  low: "M186 100C190 92 196 84 204 78C214 72 226 76 226 86L224 100C214 104 196 104 186 100Z",
  high: "M194 58C198 50 204 42 212 38C222 34 234 38 234 48L232 62C222 66 204 64 194 58Z",
};

/** Throat line as cubic segments: [start, c1, c2, end, c1, c2, end, ...]. */
const LACE_LINE: Record<Build["collar"], Pt[]> = {
  low: [
    [224, 98],
    [282, 118],
    [360, 148],
    [420, 166],
  ],
  high: [
    [232, 62],
    [252, 84],
    [300, 116],
    [340, 138],
    [370, 152],
    [400, 162],
    [420, 166],
  ],
};

const HEEL = {
  low: "M20 214L20 82C64 92 98 112 112 142C120 160 126 184 132 214Z",
  high: "M20 214L20 40C66 58 100 100 114 140C122 162 126 186 132 214Z",
};

const HEEL_EDGE = {
  low: "M64 94C92 104 106 122 112 142C120 160 126 184 130 196",
  high: "M58 54C84 68 104 100 114 140C122 162 126 184 130 196",
};

const PULL_TAB = {
  low: "M60 108C54 94 56 80 64 74L76 76C78 84 78 94 76 102Z",
  high: "M54 66C48 52 50 38 58 32L70 34C72 42 72 52 70 60Z",
};

const TAPE = {
  low: "M258 210L300 210L262 112L230 100Z",
  high: "M258 210L300 210L258 92L226 70Z",
};

const TAPE_STITCH = {
  low: "M264 210L234 106M294 210L262 120",
  high: "M264 210L230 76M294 210L258 98",
};

const TOE_CAP = "M452 162C490 160 540 156 592 180L592 216L452 216C440 198 440 178 452 162Z";

const SOLE = {
  runner: {
    mid: "M62 186C44 190 40 214 50 232C56 242 70 244 92 244L470 244C520 244 556 238 574 220C596 208 592 198 580 204C500 209 420 210 340 207C240 204 140 192 62 186Z",
    out: "M50 232C56 246 70 252 92 252L470 252C522 252 562 242 580 222L574 220C556 238 520 244 470 244L92 244C70 244 56 242 50 232Z",
    groove: "M78 226C200 232 380 234 548 214",
    sheen: "M70 196C200 204 400 212 560 202",
  },
  court: {
    mid: "M62 186C46 188 42 200 44 214L46 240C48 246 54 248 64 248L540 248C560 248 576 240 580 226L590 210C590 202 586 200 580 204C500 209 420 210 340 207C240 204 140 192 62 186Z",
    out: "M46 240C48 252 56 256 68 256L540 256C562 256 578 248 582 232L580 226C576 240 560 248 540 248L64 248C54 248 48 246 46 240Z",
    groove: "M50 222C200 224 400 224 578 218",
    sheen: "M66 194C200 202 400 210 566 202",
  },
  trail: {
    mid: "M62 186C44 190 40 214 50 230C56 240 70 242 92 242L470 242C520 242 556 236 574 218C596 206 592 198 580 204C500 209 420 210 340 207C240 204 140 192 62 186Z",
    out: "M46 226C52 248 70 256 92 256L470 256C526 256 566 244 586 218L574 216C556 236 520 242 470 242L92 242C70 242 56 240 46 226Z",
    groove: "M80 224C200 230 380 232 548 212",
    sheen: "M70 196C200 204 400 212 560 202",
  },
} as const;

const TRAIL_LUGS = Array.from({ length: 16 }, (_, i) => 72 + i * 30);
const TOE_BUMPER = "M536 194C560 188 584 194 590 210L586 220C570 218 552 212 536 208Z";

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Evenly spaced points (with tangent) along the throat line. */
function lacePoints(collar: Build["collar"]) {
  const pts = LACE_LINE[collar];
  const samples: Pt[] = [];
  for (let s = 0; s + 3 < pts.length; s += 3) {
    for (let i = 0; i <= 40; i++) samples.push(cubic(pts[s], pts[s + 1], pts[s + 2], pts[s + 3], i / 40));
  }
  const count = collar === "high" ? 8 : 6;
  const result: { p: Pt; t: Pt }[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((0.06 + (i / (count - 1)) * 0.78) * (samples.length - 2));
    const a = samples[idx];
    const b = samples[idx + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    result.push({ p: a, t: [(b[0] - a[0]) / len, (b[1] - a[1]) / len] });
  }
  return result;
}

const LACES = { low: lacePoints("low"), high: lacePoints("high") };

function laceD(collar: Build["collar"]) {
  const pts = LACE_LINE[collar];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let s = 1; s + 2 < pts.length; s += 3) d += `C${pts[s].join(" ")} ${pts[s + 1].join(" ")} ${pts[s + 2].join(" ")}`;
  return d;
}

const LACE_D = { low: laceD("low"), high: laceD("high") };

export function isLightColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

export interface ShoeArtProps {
  colors: ShoeColors;
  build: Build;
  /** Accessible description. Omit for decorative usage. */
  title?: string;
  /** Dim every zone except this one. */
  focus?: Zone | null;
  className?: string;
  /** Draw the soft floor shadow. */
  shadow?: boolean;
}

export function ShoeArt({ colors, build, title, focus = null, className, shadow = true }: ShoeArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const { collar, sole } = build;
  const soleShapes = SOLE[sole];
  const stitchOnUpper = isLightColor(colors.upper) ? "rgb(0 0 0 / .28)" : "rgb(255 255 255 / .28)";
  const stitchOnAccent = isLightColor(colors.accent) ? "rgb(0 0 0 / .3)" : "rgb(255 255 255 / .32)";
  const laceEdge = isLightColor(colors.laces) ? "rgb(0 0 0 / .35)" : "rgb(255 255 255 / .18)";

  const zoneStyle = (zone: Zone) =>
    focus
      ? {
          opacity: focus === zone ? 1 : 0.22,
          filter: focus === zone ? "drop-shadow(0 0 10px rgb(255 38 56 / .55))" : undefined,
          transition: "opacity var(--dur-base) ease, filter var(--dur-base) ease",
        }
      : undefined;

  return (
    <svg
      viewBox="10 14 590 295"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={id("upper")}>
          <path d={UPPER[collar]} />
        </clipPath>
        <linearGradient id={id("vshade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".32" />
        </linearGradient>
        <linearGradient id={id("hshade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".34" />
          <stop offset=".2" stopColor="#000" stopOpacity="0" />
          <stop offset=".86" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id={id("soleShade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".34" />
        </linearGradient>
        <radialGradient id={id("floor")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".75" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern id={id("knit")} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
          <path d="M0 2.5H5" stroke="#000" strokeOpacity=".1" strokeWidth="1.4" />
        </pattern>
      </defs>

      {shadow && <ellipse cx="315" cy="262" rx="292" ry="16" fill={`url(#${id("floor")})`} />}

      {/* Upper and everything stitched onto it */}
      <g style={zoneStyle("upper")}>
        <path d={UPPER[collar]} fill={colors.upper} />
        {/* Lining: the upper's colour in shadow, matching the 3D shoe */}
        <path d={LINING[collar]} fill={colors.upper} />
        <path d={LINING[collar]} fill="#000" fillOpacity=".18" />
        <g clipPath={`url(#${id("upper")})`}>
          <rect x="0" y="0" width="620" height="320" fill={`url(#${id("knit")})`} />
          <path d={TOE_CAP} fill="#000" fillOpacity=".12" />
          <path d="M452 162C440 178 440 198 452 216" fill="none" stroke={stitchOnUpper} strokeWidth="1.2" strokeDasharray="3 3" />
          <path d={LACE_D[collar]} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="22" />
          <path d={LACE_D[collar]} fill="none" stroke={stitchOnUpper} strokeWidth="1.1" strokeDasharray="3 3" transform="translate(-3 9)" />
        </g>
        <path d={TONGUE[collar]} fill={colors.upper} />
        <path d={TONGUE[collar]} fill="#000" fillOpacity=".18" />
      </g>

      <g style={zoneStyle("accent")}>
        <g clipPath={`url(#${id("upper")})`}>
          <path d={HEEL[collar]} fill={colors.accent} />
          <path d={HEEL_EDGE[collar]} fill="none" stroke={stitchOnAccent} strokeWidth="1.2" strokeDasharray="3 3" transform="translate(5 2)" />
          <path d={TAPE[collar]} fill={colors.accent} />
          <path d={TAPE_STITCH[collar]} fill="none" stroke={stitchOnAccent} strokeWidth="1.1" strokeDasharray="3 3" />
        </g>
        <path d={PULL_TAB[collar]} fill={colors.accent} />
        <path d={PULL_TAB[collar]} fill="#000" fillOpacity=".15" />
      </g>

      {/* Volume shading across the whole upper */}
      <g clipPath={`url(#${id("upper")})`} style={focus ? { opacity: 0.6 } : undefined} pointerEvents="none">
        <rect x="0" y="0" width="620" height="320" fill={`url(#${id("vshade")})`} />
        <rect x="40" y="0" width="550" height="320" fill={`url(#${id("hshade")})`} />
      </g>

      {/* Collar padding */}
      <path
        d={COLLAR[collar]}
        fill="none"
        stroke={colors.upper}
        strokeWidth="7"
        strokeLinecap="round"
        style={zoneStyle("upper")}
      />
      <path d={COLLAR[collar]} fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="2" transform="translate(0 3)" style={focus ? { opacity: 0.3 } : undefined} />

      {/* Laces and eyelets */}
      <g style={zoneStyle("laces")}>
        {LACES[collar].map(({ p, t }, i) => {
          const n: Pt = [t[1], -t[0]];
          const a: Pt = [p[0] - n[0] * 4 - t[0] * 9, p[1] - n[1] * 4 - t[1] * 9];
          const b: Pt = [p[0] + n[0] * 9 + t[0] * 8, p[1] + n[1] * 9 + t[1] * 8];
          const eyelet: Pt = [p[0] - n[0] * 9 + t[0] * 2, p[1] - n[1] * 9 + t[1] * 2];
          return (
            <g key={i}>
              <circle cx={eyelet[0]} cy={eyelet[1]} r="2.8" fill="#0b0b0c" stroke="rgb(255 255 255 / .25)" strokeWidth=".8" />
              <line x1={a[0]} y1={a[1] + 1.5} x2={b[0]} y2={b[1] + 1.5} stroke="#000" strokeOpacity=".35" strokeWidth="7" strokeLinecap="round" />
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={colors.laces} strokeWidth="6.5" strokeLinecap="round" />
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={laceEdge} strokeWidth="1" strokeLinecap="round" transform="translate(0 2)" />
            </g>
          );
        })}
      </g>

      {/* Sole unit */}
      <g style={zoneStyle("outsole")}>
        <path d={soleShapes.out} fill={colors.outsole} />
        {sole === "trail" && (
          <>
            {TRAIL_LUGS.map((x) => (
              <rect key={x} x={x} y={x > 470 ? 248 - (x - 470) * 0.3 : 252} width="18" height="9" rx="2.5" fill={colors.outsole} />
            ))}
            <path d={TOE_BUMPER} fill={colors.outsole} />
          </>
        )}
      </g>
      <g style={zoneStyle("midsole")}>
        <path d={soleShapes.mid} fill={colors.midsole} />
        <path d={soleShapes.mid} fill={`url(#${id("soleShade")})`} />
        <path d={soleShapes.groove} fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="2" />
        {sole === "court" && (
          <path d="M50 232C200 236 400 236 576 232" fill="none" stroke={isLightColor(colors.midsole) ? "rgb(0 0 0 / .3)" : "rgb(255 255 255 / .3)"} strokeWidth="1.2" strokeDasharray="4 3" />
        )}
        <path d={soleShapes.sheen} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
