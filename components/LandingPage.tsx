import React from 'react';
import { motion } from 'motion/react';
import { Play, BarChart3, ShieldCheck, Zap, TrendingUp, Globe, Cpu, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">V2.0 Quantum Intelligence Engine</span>
          </motion.div>

          <h1 className="text-6xl md:text-[120px] font-black mb-8 tracking-tighter leading-[0.85] uppercase">
            Korea <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">Value-Up</span> <br/>
            <span className="text-indigo-500">Simulator</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            코리아 디스카운트 해소를 위한 7요인 증강 프레임워크 기반 시뮬레이터. 
            일본 시장의 성공 사례를 전이 학습(Transfer Learning)하여 2030년까지의 가치 회복 경로를 정밀하게 예측합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onStart}
              className="group relative px-12 py-5 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <Play className="w-5 h-5 fill-current" />
              시뮬레이션 엔진 가동
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engine</p>
                  <p className="text-sm font-black text-white">FF7 + AI</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analysis</p>
                  <p className="text-sm font-black text-white">SHAP / RIM</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Stats */}
        <div className="absolute bottom-20 left-10 hidden xl:block">
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-12 h-[1px] bg-white"></div>
              <span className="text-[10px] font-bold tracking-widest uppercase">Market Data Sync</span>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-12 h-[1px] bg-white"></div>
              <span className="text-[10px] font-bold tracking-widest uppercase">Real-time Inference</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">
              The Value-Up <br/>
              <span className="text-indigo-600">Framework</span>
            </h2>
            <p className="text-slate-500 max-w-xl font-medium">
              단순한 지수 예측을 넘어, 기업 거버넌스, 주주 환원, 자본 효율성 등 7가지 핵심 요인을 분석하여 대한민국 시장의 본질적인 가치 상승 경로를 제시합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Transfer Learning",
                desc: "일본 도쿄증권거래소(TSE)의 'PBR 1배 미만 개선' 사례를 학습하여 한국 시장에 적용합니다."
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "7-Factor Model",
                desc: "Beta, SMB, HML, RMW, CMA, QMJ 그리고 Policy Drive(λ)를 결합한 고도화된 모델링."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Scenario Analysis",
                desc: "Worst, Moderate, Best 시나리오별 PBR 리레이팅 수준과 예상 지수를 실시간 시뮬레이션."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 bg-slate-50 rounded-[32px] border border-slate-200 transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-8 text-indigo-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black">KV</div>
            <span className="font-black tracking-tighter uppercase">Korea Value-Up Simulator</span>
          </div>
          <div className="flex gap-10">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Sources</p>
              <p className="text-xs font-medium text-slate-400">KRX, TSE, St. Louis Fed (FRED)</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Engine Version</p>
              <p className="text-xs font-medium text-slate-400">v2.0.4-stable</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            © 2026 Financial Intelligence Lab.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
