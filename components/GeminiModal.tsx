
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Info, AlertCircle, ShieldCheck } from 'lucide-react';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.trim()) {
      setError('Gemini API 키를 입력해 주세요.');
      return;
    }
    if (!key.startsWith('AIza')) {
      setError('올바른 Gemini API 키 형식이 아닙니다 (AIza...로 시작해야 함).');
      return;
    }
    onSave(key.trim());
    setKey('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Key className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">AI Analysis Engine</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                고도화된 AI 분석 기능을 활성화하려면 Google Gemini API 키가 필요합니다. 
                입력하신 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다.
              </p>

              <div className="space-y-4 mb-8">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value);
                      setError('');
                    }}
                    placeholder="AIza..."
                    className={`w-full px-5 py-4 bg-slate-50 border ${error ? 'border-rose-300' : 'border-slate-200'} rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  />
                  {error && (
                    <p className="mt-2 text-rose-500 text-[11px] font-bold flex items-center gap-1 ml-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                      API 키가 없으신가요? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-black decoration-indigo-300 hover:text-indigo-900">Google AI Studio</a>에서 무료로 발급받으실 수 있습니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all text-xs uppercase tracking-widest"
                >
                  나중에 하기
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-slate-900/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  키 저장 및 활성화
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GeminiModal;
