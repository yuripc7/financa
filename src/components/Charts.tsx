import { useEffect, useRef, useMemo } from 'react';
import { useAnimatedValue } from '../hooks/useAnimatedValue';
import { numParts } from '../utils';

// ─── Donut chart ──────────────────────────────────────────────────────
interface DonutSlice { id?: string; amount: number; color: string; label?: string; }
interface DonutProps { data: DonutSlice[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string; }

export function Donut({ data, size = 180, thickness = 22, centerLabel, centerValue }: DonutProps) {
  const total = data.reduce((s, d) => s + d.amount, 0) || 1;
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const t = useAnimatedValue(1, 900);
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness * 0.45}/>
        {data.map((d, i) => {
          const frac = d.amount / total;
          const len = c * frac * t;
          const seg = (
            <circle key={d.id || i} cx={size/2} cy={size/2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c}`} strokeDashoffset={-offset}
              strokeLinecap="butt"/>
          );
          offset += c * frac;
          return seg;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          {centerLabel && <div className="fnz-eyebrow">{centerLabel}</div>}
          {centerValue && <div className="fnz-mono" style={{ fontSize: size * 0.18, fontWeight:700, marginTop:4, letterSpacing:'-0.02em' }}>{centerValue}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────
interface SparklineProps { values: number[]; width?: number; height?: number; color?: string; fill?: boolean; strokeWidth?: number; }

export function Sparkline({ values, width=120, height=40, color='var(--accent)', fill=true, strokeWidth=2 }: SparklineProps) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pad = 2;
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2));
  const ys = values.map(v => pad + (1 - (v - min) / range) * (height - pad * 2));
  const d = xs.map((x, i) => `${i===0?'M':'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const fillD = `${d} L${xs[xs.length-1].toFixed(1)},${height} L${xs[0].toFixed(1)},${height} Z`;
  const ref = useRef<SVGPathElement>(null);
  const key = values.join('|');
  useEffect(() => {
    if (!ref.current) return;
    const len = ref.current.getTotalLength();
    ref.current.style.strokeDasharray = `${len}`;
    ref.current.style.strokeDashoffset = `${len}`;
    ref.current.getBoundingClientRect();
    ref.current.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.7,.3,1)';
    ref.current.style.strokeDashoffset = '0';
  }, [key]);
  const gId = useMemo(() => 'sg-' + Math.random().toString(36).slice(2,7), []);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      {fill && (
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
      )}
      {fill && <path d={fillD} fill={`url(#${gId})`}/>}
      <path ref={ref} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────
interface LineDataPoint { value: number; label: string | number; }
interface LineChartProps { data: LineDataPoint[]; width?: number; height?: number; color?: string; showAxis?: boolean; forecastFrom?: number; }

export function LineChart({ data, width=300, height=140, color='var(--ink)', showAxis=false, forecastFrom }: LineChartProps) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.value);
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pad = { x: showAxis ? 36 : 8, y: 8, r: 8, b: showAxis ? 24 : 8 };
  const w = width - pad.x - pad.r, h = height - pad.y - pad.b;
  const xs = data.map((_, i) => pad.x + (i / (data.length - 1)) * w);
  const ys = data.map(d => pad.y + (1 - (d.value - min) / range) * h);
  const path = xs.map((x, i) => `${i===0?'M':'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const zero = pad.y + (1 - (0 - min) / range) * h;
  const fillPath = `${path} L${xs[xs.length-1].toFixed(1)},${Math.min(zero, height - pad.b)} L${xs[0].toFixed(1)},${Math.min(zero, height - pad.b)} Z`;
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const len = ref.current.getTotalLength();
    ref.current.style.strokeDasharray = `${len}`;
    ref.current.style.strokeDashoffset = `${len}`;
    ref.current.getBoundingClientRect();
    ref.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.3,1)';
    ref.current.style.strokeDashoffset = '0';
  }, [data.map(d=>d.value).join('|')]);
  const gId = useMemo(() => 'lc-' + Math.random().toString(36).slice(2,7), []);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {min < 0 && max > 0 && (
        <line x1={pad.x} y1={zero} x2={width-pad.r} y2={zero} stroke="var(--line-2)" strokeWidth={0.5} strokeDasharray="4 4"/>
      )}
      <path d={fillPath} fill={`url(#${gId})`}/>
      {forecastFrom != null && xs[forecastFrom] != null && (
        <line x1={xs[forecastFrom]} y1={pad.y} x2={xs[forecastFrom]} y2={height-pad.b}
          stroke="var(--muted-2)" strokeWidth={1} strokeDasharray="3 3"/>
      )}
      <path ref={ref} d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {showAxis && (
        <>
          {[min, (min+max)/2, max].map((v, i) => (
            <text key={i} x={pad.x - 4} y={pad.y + (1 - (v - min) / range) * h + 4}
              fill="var(--muted)" fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">
              {Math.abs(v) >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)}
            </text>
          ))}
        </>
      )}
    </svg>
  );
}

// ─── Bar pair chart ───────────────────────────────────────────────────
interface BarPairData { label: string; income: number; expense: number; }
interface BarPairProps { data: BarPairData[]; width?: number; height?: number; }

export function BarPair({ data, width=300, height=150 }: BarPairProps) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense])) || 1;
  const bw = (width / data.length) * 0.35;
  const gap = 3;
  const tick = useAnimatedValue(1, 900);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const cx = (i + 0.5) * (width / data.length);
        const ih = ((d.income / maxVal) * (height - 24)) * tick;
        const eh = ((d.expense / maxVal) * (height - 24)) * tick;
        return (
          <g key={i}>
            <rect x={cx - bw - gap/2} y={height - 24 - ih} width={bw} height={ih}
              fill="var(--gain)" rx={3} opacity={0.85}/>
            <rect x={cx + gap/2} y={height - 24 - eh} width={bw} height={eh}
              fill="var(--accent)" rx={3} opacity={0.85}/>
            <text x={cx} y={height - 8} fill="var(--muted)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-mono)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────
interface ProgressRingProps { value: number; size?: number; thickness?: number; color?: string; }

export function ProgressRing({ value, size=80, thickness=6, color='var(--accent)' }: ProgressRingProps) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const animated = useAnimatedValue(value, 1200);
  const dash = Math.max(0, Math.min(1, animated)) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: 'none' }}/>
    </svg>
  );
}

// ─── Big number ───────────────────────────────────────────────────────
export function BigNumber({ value }: { value: number }) {
  const v = useAnimatedValue(value, 800);
  const { sign, intStr, cents } = numParts(v);
  return (
    <span>
      <span style={{ fontWeight:400, opacity:0.45, paddingRight:'0.05em' }}>{sign}R$</span>
      {intStr}
      <span style={{ fontSize:'0.45em', opacity:0.45, fontWeight:500, paddingLeft:'0.06em', verticalAlign:'top' }}>,{cents}</span>
    </span>
  );
}
