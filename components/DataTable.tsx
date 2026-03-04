
import React, { useMemo } from 'react';
import { DataPoint, ReferenceMarket, TargetIndex } from '../types';

interface DataTableProps {
  historyData: DataPoint[];
  referenceData: DataPoint[];
  referenceMarket: ReferenceMarket;
  targetIndex: TargetIndex;
  alt1Data: DataPoint[];
  alt2Data: DataPoint[];
  alt3Data: DataPoint[];
}

const DataTable: React.FC<DataTableProps> = ({ 
  historyData, 
  referenceData, 
  referenceMarket, 
  targetIndex,
  alt1Data, 
  alt2Data, 
  alt3Data 
}) => {
  const tableData = useMemo(() => {
    const milestones: any[] = [];
    
    // 역사적 데이터 선별 (2010 ~ 2024년 말)
    const historyYears = [2010, 2013, 2016, 2019, 2022, 2024];
    historyYears.forEach(year => {
      const targetPoint = historyData.find(d => d.date.startsWith(`${year}-12`)) || 
                          historyData.find(d => d.date.startsWith(`${year}`));
      const refPoint = referenceData.find(d => d.date.startsWith(`${year}-12`)) || 
                       referenceData.find(d => d.date.startsWith(`${year}`));
      
      if (targetPoint) {
        milestones.push({
          date: `${year} Year-end`,
          reference: refPoint ? refPoint.value : null,
          history: targetPoint.value,
          worst: null,
          moderate: null,
          best: null,
          isHistory: true
        });
      }
    });

    // 2025년 말 (Base point)
    const baseTarget = historyData.find(d => d.date === '2025-12-31') || historyData[historyData.length - 1];
    const baseRef = referenceData.find(d => d.date === '2025-12-31') || referenceData[referenceData.length - 1];
    if (baseTarget) {
      milestones.push({
        date: '2025-12 (Base)',
        reference: baseRef ? baseRef.value : null,
        history: baseTarget.value,
        worst: baseTarget.value,
        moderate: baseTarget.value,
        best: baseTarget.value,
        isBase: true
      });
    }

    // 전망 데이터 선별 (2026 ~ 2030년, 분기별)
    const forecastYears = [2026, 2027, 2028, 2029, 2030];
    const quarters = ['03', '06', '09', '12'];
    
    forecastYears.forEach(year => {
      quarters.forEach(q => {
        const prefix = `${year}-${q}`;
        const idx1 = alt1Data.find(d => d.date.startsWith(prefix));
        const idx2 = alt2Data.find(d => d.date.startsWith(prefix));
        const idx3 = alt3Data.find(d => d.date.startsWith(prefix));
        
        if (idx1 && idx2 && idx3) {
          milestones.push({
            date: `${year}-${q}`,
            reference: null,
            history: null,
            worst: idx1.value,
            moderate: idx2.value,
            best: idx3.value,
            isForecast: true
          });
        }
      });
    });

    return milestones;
  }, [historyData, referenceData, alt1Data, alt2Data, alt3Data]);

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          Milestone Trend Summary (2010 - 2030)
        </h3>
        <span className="text-[9px] font-bold text-slate-400">Values based on Closing Prices (Point)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Timeline</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-50/20 italic">{referenceMarket} Closing</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-900 uppercase tracking-wider bg-slate-50/50">Historical ({targetIndex})</th>
              <th className="px-5 py-3 text-[10px] font-black text-rose-500 uppercase tracking-wider">Worst (Trap)</th>
              <th className="px-5 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-wider">Moderate (Base)</th>
              <th className="px-5 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-wider">Best (Target)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className={`border-b border-slate-50 transition-colors hover:bg-slate-50/30 ${row.isBase ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-5 py-2.5">
                  <span className={`text-[11px] font-bold ${row.isForecast ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {row.date}
                  </span>
                </td>
                <td className="px-5 py-2.5 font-mono text-[11px] text-slate-400 italic">
                  {row.reference ? Math.round(row.reference).toLocaleString() : '-'}
                </td>
                <td className="px-5 py-2.5 bg-slate-50/30 font-mono text-[11px] font-bold text-slate-900">
                  {row.history ? Math.round(row.history).toLocaleString() : '-'}
                </td>
                <td className="px-5 py-2.5 font-mono text-[11px] font-bold text-rose-500">
                  {row.worst ? Math.round(row.worst).toLocaleString() : '-'}
                </td>
                <td className="px-5 py-2.5 font-mono text-[11px] font-bold text-indigo-700">
                  {row.moderate ? Math.round(row.moderate).toLocaleString() : '-'}
                </td>
                <td className="px-5 py-2.5 font-mono text-[11px] font-bold text-emerald-600">
                  {row.best ? Math.round(row.best).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-5 py-2 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-medium italic">
          * 2025년 12월 말 종가를 Base로 설정하여 2026년 1월부터 2030년 12월까지의 시나리오별 전망치를 산출했습니다.
        </p>
      </div>
    </div>
  );
};

export default DataTable;
