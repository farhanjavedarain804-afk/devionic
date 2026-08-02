/** SVG wireframe globe — orthographic projection, rotates in place. */
export function WireframeGlobe({ size = 300 }: { size?: number }) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  // Latitude ellipses (horizontal rings)
  const lats = [-60, -40, -20, 0, 20, 40, 60];
  // Longitude ellipses (vertical rings) — rendered as ellipses with varying rx
  const lons = [-75, -50, -25, 0, 25, 50, 75];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="animate-rotate-globe"
      style={{ width: size, height: size, filter: "drop-shadow(0 0 30px oklch(0.82 0.16 180 / 0.7))" }}
      aria-hidden
    >
      <defs>
        <radialGradient id="globeFill" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="oklch(0.88 0.19 175)" stopOpacity="0.35" />
          <stop offset="55%" stopColor="oklch(0.30 0.10 220)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 240)" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="globeHi" cx="30%" cy="25%" r="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <pattern id="dots" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="oklch(0.88 0.19 175 / 0.6)" />
        </pattern>
        <clipPath id="sphereClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Base sphere */}
      <circle cx={cx} cy={cy} r={r} fill="url(#globeFill)" />
      {/* Continents suggestion via dot pattern, masked to a soft blob */}
      <g clipPath="url(#sphereClip)" opacity="0.85">
        <ellipse cx={cx - 30} cy={cy - 20} rx={r * 0.65} ry={r * 0.5} fill="url(#dots)" opacity="0.7" />
        <ellipse cx={cx + 40} cy={cy + 30} rx={r * 0.5} ry={r * 0.35} fill="url(#dots)" opacity="0.55" />
      </g>

      {/* Latitude rings */}
      {lats.map((lat) => {
        const rad = (lat * Math.PI) / 180;
        const rx = r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return (
          <ellipse
            key={`lat-${lat}`}
            cx={cx}
            cy={y}
            rx={rx}
            ry={rx * 0.18}
            fill="none"
            stroke="oklch(0.88 0.19 175)"
            strokeOpacity={lat === 0 ? 0.55 : 0.28}
            strokeWidth={lat === 0 ? 1 : 0.7}
          />
        );
      })}
      {/* Longitude rings */}
      {lons.map((lon) => {
        const rad = (lon * Math.PI) / 180;
        const rx = Math.max(2, Math.abs(r * Math.sin(rad)));
        return (
          <ellipse
            key={`lon-${lon}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={r}
            fill="none"
            stroke="oklch(0.88 0.19 175)"
            strokeOpacity={lon === 0 ? 0.5 : 0.22}
            strokeWidth={lon === 0 ? 1 : 0.7}
          />
        );
      })}

      {/* Outer rim */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.88 0.19 175)" strokeOpacity="0.7" strokeWidth="1" />
      {/* Specular highlight */}
      <circle cx={cx} cy={cy} r={r} fill="url(#globeHi)" />
    </svg>
  );
}