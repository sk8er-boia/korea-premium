
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles } from 'lucide-react';
import { ModelMetrics, ModelType, SimulationConfig } from '../types';

interface ModelMetricsPanelProps {
  metrics: ModelMetrics;
  modelType: ModelType;
  config: SimulationConfig;
}

const ModelMetricsPanel: React.FC<ModelMetricsPanelProps> = ({ metrics, modelType, config }) => {
  const isAI = ['LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'].includes(modelType);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            Model Performance Indicators
          </h3>
          
          <div className="space-y-6">
            {isAI ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] font-bold text-slate-600">Prediction Accuracy (R²)</span>
                    <span className="text-xl font-black text-indigo-600">{(metrics.accuracy! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-1000" 
                      style={{ width: `${metrics.accuracy! * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] font-bold text-slate-600">ROC AUC (Area Under Curve)</span>
                    <span className="text-xl font-black text-emerald-600">{(metrics.rocAuc! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000" 
                      style={{ width: `${metrics.rocAuc! * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Explanatory Power (Adj. R²)</span>
                  <span className="text-xl font-black text-emerald-600">{(metrics.explanatoryPower! * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000" 
                    style={{ width: `${metrics.explanatoryPower! * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
              <div className="group relative">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  Comparison Index
                  <svg className="w-2.5 h-2.5 text-slate-300 cursor-help" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-black text-slate-800">x{metrics.comparisonIndex.toFixed(2)}</p>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">vs. Base</span>
                </div>
                <p className="text-[8px] text-slate-400 font-medium leading-tight mt-1.5">
                  통계적 베이스라인 대비 모델의 패턴 포착 정밀도 지수입니다.
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Model Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SHAP / Feature Importance */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
              Feature Importance (SHAP Analysis)
            </h3>
            <div className="flex gap-2">
              {isAI && (
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  FF7-Augmented Framework
                </span>
              )}
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                {isAI ? 'Non-linear Attribution' : 'Factor Contribution'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {metrics.shapValues.map((shap, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-700">{shap.feature}</span>
                  <span className="text-slate-400 font-mono">{(shap.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-sm overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-1000 ${idx % 2 === 0 ? 'bg-indigo-400' : 'bg-rose-400'}`}
                    style={{ width: `${(shap.importance / metrics.shapValues[0].importance) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Comparison Chart */}
      {metrics.comparisonData && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Algorithm Performance Comparison (AI/ML)
            </h3>
            <div className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Current: <span className="text-indigo-600">{modelType}</span>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  domain={[0, 1]}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="accuracy" name="Accuracy (R²)" radius={[4, 4, 0, 0]} barSize={30} label={{ position: 'top', fontSize: 9, fontWeight: 800, fill: '#4f46e5', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }}>
                  {metrics.comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === modelType ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
                <Bar dataKey="auc" name="ROC AUC" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} opacity={0.6} label={{ position: 'top', fontSize: 9, fontWeight: 800, fill: '#10b981', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Accuracy (R²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 opacity-60 rounded-sm"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">ROC AUC</span>
            </div>
          </div>

          {/* Ensemble Rationale */}
          <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Bayesian Ensemble Rationale (가중치 최적화 근거)
              </h4>
              <div className="text-[9px] font-bold text-indigo-500 bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                Dynamic Optimization Active
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {metrics.ensembleWeights && Object.entries(metrics.ensembleWeights).map(([key, val]) => (
                <div key={key} className="bg-white p-2 rounded-lg border border-indigo-50 text-center shadow-sm group relative">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{key}</p>
                  <p className="text-[11px] font-black text-indigo-600">{(val as number * 100).toFixed(0)}%</p>
                  
                  {/* Tooltip for Algorithm Characteristics */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 text-white text-[7px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    {key === 'LSTM' && '장기 시계열 의존성 및 추세 추종에 강점'}
                    {key === 'GRU' && '순차적 데이터의 효율적 패턴 인식 및 빠른 수렴'}
                    {key === 'XGBoost' && '비선형적 변동성 및 정형 데이터 분석의 높은 견고성'}
                    {key === 'LightGBM' && '대규모 데이터셋의 고속 처리 및 정밀한 예측 성능'}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                본 시뮬레이터의 앙상블 모델은 시장 환경(변동성, 전망 기간)을 실시간으로 분석하여 베이시안 최적화 가중치를 동적으로 조정합니다. 
                {config.volatility > 7 ? (
                  <span className="text-indigo-700 font-bold"> [고변동성 감지] 시장의 비선형적 점프를 포착하기 위해 Boosting 계열(XGB/LGBM)의 가중치를 상향 조정했습니다.</span>
                ) : config.volatility < 3 ? (
                  <span className="text-indigo-700 font-bold"> [저변동성 감지] 안정적인 추세 추종을 위해 순환 신경망(LSTM/GRU)의 가중치를 강화했습니다.</span>
                ) : (
                  <span> 표준 시장 환경에 최적화된 균형 가중치를 적용 중입니다.</span>
                )}
                {config.durationMonths > 84 && (
                  <span className="text-indigo-700 font-bold"> 또한, 장기 전망 기간(7년 이상)에 따라 시계열 의존성이 높은 LSTM의 비중을 추가로 확보했습니다.</span>
                )}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-100/50">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">RNN Core (LSTM/GRU)</span>
                  <p className="text-[8px] text-slate-500 leading-tight">시계열 데이터의 순차적 흐름을 학습하여 중장기적 추세(Trend)를 형성합니다.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Boosting Core (XGB/LGBM)</span>
                  <p className="text-[8px] text-slate-500 leading-tight">거시 경제 변수 간의 복잡한 상관관계를 분석하여 단기적 변동성(Shock)에 대응합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelMetricsPanel;
