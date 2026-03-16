import React, { useRef } from 'react';
import { SavedSimulation } from '../types';
import { X, Play, Calendar, Settings, Trash2, Download, Upload } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: SavedSimulation[];
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  onBackup: () => void;
  onRestore: (data: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, snapshots, onRun, onDelete, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onRestore(content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Play className="w-4 h-4 fill-current" />
              </div>
              Review Saved Models
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 ml-11">저장된 시뮬레이션 데이터를 불러옵니다</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-slate-100/50 px-8 py-3 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Management</span>
          <div className="flex gap-2">
            <button 
              onClick={onBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 transition-all shadow-sm"
            >
              <Download className="w-3 h-3" />
              BACKUP
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 transition-all shadow-sm"
            >
              <Upload className="w-3 h-3" />
              RESTORE
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
          {snapshots.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-slate-300 animate-spin-slow" />
              </div>
              <p className="text-sm font-bold text-slate-400">저장된 데이터가 없습니다.</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">먼저 시뮬레이션을 실행하고 데이터를 저장해주세요.</p>
            </div>
          ) : (
            snapshots.map((s) => (
              <div 
                key={s.id}
                className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200 uppercase tracking-tighter">
                      Seed: {s.seed}
                    </div>
                    <button 
                      onClick={() => onDelete(s.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Model Type</p>
                    <p className="text-[10px] font-bold text-slate-700">{s.config.modelType}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Benchmark</p>
                    <p className="text-[10px] font-bold text-slate-700">{s.config.referenceMarket}</p>
                  </div>
                </div>

                <button 
                  onClick={() => onRun(s.id)}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-200"
                >
                  <Play className="w-3 h-3 fill-current" />
                  RUN MODEL (REPRODUCE)
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed text-center italic">
            * 저장된 시드(Seed)를 사용하여 당시와 완벽하게 동일한 난수 환경을 재현합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
