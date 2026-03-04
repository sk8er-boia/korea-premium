
import React from 'react';
import { ModelMetrics, ModelType } from '../types';

interface ModelMetricsPanelProps {
  metrics: ModelMetrics;
  modelType: ModelType;
}

const ModelMetricsPanel: React.FC<ModelMetricsPanelProps> = ({ metrics, modelType }) => {
  const isAI = ['LSTM', 'GRU', 'XGBoost', 'LightGBM'].includes(modelType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Performance Metrics */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          Model Performance Indicators
        </h3>
        
        <div className="space-y-6">
          {isAI ? (
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
                통계적 베이스라인 대비 모델의 패턴 포착 정밀도 지수입니다. 1.0 이상일 때 유의미한 초과 성과를 나타냅니다.
              </p>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[8px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">상대적 성능 지수</span>
                1.0보다 높을수록 비선형적 변동성에 대한 대응력이 우수함을 의미합니다.
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
        
        <div className="mt-4 pt-3 border-t border-slate-50">
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
            * SHAP(SHapley Additive exPlanations) 분석은 각 입력 변수가 모델의 최종 예측치에 기여한 정도를 게임 이론 기반으로 산출한 지표입니다. 
            {isAI ? ' AI 모델의 블랙박스 특성을 해소하기 위해 비선형적 상호작용을 시각화합니다.' : ' 통계 모델의 각 팩터별 설명력을 정규화하여 표시합니다.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelMetricsPanel;
