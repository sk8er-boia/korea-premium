
import React from 'react';
import { SimulationConfig, ModelType } from '../types';

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: (c: SimulationConfig) => void;
  onRunSimulation: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  onRunSimulation,
}) => {
  
  const updateConfig = (key: keyof SimulationConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const models: {id: ModelType, label: string, desc: string}[] = [
    { id: 'CAPM', label: 'CAPM', desc: 'Single Factor Beta' },
    { id: 'FamaFrench3', label: 'FF3', desc: 'Size & Value' },
    { id: 'FamaFrench5', label: 'FF5', desc: 'Profit & Invest' },
    { id: 'FamaFrench7', label: 'FF7 Factor Model', desc: 'QMJ* & PDF Integrated' },
    { id: 'LSTM', label: 'LSTM', desc: 'Neural Momentum' },
    { id: 'GRU', label: 'GRU', desc: 'Gated Recurrent' },
    { id: 'XGBoost', label: 'XGBoost', desc: 'Extreme Boosting' },
    { id: 'LightGBM', label: 'LightGBM', desc: 'Light Boosting' },
    { id: 'Ensemble', label: 'Ensemble', desc: 'Bayesian Optimized' },
  ];

  const getAlgorithmDescription = () => {
    switch (config.modelType) {
      case 'CAPM': return "자본자산가격결정모형(CAPM): 시장 전체의 체계적 위험(Beta)만을 고려하여 기대 수익률을 산출하는 기초 모델입니다.";
      case 'FamaFrench3': return "파마-프렌치 3요인 모델: 시장 위험에 기업 규모(SMB)와 가치(HML) 요인을 추가하여 초과 수익의 원천을 분석합니다.";
      case 'FamaFrench5': return "파마-프렌치 5요인 모델: 기존 3요인에 수익성(RMW)과 투자 성향(CMA)을 결합하여 기업의 펀더멘털 동력을 정밀 측정합니다.";
      case 'FamaFrench7': return "증강 7요인 모델(FF7): FF5에 '확장형 품질 요인(QMJ*)'과 '정책 방향성(PDF)'을 통합한 최상위 통계 모델입니다. QMJ*는 반도체 사이클(SCI)을 내생화하여 산업 특수성을 반영합니다.";
      case 'LSTM': return "시계열 딥러닝(LSTM): 과거 시계열의 장기 의존성을 학습하여 추세 지속성과 비선형적 변곡점을 예측하는 순환 신경망 모델입니다.";
      case 'GRU': return "게이트 순환 유닛(GRU): LSTM의 구조를 최적화하여 시장의 급격한 체제 전환(Regime Switching)과 변동성 클러스터링을 효과적으로 포착합니다.";
      case 'XGBoost': return "Extreme Gradient Boosting: 고성능 앙상블 학습을 통해 정책 변화와 산업 사이클의 상호작용에 따른 비연속적 가격 점프를 감지합니다.";
      case 'LightGBM': return "Leaf-wise Boosting: 대규모 파라미터 환경에서 미세한 잔차를 최소화하며, 참조 시장(TSE 등)과의 전이 학습(Transfer Learning) 결과를 실시간 반영합니다.";
      case 'Ensemble': return "Bayesian Ensemble: LSTM, GRU, XGBoost, LightGBM을 베이시안 최적화 가중치(0.3, 0.2, 0.35, 0.15)로 결합하여 예측 안정성과 정확도를 극대화한 하이브리드 모델입니다.";
      default: return "알고리즘을 선택하면 엔진 상세 정보가 표시됩니다.";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-4 overflow-hidden">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-4">
        
        {/* COL 1: Engine Controls */}
        <div className="md:col-span-3 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">Target Index</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['KOSPI', 'KOSDAQ'].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateConfig('targetIndex', t)}
                    className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all ${
                      config.targetIndex === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-2 uppercase tracking-wider">Forecast Algorithm</label>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Statistical Models</p>
                  <div className="grid grid-cols-2 gap-2">
                    {models.slice(0, 4).map(m => {
                      const isSelected = config.modelType === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => updateConfig('modelType', m.id)}
                          className={`
                            flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all
                            ${isSelected 
                              ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'}
                          `}
                        >
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{m.label}</span>
                          <span className="text-[7px] text-slate-400 font-medium leading-none mt-0.5">{m.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">AI / Machine Learning</p>
                  <div className="grid grid-cols-2 gap-2">
                    {models.slice(4, 8).map(m => {
                      const isSelected = config.modelType === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => updateConfig('modelType', m.id)}
                          className={`
                            flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all
                            ${isSelected 
                              ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'}
                          `}
                        >
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>{m.label}</span>
                          <span className="text-[7px] text-slate-400 font-medium leading-none mt-0.5">{m.desc}</span>
                        </button>
                      );
                    })}
                    {/* Ensemble Button - Full Width */}
                    <button
                      onClick={() => updateConfig('modelType', 'Ensemble')}
                      className={`
                        col-span-2 flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all backdrop-blur-sm
                        ${config.modelType === 'Ensemble'
                          ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 text-indigo-700 shadow-md' 
                          : 'bg-indigo-50/40 border-indigo-200 hover:bg-indigo-100/60 text-indigo-700'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black uppercase tracking-widest">Bayesian Ensemble</span>
                      </div>
                      <span className={`text-[9px] font-bold mt-1 tracking-tight leading-tight ${config.modelType === 'Ensemble' ? 'text-indigo-600' : 'text-indigo-600/80'}`}>
                        Dynamic Multi-Model Integration<br/>
                        (LSTM + GRU + XGBoost + LightGBM)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* COL 2: Factors */}
        <div className="md:col-span-6 border-x border-slate-100 px-6">
          <div className="mb-3">
            <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-2 border-l-2 border-slate-300 pl-2">
              Asset Pricing Factors (FF7 Factor Model)
            </h4>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              
              <div className="col-span-2">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                      Market Beta (시장 민감도)
                    </label>
                    <span className="text-[8px] text-slate-400 leading-normal font-medium">
                      시장 전체 흐름에 지수가 얼마나 민감하게 반응할지 결정합니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-500 mt-0.5">{config.betaWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={config.betaWeight} onChange={(e) => updateConfig('betaWeight', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-sky-500 cursor-pointer" />
              </div>

              <div className={config.modelType === 'CAPM' ? 'opacity-30 pointer-events-none' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Size (SMB)
                    </label>
                    <span className="text-[8px] text-slate-400 leading-normal font-medium">
                      중소형주 주도력을 반영합니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-500 mt-0.5">{config.smbWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="-1.0" max="1.0" step="0.1" value={config.smbWeight} onChange={(e) => updateConfig('smbWeight', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-emerald-500 cursor-pointer" />
              </div>

              <div className={config.modelType === 'CAPM' ? 'opacity-30 pointer-events-none' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                      Value (HML)
                    </label>
                    <span className="text-[8px] text-slate-400 leading-normal font-medium">
                      저평가 가치주 상승 동력입니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 mt-0.5">{config.hmlWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.0" max="2.0" step="0.1" value={config.hmlWeight} onChange={(e) => updateConfig('hmlWeight', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-purple-600 cursor-pointer" />
              </div>

              <div className={['CAPM', 'FamaFrench3'].includes(config.modelType) ? 'opacity-30 pointer-events-none' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Profit (RMW)
                    </label>
                    <span className="text-[8px] text-slate-400 leading-normal font-medium">
                      고수익 우량 기업 가중치입니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 mt-0.5">{config.rmwWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.0" max="2.0" step="0.1" value={config.rmwWeight} onChange={(e) => updateConfig('rmwWeight', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-blue-600 cursor-pointer" />
              </div>

              <div className={['CAPM', 'FamaFrench3'].includes(config.modelType) ? 'opacity-30 pointer-events-none' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-stone-600 rounded-full"></span>
                      Invest (CMA)
                    </label>
                    <span className="text-[8px] text-slate-400 leading-normal font-medium">
                      효율적 자본 배분 가중치입니다.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-600 mt-0.5">{config.cmaWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.0" max="2.0" step="0.1" value={config.cmaWeight} onChange={(e) => updateConfig('cmaWeight', parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-stone-600 cursor-pointer" />
              </div>

            </div>
          </div>

          <div className={`mt-1 p-2 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-lg border border-indigo-100 shadow-sm transition-all ${['CAPM', 'FamaFrench3', 'FamaFrench5'].includes(config.modelType) ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
            <h5 className="text-[8px] font-black text-slate-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse scale-50"></span>
              Augmented FF7 Drivers (증강 7요인 동력)
            </h5>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <div className="col-span-2">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-indigo-600 leading-tight flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                       Quality & Semi Cycle (QMJ*)
                    </label>
                    <span className="text-[7px] text-indigo-700/70 leading-tight font-medium">
                      거버넌스 투명성 및 반도체(HBM/DRAM) 사이클 내생화 지표.
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 mt-0.5">{config.qmjWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.0" max="2.0" step="0.1" value={config.qmjWeight} onChange={(e) => updateConfig('qmjWeight', parseFloat(e.target.value))} className="w-full h-1 bg-indigo-200 rounded-lg appearance-none accent-indigo-500 cursor-pointer" />
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-rose-700 leading-tight flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                       Policy Drive (PDF)
                    </label>
                    <span className="text-[7px] text-rose-800/70 leading-tight font-medium">
                      정부 밸류업 정책 및 NLP 기반 이슈 반영 강도.
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-rose-700 mt-0.5">{config.pdfWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0.0" max="1.0" step="0.1" value={config.pdfWeight} onChange={(e) => updateConfig('pdfWeight', parseFloat(e.target.value))} className="w-full h-1 bg-rose-200 rounded-lg appearance-none accent-rose-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* COL 3: Hyperparams */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-[9px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
            Environment Setting
          </h4>
          <div>
            <div className="flex justify-between items-start mb-1">
               <div className="flex flex-col">
                 <label className="text-[10px] font-bold text-slate-700 leading-tight">Horizon (전망 기간)</label>
                 <span className="text-[7px] text-slate-400 leading-none font-medium">미래 시뮬레이션 총 기간.</span>
               </div>
               <span className="text-[10px] font-bold text-indigo-600 mt-0.5">{config.durationMonths / 12} Yrs</span>
            </div>
            <input type="range" min="12" max="120" step="12" value={config.durationMonths} onChange={(e) => updateConfig('durationMonths', parseInt(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none accent-slate-700 cursor-pointer" />
          </div>
          
          <div>
            <div className="flex justify-between items-start mb-1">
               <div className="flex flex-col">
                 <label className="text-[10px] font-bold text-slate-700 leading-tight">Volatility (변동성)</label>
                 <span className="text-[7px] text-slate-400 leading-none font-medium">글로벌 경제 리스크 및 시장 불확실성 수준.</span>
               </div>
               <span className="text-[10px] font-bold text-slate-500 mt-0.5">Lv. {config.volatility}</span>
            </div>
            <input type="range" min="1" max="10" step="1" value={config.volatility} onChange={(e) => updateConfig('volatility', parseInt(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-gray-500 cursor-pointer" />
            
            {/* Volatility Legend */}
            <div className="mt-2 grid grid-cols-5 gap-1">
              {[1, 3, 5, 7, 10].map(lv => (
                <div key={lv} className="flex flex-col items-center">
                  <div className={`w-full h-1 rounded-full mb-1 ${lv <= config.volatility ? 'bg-slate-400' : 'bg-slate-100'}`}></div>
                  <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">
                    {lv === 1 ? 'Stable' : lv === 3 ? 'Normal' : lv === 5 ? 'Active' : lv === 7 ? 'High' : 'Crisis'}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[7px] text-slate-400 leading-tight font-medium italic">
              * 변동성이 높을수록 AI 모델은 비선형적 패턴과 꼬리 위험(Tail Risk)에 더 높은 가중치를 부여합니다.
            </p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
             <h5 className="text-[10px] font-bold text-slate-800 uppercase mb-2 tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
               Simulation Engine
             </h5>
             <p className="text-[9px] text-slate-700 leading-relaxed font-medium mb-2.5 tracking-tight text-justify break-keep">
               {getAlgorithmDescription()}
             </p>
             <div className="text-[8px] text-slate-500 font-bold border-t border-slate-200 pt-2 leading-tight tracking-tight text-justify break-keep">
               지정된 참조 시장의 거시적 경로를 기계학습 모델이 실시간으로 대조 분석하여, 한국 시장 고유의 밸류업 팩터와 결합된 하이브리드 전망치를 도출합니다.
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 pt-3 border-t border-slate-100">
        <div className="flex-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex items-center gap-3 overflow-x-auto">
           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-2">Benchmark:</label>
           <div className="flex gap-1">
              {['Japan', 'Taiwan', 'SP500', 'NASDAQ', 'DowJones', 'Germany'].map((m) => {
                const isSelected = config.referenceMarket === m;
                let displayName = m;
                if (m === 'SP500') displayName = 'S&P 500';
                if (m === 'DowJones') displayName = 'Dow Jones';

                return (
                  <button 
                    key={m} 
                    onClick={() => updateConfig('referenceMarket', m)}
                    className={`
                      px-2.5 py-1 rounded border text-[9px] font-bold transition-all whitespace-nowrap
                      ${isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }
                    `}
                  >
                    {displayName}
                  </button>
                );
              })}
           </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={onRunSimulation}
            className="flex-1 md:w-36 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Run Model
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
