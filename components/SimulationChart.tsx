
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { DataPoint, ReferenceMarket, TargetIndex } from '../types';

interface SimulationChartProps {
  historyData: DataPoint[];
  alt1Data: DataPoint[];
  alt2Data: DataPoint[];
  alt3Data: DataPoint[];
  referenceData: DataPoint[];
  referenceMarket: ReferenceMarket;
  targetIndex: TargetIndex;
  snapshots?: {
    id: string;
    name: string;
    data: {
      alt1: DataPoint[];
      alt2: DataPoint[];
      alt3: DataPoint[];
    };
  }[];
}

const GenericLabel = (props: any) => {
  const { x, y, value, payload, index, stroke, isRef, actualRefVal, lastTimestamp, midTimestamp, periodicTimestamps } = props;
  if (x === undefined || y === undefined || !payload) return null;

  const dateStr = payload.date || "";
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0]);

  const isStart = index === 0;
  const isLast = payload.timestamp === lastTimestamp;
  const isMiddle = midTimestamp && payload.timestamp === midTimestamp;
  const isPeriodic = periodicTimestamps && periodicTimestamps.has(payload.timestamp);

  // 시작점, 끝점, 중간점, 혹은 지정된 주기(Periodic)에만 레이블 표시
  if (!isStart && !isLast && !isMiddle && !isPeriodic) return null;

  const valToShow = isRef ? (actualRefVal ?? value) : value;
  const displayVal = Math.round(valToShow).toLocaleString();
  
  const dyVal = isRef ? -28 : 32; 

  return (
    <g>
      <circle cx={x} cy={y} r={isStart || isLast ? 4 : 2.5} fill={stroke} stroke="#fff" strokeWidth={1.5} />
      <text x={x} y={y} dy={dyVal} stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fontSize={10} fontWeight="900" textAnchor="middle">{displayVal}</text>
      <text x={x} y={y} dy={dyVal} fill={stroke} fontSize={10} fontWeight="900" textAnchor="middle">{displayVal}</text>
      { (isLast || isStart || isPeriodic) && (
        <text x={x} y={y} dy={dyVal + (isRef ? -10 : 10)} fill="#94a3b8" fontSize={8} fontWeight="bold" textAnchor="middle">
          {isLast ? 'Now' : year}
        </text>
      )}
    </g>
  );
};

const ForecastLabel = (props: any) => {
  const { x, y, value, payload, stroke, lastTimestamp, orientation = 'top', periodicTimestamps, labelType } = props;
  if (x === undefined || y === undefined || !payload) return null;

  const isLast = payload.timestamp === lastTimestamp;
  const isPeriodic = periodicTimestamps && periodicTimestamps.has(payload.timestamp);

  if (!isLast && !isPeriodic) return null;

  const displayVal = Math.round(value).toLocaleString();
  
  let dyVal = 0;
  if (labelType === 'best') dyVal = -16;
  else if (labelType === 'moderate') dyVal = orientation === 'top' ? -14 : 24;
  else if (labelType === 'worst') dyVal = 28;

  return (
    <g>
      <circle cx={x} cy={y} r={isLast ? 3.5 : 2} fill={stroke} stroke="#fff" strokeWidth={1} />
      <rect x={x - 20} y={y + dyVal - 9} width={40} height={12} rx={2} fill="white" stroke={stroke} strokeWidth={0.5} opacity={0.8} />
      <text x={x} y={y + dyVal} fill={stroke} fontSize={8} fontWeight="900" textAnchor="middle" alignmentBaseline="middle">{displayVal}</text>
      {isLast && (
        <text x={x} y={y + dyVal + (dyVal < 0 ? -10 : 16)} fill={stroke} fontSize={7} fontWeight="black" textAnchor="middle">
          {labelType?.toUpperCase()}
        </text>
      )}
    </g>
  );
};

