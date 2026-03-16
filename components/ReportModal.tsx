import React from 'react';
import { SimulationConfig, SimulationMetrics } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  metrics: SimulationMetrics;
  onSaveData: (name: string) => void;
  latestValues: { worst: number; moderate: number; best: number };
  pbrValues: { worst: number; moderate: number; best: number };
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, config, metrics, onSaveData, latestValues, pbrValues }) => {
  const [modelName, setModelName] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);

  if (!isOpen) return null;

  const { modelMetrics } = metrics;
  const isAI = ['LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'].includes(config.modelType);
  
  // Find current model data in comparisonData if available
  const currentModelData = modelMetrics.comparisonData?.find(m => m.name === config.modelType);
  
  // Use comparisonData values if available, otherwise fallback to top-level metrics
  const displayMetrics = {
    accuracy: currentModelData?.accuracy ?? modelMetrics.accuracy ?? 0,
    rocAuc: currentModelData?.auc ?? modelMetrics.rocAuc ?? 0,
    precision: currentModelData?.precision ?? modelMetrics.precision ?? 0,
    recall: currentModelData?.recall ?? modelMetrics.recall ?? 0,
    f1: currentModelData?.f1 ?? modelMetrics.f1 ?? 0,
    prAuc: currentModelData?.prAuc ?? modelMetrics.prAuc ?? 0,
  };

  const handleSave = () => {
    const name = modelName.trim() || `Model ${new Date().toLocaleTimeString()}`;
    // We'll pass the name back to the parent
    onSaveData(name);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Simulation Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Model Name</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Optional</span>
            </div>
            <input 
              type="text" 
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name to save..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Configuration</h3>
            <pre className="text-[10px] font-mono text-slate-700 bg-slate-100 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Scenario Results</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Worst Case', cagr: metrics.worstCAGR, value: latestValues.worst, pbr: pbrValues.worst },
                { label: 'Moderate Case', cagr: metrics.moderateCAGR, value: latestValues.moderate, pbr: pbrValues.moderate },
                { label: 'Best Case', cagr: metrics.bestCAGR, value: latestValues.best, pbr: pbrValues.best },
              ].map((s) => (
                <div key={s.label} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase">{s.label}</p>
                  <p className="text-sm font-black text-slate-900">{s.value.toFixed(0)}</p>
                  <p className="text-[10px] font-bold text-slate-600">PBR: {s.pbr.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-indigo-600">{s.cagr.toFixed(2)}% CAGR</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Model Performance Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {isAI ? (
                <>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Accuracy (R²)</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">ROC AUC</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.rocAuc * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Precision</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.precision * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Recall</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.recall * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">F1 Score</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.f1 * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">PR AUC</p>
                    <p className="text-sm font-black text-slate-900">{(displayMetrics.prAuc * 100).toFixed(1)}%</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Explanatory Power (Adj. R²)</p>
                  <p className="text-sm font-black text-slate-900">{(modelMetrics.explanatoryPower! * 100).toFixed(1)}%</p>
                </div>
              )}
              
              {modelMetrics.logLoss !== undefined && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Log Loss</p>
                  <p className="text-sm font-black text-slate-900">{modelMetrics.logLoss.toFixed(4)}</p>
                </div>
              )}
              {modelMetrics.comparisonIndex !== undefined && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Perf. Index</p>
                  <p className="text-sm font-black text-slate-900">{modelMetrics.comparisonIndex.toFixed(2)}x</p>
                </div>
              )}
            </div>

            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Feature Importance (SHAP Analysis)</h3>
            <div className="space-y-2">
              {modelMetrics.shapValues.map((sv, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-[10px] font-bold text-slate-600 truncate">{sv.feature}</div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ width: `${Math.min(100, sv.importance * 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-[9px] font-mono text-slate-400 text-right">
                    {(sv.importance * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Close</button>
          <button 
            onClick={handleSave} 
            disabled={isSaved}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${isSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isSaved ? '✓ Saved Successfully' : 'Save Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
