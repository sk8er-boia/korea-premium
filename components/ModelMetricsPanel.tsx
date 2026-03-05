
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

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            Model Performance Indicators
          </h3>
          <p className="text-[9px] text-slate-400 mb-4 leading-relaxed">
            모델의 예측 정확도와 분류 성능을 종합적으로 평가합니다. 각 지표는 모델이 시장 데이터를 얼마나 신뢰성 있게 해석하고 예측하는지를 나타냅니다.
          </p>
          
          <div className="space-y-5">
            {isAI ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Accuracy (R²)</p>
                    <p className="text-lg font-black text-indigo-600">{(metrics.accuracy! * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">ROC AUC</p>
                    <p className="text-lg font-black text-emerald-600">{(metrics.rocAuc! * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Precision</span>
                    <span className="text-[10px] font-black text-slate-700">{(metrics.precision! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${metrics.precision! * 100}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Recall</span>
                    <span className="text-[10px] font-black text-slate-700">{(metrics.recall! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${metrics.recall! * 100}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">F1 Score</span>
                    <span className="text-[10px] font-black text-slate-700">{(metrics.f1! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${metrics.f1! * 100}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">PR AUC</span>
                    <span className="text-[10px] font-black text-slate-700">{(metrics.prAuc! * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${metrics.prAuc! * 100}%` }}></div>
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
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">vs. {isAI ? 'Linear Regression' : 'Market Average'}</span>
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

      {isAI && metrics.calibrationCurve && metrics.confusionMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calibration Curve */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Model Calibration Curve
              </h3>
              <div className="flex gap-3">
                <div className="group relative flex items-center gap-1.5 cursor-help">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Log Loss:</span>
                  <span className="text-[9px] font-black text-slate-700">{metrics.logLoss?.toFixed(3)}</span>
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    예측 오차를 측정합니다. 낮을수록 예측이 실제값에 가깝고 정확합니다.
                  </div>
                </div>
                <div className="group relative flex items-center gap-1.5 cursor-help">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Brier:</span>
                  <span className="text-[9px] font-black text-slate-700">{metrics.brierScore?.toFixed(3)}</span>
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    예측의 정확도와 보정 정도를 측정합니다. 0에 가까울수록 예측이 정확합니다.
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.calibrationCurve} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="predicted" 
                    type="number" 
                    domain={[0, 1]} 
                    tick={{ fontSize: 9, fontWeight: 700 }}
                    label={{ value: 'Predicted Probability', position: 'insideBottom', offset: -5, fontSize: 8, fontWeight: 800 }}
                  />
                  <YAxis 
                    type="number" 
                    domain={[0, 1]} 
                    tick={{ fontSize: 9, fontWeight: 700 }}
                    label={{ value: 'Actual Fraction', angle: -90, position: 'insideLeft', fontSize: 8, fontWeight: 800 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} name="Model Calibration" />
                  <Line type="monotone" data={[ {predicted: 0, actual: 0}, {predicted: 1, actual: 1} ]} dataKey="actual" stroke="#64748b" strokeDasharray="5 5" dot={false} name="Perfect Calibration" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-[9px] text-slate-400 font-medium leading-relaxed">
              Calibration Curve는 모델이 예측한 확률과 실제 발생 빈도 사이의 일치도를 나타냅니다. 대각선에 가까울수록 모델의 신뢰도가 높음을 의미합니다.<br/><br/>
              • <strong>Log Loss:</strong> 예측 오차를 측정합니다. 낮을수록 예측이 실제값에 가깝고 정확합니다.<br/>
              • <strong>Brier Score:</strong> 예측의 정확도와 보정 정도를 측정합니다. 0에 가까울수록 예측이 정확합니다.
            </p>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              Confusion Matrix (혼동 행렬)
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">True Positive (TP)</p>
                <p className="text-2xl font-black text-emerald-700">{metrics.confusionMatrix.tp}</p>
                <p className="text-[9px] text-emerald-500 font-bold mt-1">상승 예측 성공</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                <p className="text-[10px] font-black text-rose-600 uppercase mb-1">False Positive (FP)</p>
                <p className="text-2xl font-black text-rose-700">{metrics.confusionMatrix.fp}</p>
                <p className="text-[9px] text-rose-500 font-bold mt-1">상승 오탐 (Type I Error)</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1">False Negative (FN)</p>
                <p className="text-2xl font-black text-amber-700">{metrics.confusionMatrix.fn}</p>
                <p className="text-[9px] text-amber-500 font-bold mt-1">상승 미탐 (Type II Error)</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-1">True Negative (TN)</p>
                <p className="text-2xl font-black text-slate-700">{metrics.confusionMatrix.tn}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-1">하락 예측 성공</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-[9px] font-black text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Matrix Interpretation
              </h4>
              <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                본 행렬은 시장의 '상승(Positive)'과 '하락(Negative)'에 대한 모델의 분류 성능을 보여줍니다. 
                <span className="text-indigo-600 font-bold"> TP/TN의 높은 비중</span>은 모델이 시장 방향성을 정확히 포착하고 있음을 나타내며, 
                특히 <span className="text-rose-600 font-bold">FP(오탐)</span>를 최소화하여 잘못된 매수 신호를 방지하는 데 최적화되어 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  domain={[0, 1]}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="accuracy" name="Accuracy (R²)" radius={[4, 4, 0, 0]} barSize={20} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#4f46e5', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }}>
                  {metrics.comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === modelType ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
                <Bar dataKey="f1" name="F1 Score" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#f59e0b', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }} />
                <Bar dataKey="auc" name="ROC AUC" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#10b981', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }} />
                <Bar dataKey="prAuc" name="PR AUC" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} label={{ position: 'top', fontSize: 8, fontWeight: 800, fill: '#ec4899', formatter: (v: number) => `${(v * 100).toFixed(0)}%` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-500">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">Accuracy (R²):</p>
              <p>모델이 전체 데이터 중 정답을 맞힌 비율입니다. R²는 모델이 실제 데이터의 변동성을 얼마나 잘 설명하는지를 나타내며, 100%에 가까울수록 모델의 예측력이 높고 데이터 설명력이 우수함을 의미합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">F1 Score:</p>
              <p>정밀도(Precision, 예측한 상승 중 실제 상승 비율)와 재현율(Recall, 실제 상승 중 모델이 포착한 비율)의 조화평균입니다. 데이터가 한쪽으로 치우쳐 있거나 불균형할 때 모델의 종합적인 성능을 평가하는 데 매우 유용합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">ROC AUC:</p>
              <p>모델이 '상승'과 '하락'을 얼마나 잘 구분하는지를 나타내는 지표입니다. 0.5는 무작위 예측과 같으며, 1에 가까울수록 상승과 하락을 구분하는 능력이 매우 뛰어남을 의미합니다.</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700">PR AUC:</p>
              <p>정밀도(Precision)와 재현율(Recall)의 관계를 곡선 아래 면적으로 나타냅니다. 특히 '상승' 사례가 드문 불균형 데이터셋에서 모델이 얼마나 정확하게 상승을 포착하는지를 평가할 때 ROC AUC보다 더 정교한 성능 지표가 됩니다.</p>
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
