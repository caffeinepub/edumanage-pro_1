// Dependency-free chart components using SVG + CSS

interface BarChartDataPoint {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

interface LineChartDataPoint {
  label: string;
  value: number;
}

interface RadarChartDataPoint {
  skill: string;
  value: number; // 0-100
}

// ============================================================
// Simple Bar Chart
// ============================================================
export function SimpleBarChart({
  data,
  height = 200,
  title,
}: {
  data: BarChartDataPoint[];
  height?: number;
  title?: string;
}) {
  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data available
      </div>
    );

  const maxVal = Math.max(...data.map((d) => d.max ?? d.value), 1);
  const barColors = [
    "oklch(0.48 0.15 264)",
    "oklch(0.55 0.15 150)",
    "oklch(0.65 0.16 70)",
    "oklch(0.58 0.15 210)",
    "oklch(0.577 0.245 27)",
    "oklch(0.5 0.18 300)",
  ];

  return (
    <div>
      {title && (
        <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
      )}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
            >
              <span className="text-xs font-semibold text-foreground">
                {d.value}
              </span>
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: d.color ?? barColors[i % barColors.length],
                  minHeight: "4px",
                }}
              />
              <span
                className="text-xs text-muted-foreground text-center leading-tight"
                style={{ maxWidth: "60px", wordBreak: "break-word" }}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Simple Line Chart (SVG polyline)
// ============================================================
export function SimpleLineChart({
  data,
  height = 160,
  title,
  color = "oklch(0.48 0.15 264)",
}: {
  data: LineChartDataPoint[];
  height?: number;
  title?: string;
  color?: string;
}) {
  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data available
      </div>
    );

  const W = 400;
  const H = height;
  const PAD = 30;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const toX = (i: number) =>
    PAD + (i / Math.max(data.length - 1, 1)) * (W - 2 * PAD);
  const toY = (v: number) => PAD + (1 - (v - minVal) / range) * (H - 2 * PAD);

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const areaPoints = `${toX(0)},${H - PAD} ${data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ")} ${toX(data.length - 1)},${H - PAD}`;

  return (
    <div>
      {title && (
        <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
      )}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD + frac * (H - 2 * PAD);
          return (
            <line
              key={frac}
              x1={PAD}
              y1={y}
              x2={W - PAD}
              y2={y}
              stroke="oklch(0.88 0.02 264)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}
        {/* Area fill */}
        <polygon points={areaPoints} fill={color} fillOpacity="0.1" />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots + labels */}
        {data.map((d, i) => (
          <g key={d.label}>
            <circle
              cx={toX(i)}
              cy={toY(d.value)}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            />
            <text
              x={toX(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="oklch(0.5 0.04 264)"
            >
              {d.label}
            </text>
            <text
              x={toX(i)}
              y={toY(d.value) - 8}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="oklch(0.28 0.12 264)"
            >
              {d.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// Simple Radar Chart (SVG polygon)
// ============================================================
export function SimpleRadarChart({
  data,
  size = 200,
  title,
}: {
  data: RadarChartDataPoint[];
  size?: number;
  title?: string;
}) {
  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data available
      </div>
    );

  const CX = size / 2;
  const CY = size / 2;
  const R = (size / 2) * 0.7;
  const n = data.length;

  const angleFor = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const ptFor = (i: number, frac: number) => {
    const a = angleFor(i);
    return {
      x: CX + Math.cos(a) * R * frac,
      y: CY + Math.sin(a) * R * frac,
    };
  };

  // Background circles
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon
  const dataPoints = data
    .map((d, i) => ptFor(i, d.value / 100))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Label positions
  const labelPts = data.map((d, i) => {
    const pt = ptFor(i, 1.25);
    return { ...pt, label: d.skill, value: d.value };
  });

  return (
    <div>
      {title && (
        <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
      )}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative chart */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full"
        style={{ height: size }}
      >
        {/* Background rings */}
        {rings.map((frac) => {
          const rPts = Array.from({ length: n }, (_, i) => ptFor(i, frac))
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polygon
              key={`ring-${frac}`}
              points={rPts}
              fill="none"
              stroke="oklch(0.88 0.02 264)"
              strokeWidth="1"
            />
          );
        })}
        {/* Axis lines */}
        {data.map((d, i) => {
          const outer = ptFor(i, 1);
          return (
            <line
              key={`axis-${d.skill}`}
              x1={CX}
              y1={CY}
              x2={outer.x}
              y2={outer.y}
              stroke="oklch(0.88 0.02 264)"
              strokeWidth="1"
            />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="oklch(0.48 0.15 264)"
          fillOpacity="0.25"
          stroke="oklch(0.48 0.15 264)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Data dots */}
        {data.map((d, i) => {
          const pt = ptFor(i, d.value / 100);
          return (
            <circle
              key={`dot-${d.skill}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="oklch(0.48 0.15 264)"
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Labels */}
        {labelPts.map((lp) => (
          <text
            key={lp.label}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="600"
            fill="oklch(0.28 0.12 264)"
          >
            {lp.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
