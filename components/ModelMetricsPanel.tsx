
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { Sparkles, Activity, Target, BarChart3, Info } from 'lucide-react';
import { ModelMetrics, ModelType, SimulationConfig } from '../types';

interface ModelMetricsPanelProps {
  metrics: ModelMetrics;
  modelType: ModelType;
  config: SimulationConfig;
}

const ModelMetricsPanel: React.FC<ModelMetricsPanelProps> = ({ metrics, modelType, config }) => {
  const isAI = ['LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'].includes(modelType);
  
  // Find current model data in comparisonData if available
  const currentModelData = metrics.comparisonData?.find(m => m.name === modelType);
  
  // Use comparisonData values if available, otherwise fallback to top-level metrics
  const displayMetrics = {
    mse: currentModelData?.mse ?? metrics.mse ?? 0,
    rmse: currentModelData?.rmse ?? metrics.rmse ?? 0,
    mae: currentModelData?.mae ?? metrics.mae ?? 0,
    mape: currentModelData?.mape ?? metrics.mape ?? 0,
    rSquared: currentModelData?.rSquared ?? metrics.rSquared ?? 0,
    adjustedRSquared: currentModelData?.adjustedRSquared ?? metrics.adjustedRSquared ?? 0,
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            Model Regression Performance
          </h3>
          <p className="text-[9px] text-slate-400 mb-4 leading-relaxed">
            모델의 예측 정확도를 회귀 분석 지표로 평가합니다.
          </p>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">R² / Adj. R²</p>
                <p className="text-lg font-black text-indigo-600">
                  {(displayMetrics.rSquared * 100).toFixed(2)}% / {(displayMetrics.adjustedRSquared * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">RMSE</p>
                <p className="text-lg font-black text-emerald-600">{displayMetrics.rmse.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">MSE</span>
                <span className="text-[10px] font-black text-slate-700">{displayMetrics.mse.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">MAE</span>
                <span className="text-[10px] font-black text-slate-700">{displayMetrics.mae.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">MAPE</span>
                <span className="text-[10px] font-black text-slate-700">{(displayMetrics.mape * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
              <div className="group relative">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  Comparison Index
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-black text-slate-800">x{metrics.comparisonIndex.toFixed(2)}</p>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">vs. Market</span>
                </div>
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
              <Target className="w-3.5 h-3.5 text-rose-500" />
              Feature Importance (SHAP Analysis)
            </h3>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
              각 변수가 예측 결과에 미치는 영향력을 분석합니다. 변수별 기여도를 통해 모델이 어떤 핵심 요인을 바탕으로 시장을 분석하고 있는지 투명하게 확인할 수 있습니다.
            </p>
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

      {/* Algorithm Comparison Chart - Only for AI Models */}

      {/* Algorithm Comparison Chart - Only for AI Models */}
      {metrics.comparisonData && !['CAPM', 'FamaFrench3', 'FamaFrench5', 'FamaFrench7'].includes(modelType) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              Algorithm Performance Comparison (AI/ML)
            </h3>
            <div className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Current: <span className="text-indigo-600">{modelType}</span>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#4f46e5' }} 
                  domain={[0, 1]}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#f59e0b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="rSquared" name="R²" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#4f46e5', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }}>
                  {metrics.comparisonData.map((entry, index) => (
                    <Cell key={`cell-r2-${index}`} fill={entry.name === modelType ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
                <Bar yAxisId="left" dataKey="adjustedRSquared" name="Adj. R²" radius={[4, 4, 0, 0]} barSize={15}>
                  {metrics.comparisonData.map((entry, index) => (
                    <Cell key={`cell-adjr2-${index}`} fill={entry.name === modelType ? '#818cf8' : '#cbd5e1'} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="rmse" name="RMSE" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#f59e0b', formatter: (v: number) => v.toFixed(2) }} />
                <Bar yAxisId="right" dataKey="mae" name="MAE" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#10b981', formatter: (v: number) => v.toFixed(2) }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-500">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">R² (결정계수):</p>
              <p>모델이 데이터의 변동성을 얼마나 잘 설명하는지 나타냅니다. 100%에 가까울수록 모델의 데이터 설명력이 우수합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">Adjusted R² (수정된 결정계수):</p>
              <p>변수의 개수를 고려하여 R²를 보정한 값입니다. 변수가 늘어날 때 발생하는 R²의 과대평가 문제를 방지하여 모델의 실제 성능을 더 정확히 평가합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">RMSE (Root Mean Squared Error):</p>
              <p>오차의 제곱 평균에 루트를 씌운 값입니다. 오차를 제곱하므로 <strong>큰 오차가 발생할 때 페널티가 커져</strong>, 큰 오차를 피하는 것이 중요할 때 유용합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">MAE (Mean Absolute Error):</p>
              <p>오차의 절대값 평균입니다. 오차의 크기를 그대로 반영하므로, <strong>안정적이고 일관된 예측 성능</strong>을 평가할 때 직관적인 지표로 활용됩니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">MSE (Mean Squared Error):</p>
              <p>오차의 제곱 평균입니다. 오차의 크기를 제곱하여 페널티를 부여하며, 모델의 최적화 과정에서 주로 사용되는 지표입니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">MAPE (Mean Absolute Percentage Error):</p>
              <p>오차의 절대값을 실제값으로 나눈 평균 백분율입니다. 오차의 상대적 크기를 백분율로 나타내어 서로 다른 규모의 데이터 간 성능 비교에 유용합니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Ensemble Rationale */}
      {modelType === 'Ensemble' && metrics.ensembleWeights && (
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
            {Object.entries(metrics.ensembleWeights).map(([key, val]) => (
              <div key={key} className="bg-white p-2 rounded-lg border border-indigo-50 text-center shadow-sm group relative">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{key}</p>
                <p className="text-[11px] font-black text-indigo-600">{(val as number * 100).toFixed(0)}%</p>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 text-white text-[7px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  {key === 'lstm' && '장기 시계열 의존성 및 추세 추종에 강점'}
                  {key === 'gru' && '순차적 데이터의 효율적 패턴 인식 및 빠른 수렴'}
                  {key === 'xgb' && '비선형적 변동성 및 정형 데이터 분석의 높은 견고성'}
                  {key === 'lgbm' && '대규모 데이터셋의 고속 처리 및 정밀한 예측 성능'}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelMetricsPanel;