const SimulationChart: React.FC<SimulationChartProps> = ({
  historyData, alt1Data, alt2Data, alt3Data, referenceData, referenceMarket, targetIndex, snapshots
}) => {
  console.log("SimulationChart rendering", { history: historyData.length, alt1: alt1Data.length, ref: referenceData.length });
  const lastHistoryTs = useMemo(() => {
    if (historyData.length === 0) return 0;
    const d = new Date(historyData[historyData.length - 1].timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [historyData]);

  const lastRefTs = useMemo(() => {
    if (referenceData.length === 0) return 0;
    const d = new Date(referenceData[referenceData.length - 1].timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [referenceData]);

  const lastForecastTs = useMemo(() => {
    if (alt1Data.length === 0) return 0;
    const d = new Date(alt1Data[alt1Data.length - 1].timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [alt1Data]);

  const midHistoryTs = useMemo(() => {
    if (historyData.length === 0) return 0;
    const d = new Date(historyData[Math.floor(historyData.length / 2)].timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [historyData]);

  const chartData = useMemo(() => {
    const dataMap = new Map<number, any>();
    const process = (data: DataPoint[], key: string, isRef = false) => {
      if (!data) return;
      data.forEach(pt => {
        const d = new Date(pt.timestamp);
        d.setHours(0, 0, 0, 0);
        const normalizedTs = d.getTime();

        if (!dataMap.has(normalizedTs)) {
          dataMap.set(normalizedTs, { date: pt.date, timestamp: normalizedTs });
        }
        const entry = dataMap.get(normalizedTs);
        if (isRef) entry[`reference_actual`] = pt.value;
        else entry[key] = pt.value;
      });
    };
    process(referenceData, 'reference', true);
    process(historyData, 'history');
    process(alt1Data, 'alt1');
    process(alt2Data, 'alt2');
    process(alt3Data, 'alt3');
    
    if (snapshots) {
      snapshots.forEach(s => {
        process(s.data.alt1, `snap1_${s.id}`);
        process(s.data.alt2, `snap2_${s.id}`);
        process(s.data.alt3, `snap3_${s.id}`);
      });
    }
    
    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [referenceData, historyData, alt1Data, alt2Data, alt3Data, snapshots]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-inner h-[580px] flex items-center justify-center">
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Generating Simulation Data...</p>
      </div>
    );
  }

  const { domain, ticks } = useMemo(() => {
    if (chartData.length === 0) return { domain: [0, 0], ticks: [] };
    
    const startTs = chartData[0].timestamp;
    const endTs = chartData[chartData.length - 1].timestamp;
    
    const startYear = new Date(startTs).getFullYear();
    const endYear = new Date(endTs).getFullYear();
    
    const generatedTicks = [];
    for (let year = startYear; year <= endYear; year++) {
      generatedTicks.push(new Date(year, 0, 1).getTime());
    }
    
    return { domain: [startTs, endTs], ticks: generatedTicks };
  }, [chartData]);

  const referencePeriodicTimestamps = useMemo(() => {
    const set = new Set<number>();
    const seenYears = new Set<number>();
    if (referenceData && referenceData.length > 0) {
      referenceData.forEach(d => {
        const parts = d.date.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        if (month === 1 && year % 4 === 0 && !seenYears.has(year)) {
          seenYears.add(year);
          const dt = new Date(d.timestamp);
          dt.setHours(0, 0, 0, 0);
          set.add(dt.getTime());
        }
      });
    }
    return set;
  }, [referenceData]);

  const forecastPeriodicTimestamps = useMemo(() => {
    const set = new Set<number>();
    const seenYears = new Set<number>();
    if (alt1Data && alt1Data.length > 0) {
      alt1Data.forEach(d => {
        const parts = d.date.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        if (month === 6 && !seenYears.has(year)) {
          seenYears.add(year);
          const dt = new Date(d.timestamp);
          dt.setHours(0, 0, 0, 0);
          set.add(dt.getTime());
        }
      });
    }
    return set;
  }, [alt1Data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      return (
        <div className="bg-white/95 border border-slate-200 p-3 rounded shadow-2xl text-[11px] backdrop-blur-md z-50 ring-1 ring-slate-200">
          <p className="font-black border-b border-slate-100 pb-1.5 mb-2.5 text-slate-900 uppercase tracking-tight">{date}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-slate-500 font-bold">
                  <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: entry.color }}></span>
                  {entry.dataKey === 'reference_actual' ? referenceMarket : entry.name}
                </span>
                <span className="font-mono font-black text-slate-900">{Math.round(entry.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-2 md:p-6 rounded-3xl border border-slate-200 shadow-sm h-[580px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 40, right: 50, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="timestamp" 
            type="number"
            scale="time"
            domain={domain}
            ticks={ticks}
            tickFormatter={(ts) => new Date(ts).getFullYear().toString()} 
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, angle: -45, textAnchor: 'end' }} 
            axisLine={{ stroke: '#e2e8f0' }}
            interval={0}
          />
          <YAxis 
            yAxisId="left" 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 800 }} 
            axisLine={false}
            tickLine={false}
            label={{ value: `${targetIndex} INDEX`, angle: -90, position: 'insideLeft', offset: -5, fill: '#0f172a', fontSize: 11, fontWeight: 900, letterSpacing: '0.05em' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
            axisLine={false}
            tickLine={false}
            label={{ value: `${referenceMarket} REF`, angle: 90, position: 'insideRight', offset: -5, fill: '#94a3b8', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }} />
          
          {alt1Data.length > 0 && (
            <ReferenceArea 
              yAxisId="left" 
              x1={alt1Data[0].timestamp} 
              x2={alt1Data[alt1Data.length - 1].timestamp} 
              fill="#f1f5f9" 
              fillOpacity={0.6} 
              label={{ 
                value: "FORECAST", 
                position: "insideTop", 
                fill: "#64748b", 
                fontSize: 11, 
                fontWeight: 900, 
                dy: 25, 
                letterSpacing: '0.2em' 
              }} 
            />
          )}

          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="reference_actual" 
            name={`${referenceMarket}`} 
            stroke="#cbd5e1" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
            connectNulls 
            label={(p: any) => <GenericLabel {...p} stroke="#94a3b8" isRef={true} lastTimestamp={lastRefTs} periodicTimestamps={referencePeriodicTimestamps} />} 
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="history" 
            name="History" 
            stroke="#0f172a" 
            strokeWidth={3} 
            dot={false} 
            connectNulls 
            label={(p: any) => <GenericLabel {...p} stroke="#0f172a" isRef={false} lastTimestamp={lastHistoryTs} midTimestamp={midHistoryTs} />} 
          />
          
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="alt1" 
            name="Worst" 
            stroke="#f43f5e" 
            strokeWidth={2.5} 
            strokeDasharray="6 4" 
            dot={false} 
            label={(p: any) => <ForecastLabel {...p} stroke="#f43f5e" lastTimestamp={lastForecastTs} orientation="bottom" labelType="worst" periodicTimestamps={forecastPeriodicTimestamps} />} 
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="alt2" 
            name="Moderate" 
            stroke="#2563eb" 
            strokeWidth={3.5} 
            dot={false} 
            label={(p: any) => <ForecastLabel {...p} stroke="#2563eb" lastTimestamp={lastForecastTs} orientation="top" labelType="moderate" periodicTimestamps={forecastPeriodicTimestamps} />} 
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="alt3" 
            name="Best" 
            stroke="#10b981" 
            strokeWidth={3.5} 
            dot={false} 
            label={(p: any) => <ForecastLabel {...p} stroke="#10b981" lastTimestamp={lastForecastTs} orientation="top" labelType="best" periodicTimestamps={forecastPeriodicTimestamps} />} 
          />

          {snapshots && snapshots.map(s => (
            <React.Fragment key={s.id}>
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey={`snap1_${s.id}`} 
                name={`${s.name} (Worst)`} 
                stroke="#f43f5e" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                dot={false} 
                opacity={0.3}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey={`snap2_${s.id}`} 
                name={`${s.name} (Moderate)`} 
                stroke="#2563eb" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                dot={false} 
                opacity={0.3}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey={`snap3_${s.id}`} 
                name={`${s.name} (Best)`} 
                stroke="#10b981" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                dot={false} 
                opacity={0.3}
              />
            </React.Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;
