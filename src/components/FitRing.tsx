type Props = {
  pct: number;
  fillColor: string;
  textColor: string;
};

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FitRing({ pct, fillColor, textColor }: Props) {
  const filled = (pct / 100) * CIRCUMFERENCE;
  return (
    <div className="fit-display">
      <div className="fit-arc">
        <svg width={56} height={56} viewBox="0 0 56 56">
          <circle
            cx={28} cy={28} r={RADIUS}
            fill="none" stroke="#E4E7ED" strokeWidth={6}
          />
          <circle
            cx={28} cy={28} r={RADIUS}
            fill="none"
            stroke={fillColor}
            strokeWidth={6}
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <div className="fit-text">
        <span className="fit-pct" style={{ color: textColor }}>{pct}%</span>
        <span className="fit-lbl">相性度</span>
      </div>
    </div>
  );
}
