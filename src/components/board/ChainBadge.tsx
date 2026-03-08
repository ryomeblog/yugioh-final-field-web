interface ChainBadgeProps {
  number: number;
  size?: number;
  x: number;
  y: number;
}

export function ChainBadge({ number, size = 20, x, y }: ChainBadgeProps) {
  const r = size / 2;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#e94560" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.55}
        fontWeight="bold"
      >
        {number}
      </text>
    </g>
  );
}
