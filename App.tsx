
import React, { Component, useState, useEffect, useCallback, ReactNode } from 'react';
import { Steps } from 'intro.js-react';
import { ArrowLeft, HelpCircle, Info, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateAllMarketData, runSimulation } from './services/dataService';
import { analyzeSimulationResults } from './services/geminiService';
import SimulationChart from './components/SimulationChart';
import ControlPanel from './components/ControlPanel';
import DataTable from './components/DataTable';
import ModelMetricsPanel from './components/ModelMetricsPanel';
import LandingPage from './components/LandingPage';
import GeminiModal from './components/GeminiModal';
import { DataPoint, SimulationConfig, SimulationMetrics, ModelMetrics } from './types';

interface ErrorBoundaryProps { 
  children?: ReactNode; 
}

interface ErrorBoundaryState { 
  hasError: boolean; 
}

// Explicitly declare state as a class property to ensure it's correctly typed and recognized by the compiler.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <div className="bg-red-50 border border-red-200 p-8 rounded-3xl inline-block shadow-2xl">
            <h2 className="text-red-600 font-black text-lg mb-2 tracking-tight">ENGINE HALTED</h2>
            <p className="text-red-500/70 text-sm mb-6 font-medium leading-relaxed">
              런타임 환경에서 충돌이 발생했습니다.<br/>페이지를 새로고침하여 엔진을 초기화하십시오.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg"
            >
              RELOAD SYSTEM
            </button>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

const AppContent = () => {
  const [view, setView] = useState<'landing' | 'simulator'>('landing');
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key'));
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [snapshots, setSnapshots] = useState<{
    id: string;
    name: string;
    results: any;
    config: SimulationConfig;
    visible: boolean;
    timestamp: number;
  }[]>([]);

  const [config, setConfig] = useState<SimulationConfig>({
    betaWeight: 1.0, 
    smbWeight: 0.2,  
    hmlWeight: 1.0,  
    rmwWeight: 1.0,  
    cmaWeight: 1.0,  
    qmjWeight: 1.0,  
    pdfWeight: 0.8,  // Default: Strong policy drive
    volatility: 4,
    durationMonths: 60, // 5 years (2026-2030)
    referenceMarket: 'Japan',
    targetIndex: 'KOSPI',
    historyCutoffYear: 2025,
    modelType: 'FamaFrench7' 
  });

  const [simResults, setSimResults] = useState<{
    targetIndex: string;
    alt1: DataPoint[];
    alt2: DataPoint[];
    alt3: DataPoint[];
    metrics?: SimulationMetrics;
  }>({ targetIndex: 'KOSPI', alt1: [], alt2: [], alt3: [] });

  useEffect(() => {
    const data = generateAllMarketData();
    setDatasets(data);
    setLoading(false);
  }, []);

  const runSim = useCallback((currentDatasets: any, currentConfig: SimulationConfig) => {
    if (!currentDatasets) return;
    const fullHistory: DataPoint[] = currentConfig.targetIndex === 'KOSPI' ? currentDatasets.kospiData : currentDatasets.kosdaqData;
    const effectiveHistory = fullHistory.filter((pt: DataPoint) => {
        const year = parseInt(pt.date.split('-')[0]);
        return year <= currentConfig.historyCutoffYear;
    });
    const results = runSimulation(effectiveHistory, currentConfig);
    setSimResults({
      targetIndex: currentConfig.targetIndex,
      alt1: results.alt1,
      alt2: results.alt2,
      alt3: results.alt3,
      metrics: results.metrics
    });
  }, []);

  const handleManualRun = () => {
    runSim(datasets, config);
    setAiAnalysis(null); // Clear previous analysis when config changes manually
  };

  const handleAIAnalysis = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeSimulationResults(
        apiKey,
        config,
        simResults.metrics!,
        currentHistory,
        { alt1: simResults.alt1, alt2: simResults.alt2, alt3: simResults.alt3 }
      );
      setAiAnalysis(result);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      if (error.message === "INVALID_API_KEY") {
        setAnalysisError("유효하지 않은 API 키입니다. 키를 다시 확인해 주세요.");
        localStorage.removeItem('gemini_api_key');
        setApiKey(null);
      } else {
        setAnalysisError(error.message || "AI 분석 중 오류가 발생했습니다.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
    // Automatically trigger analysis after saving key if it was requested
    setTimeout(() => handleAIAnalysis(), 100);
  };

  const takeSnapshot = () => {
    const name = prompt('저장할 모델의 이름을 입력하세요:', `Model #${snapshots.length + 1}`);
    if (!name) return;

    const newSnapshot = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      results: { ...simResults },
      config: { ...config },
      visible: true,
      timestamp: Date.now()
    };
    setSnapshots([...snapshots, newSnapshot]);
  };

  const removeSnapshot = (id: string) => {
    setSnapshots(snapshots.filter(s => s.id !== id));
  };

  const toggleSnapshotVisibility = (id: string) => {
    setSnapshots(snapshots.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const loadSnapshotConfig = (id: string) => {
    const s = snapshots.find(snap => snap.id === id);
    if (s) {
      setConfig({ ...s.config });
      alert(`'${s.name}'의 설정이 적용되었습니다.`);
    }
  };

  const copyConfigToClipboard = () => {
    const configStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configStr);
    alert('시뮬레이션 설정이 클립보드에 복사되었습니다.');
  };

  useEffect(() => {
    if (datasets) runSim(datasets, config);
  }, [
      datasets, config.targetIndex, config.referenceMarket, config.historyCutoffYear, 
      config.modelType, config.betaWeight, config.smbWeight, config.hmlWeight, 
      config.rmwWeight, config.cmaWeight, config.qmjWeight, config.pdfWeight,
      config.durationMonths, runSim
  ]); 

  console.log("AppContent rendering", { loading, datasets: !!datasets, kospi: !!datasets?.kospiData });

  const introSteps = [
    {
      element: '#control-panel',
      intro: '여기서 시뮬레이션의 핵심 변수들을 조절할 수 있습니다. 모델 종류와 가중치를 설정해보세요.',
      position: 'right'
    },
    {
      element: '#metrics-panel',
      intro: '선택한 모델의 예측 정확도와 요인별 기여도(SHAP)를 실시간으로 분석합니다.',
      position: 'bottom'
    },
    {
      element: '#summary-cards',
      intro: 'Worst, Moderate, Best 세 가지 시나리오별 예상 지수와 PBR 리레이팅 수준을 한눈에 비교합니다.',
      position: 'bottom'
    },
    {
      element: '#simulation-chart',
      intro: '2030년까지의 가치 회복 경로를 시각적으로 확인하세요. 음영 처리된 영역이 예측 구간입니다.',
      position: 'top'
    }
  ];

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('simulator')} />;
  }

  if (loading || !datasets || !datasets.kospiData) return <div className="h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse tracking-widest text-xs uppercase">Initializing Value-Up Engine...</div>;

  const fullHistory = config.targetIndex === 'KOSPI' ? datasets.kospiData : datasets.kosdaqData;
  const currentHistory = fullHistory.filter((pt: DataPoint) => parseInt(pt.date.split('-')[0]) <= config.historyCutoffYear);
  
  const currentReference = (() => {
    switch(config.referenceMarket) {
      case 'Japan': return datasets.japanData;
      case 'Taiwan': return datasets.taiwanData;
      case 'SP500': return datasets.sp500Data;
      case 'NASDAQ': return datasets.nasdaqData;
      case 'DowJones': return datasets.dowData;
      case 'Germany': return datasets.germanyData;
      default: return datasets.japanData;
    }
  })();

  const safeAlt1 = simResults.alt1 || [];
  const safeAlt2 = simResults.alt2 || [];
  const safeAlt3 = simResults.alt3 || [];
  
  const defaultModelMetrics: ModelMetrics = {
    accuracy: 0,
    explanatoryPower: 0,
    shapValues: [],
    comparisonIndex: 0
  };

  const safeMetrics = simResults.metrics || { 
    worstCAGR: 0, 
    moderateCAGR: 0, 
    bestCAGR: 0, 
    modelMetrics: defaultModelMetrics 
  };

  const getLatest = (arr: DataPoint[]) => arr.length > 0 ? arr[arr.length - 1].value : 0;
  const baselineValue = getLatest(currentHistory);
  const getChange = (curr: number) => !baselineValue ? 0 : ((curr - baselineValue) / baselineValue) * 100;

  const getPBR = (currValue: number) => {
    if (!baselineValue) return 0;
    const basePBR = config.targetIndex === 'KOSPI' ? 0.92 : 1.82;
    // PBR expands as the market re-rates
    return basePBR * (currValue / baselineValue);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Steps
        enabled={stepsEnabled}
        steps={introSteps}
        initialStep={0}
        onExit={() => setStepsEnabled(false)}
        options={{
          nextLabel: '다음',
          prevLabel: '이전',
          doneLabel: '완료',
          hidePrev: true,
        }}
      />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('landing')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
              title="처음으로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
            </button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-sm">KV</div>
                  <h1 className="font-black text-sm tracking-tight text-slate-900 uppercase">Korea Value-Up Simulator</h1>
               </div>
            </div>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-3">
             <button 
               onClick={() => setStepsEnabled(true)}
               className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider transition-colors shadow-sm"
             >
                <HelpCircle className="w-3 h-3" />
                Guide Tour
             </button>
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                <Info className="w-3 h-3" />
                Integrated FF7 Intelligence
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div id="control-panel">
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            onRunSimulation={handleManualRun} 
            onAIAnalysis={handleAIAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {aiAnalysis && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">AI Insights Report</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini 3.0 Intelligence</p>
                </div>
              </div>
              <button 
                onClick={() => setAiAnalysis(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Loader2 className={`w-4 h-4 text-slate-300 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:font-medium prose-p:leading-relaxed prose-strong:text-indigo-600 prose-ul:font-medium">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">{analysisError}</p>
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="ml-auto text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-all"
            >
              Update API Key
            </button>
          </div>
        )}

        <GeminiModal 
          isOpen={showApiKeyModal} 
          onClose={() => setShowApiKeyModal(false)} 
          onSave={saveApiKey} 
        />

        {safeMetrics.modelMetrics && (
          <div id="metrics-panel">
            <ModelMetricsPanel metrics={safeMetrics.modelMetrics} modelType={config.modelType} config={config} />
          </div>
        )}

        <div id="summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white py-4 px-6 rounded-2xl border border-slate-200 shadow-sm relative group transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-400 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value Trap (Worst)</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-snug mb-3 font-medium tracking-tight text-justify break-keep">P-drive(λ=0) 부재 및 거버넌스 개혁 실패로 인한 저평가 지속 시나리오.</p>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {safeAlt1.length > 0 ? Math.round(getLatest(safeAlt1)).toLocaleString() : '-'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[13px] font-extrabold leading-none ${getChange(getLatest(safeAlt1)) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getChange(getLatest(safeAlt1)).toFixed(1)}%
                </span>
                <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 shadow-sm">PBR {getPBR(getLatest(safeAlt1)).toFixed(2)}</span>
              </div>
            </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Est. CAGR: <span className="text-slate-900">{(safeMetrics.worstCAGR * 100).toFixed(1)}%</span></div>
          </div>

          <div className="bg-white py-4 px-6 rounded-2xl border border-indigo-200 shadow-md relative group transition-all transform hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Base Re-rating (Moderate)</h3>
            </div>
            <p className="text-[9px] text-indigo-400/80 leading-snug mb-3 font-medium tracking-tight text-justify break-keep">Global Standard: 벤치마크 시장과의 제도적 동조화 및 거버넌스 개선을 통한 안정적 가치 회복 경로.</p>
             <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {safeAlt2.length > 0 ? Math.round(getLatest(safeAlt2)).toLocaleString() : '-'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-extrabold text-emerald-600 leading-none">
                  +{getChange(getLatest(safeAlt2)).toFixed(1)}%
                </span>
                <span className="text-[11px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">PBR {getPBR(getLatest(safeAlt2)).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-extrabold uppercase tracking-tight">
                 <span>Annual Yield:</span>
                 <span>{(safeMetrics.moderateCAGR * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="bg-white py-4 px-6 rounded-2xl border border-slate-200 shadow-sm relative group transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Full Convergence (Best)</h3>
            </div>
            <p className="text-[9px] text-emerald-500/70 leading-snug mb-3 font-medium tracking-tight text-justify break-keep">강력한 P-drive(λ→1)와 QMJ 결합으로 선진국 시장 수준의 완전한 해소.</p>
             <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {safeAlt3.length > 0 ? Math.round(getLatest(safeAlt3)).toLocaleString() : '-'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-extrabold text-emerald-600 leading-none">
                  +{getChange(getLatest(safeAlt3)).toFixed(1)}%
                </span>
                <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">PBR {getPBR(getLatest(safeAlt3)).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Est. CAGR: <span className="text-emerald-600">{(safeMetrics.bestCAGR * 100).toFixed(1)}%</span></div>
          </div>
        </div>

        <div id="simulation-chart" className="bg-white p-4 rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6 min-h-[600px]">
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Forecast</span>
              {snapshots.some(s => s.visible) && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-2 h-2 border border-slate-400 border-dashed rounded-full"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {snapshots.filter(s => s.visible).length} Snapshots Active
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyConfigToClipboard}
                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-50 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy Config
              </button>
              <button 
                onClick={takeSnapshot}
                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-100 transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Save Model Copy
              </button>
            </div>
          </div>
          <SimulationChart 
            historyData={currentHistory} referenceData={currentReference}
            referenceMarket={config.referenceMarket} targetIndex={config.targetIndex}
            alt1Data={safeAlt1} alt2Data={safeAlt2} alt3Data={safeAlt3}
            snapshots={snapshots.filter(s => s.visible).map(s => ({
              id: s.id,
              name: s.name,
              data: {
                alt1: s.results.alt1,
                alt2: s.results.alt2,
                alt3: s.results.alt3
              }
            }))}
          />
        </div>

        {snapshots.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              Saved Model Copies (복사본 목록)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {snapshots.map(s => (
                <div key={s.id} className={`p-4 rounded-2xl border transition-all ${s.visible ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {s.config.modelType} • {s.config.referenceMarket} • {new Date(s.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeSnapshot(s.id)}
                      className="p-1 hover:bg-rose-100 rounded-md text-rose-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button 
                      onClick={() => toggleSnapshotVisibility(s.id)}
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${s.visible ? 'bg-white text-indigo-600 border-indigo-200 shadow-sm' : 'bg-slate-200 text-slate-500 border-transparent'}`}
                    >
                      {s.visible ? 'Hide on Chart' : 'Show on Chart'}
                    </button>
                    <button 
                      onClick={() => loadSnapshotConfig(s.id)}
                      className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                    >
                      Load Config
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DataTable 
          historyData={currentHistory}
          referenceData={currentReference}
          referenceMarket={config.referenceMarket}
          targetIndex={config.targetIndex}
          alt1Data={safeAlt1}
          alt2Data={safeAlt2}
          alt3Data={safeAlt3}
        />
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-200 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[10px]">KV</div>
            <span className="font-black text-xs tracking-tighter uppercase text-slate-900">Korea Value-Up Simulator</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Engine Version</p>
              <p className="text-[11px] font-bold text-slate-600">v2.1.20260305 (updated on Mar.05, 2026)</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Legal & Contact</p>
              <div className="flex flex-col gap-1">
                <div className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <button className="hover:text-indigo-600 transition-colors">이용약관</button>
                  <a href="mailto:mash_mellow@naver.com" className="hover:text-indigo-600 transition-colors">문의하기</a>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-right">
            <p>Copyright © 2026 SMART OPERATIONS LAB.<br />All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
