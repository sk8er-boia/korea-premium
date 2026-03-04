
import { DataPoint, SimulationConfig, ModelType, SimulationMetrics, ModelMetrics } from '../types';

const randomNormal = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
};

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 2025년 12월 31일까지 앵커 포인트 확장
const ANCHORS_KOSPI = [
  [2010, 1, 4, 1696], [2011, 4, 27, 2220], [2013, 12, 1, 2011], [2015, 4, 1, 2180], [2017, 12, 1, 2467], [2019, 8, 1, 1900], [2021, 6, 1, 3296], [2022, 9, 1, 2150], [2024, 7, 1, 2890], [2025, 6, 1, 2920], [2025, 12, 31, 3080]
];
const ANCHORS_KOSDAQ = [
  [2010, 1, 4, 539], [2015, 7, 1, 780], [2018, 1, 1, 908], [2020, 3, 1, 420], [2021, 8, 1, 1060], [2023, 7, 1, 950], [2024, 12, 1, 890], [2025, 6, 1, 930], [2025, 12, 31, 985]
];
const ANCHORS_NIKKEI = [
  [2010, 1, 1, 10654], [2012, 12, 1, 10000], [2015, 6, 1, 20800], [2017, 12, 1, 22764], [2020, 3, 1, 16500], [2021, 9, 1, 30600], [2023, 12, 1, 33464], [2024, 3, 1, 40369], [2025, 6, 1, 42800], [2025, 12, 31, 44800]
];
const ANCHORS_TAIWAN = [
  [2010, 1, 1, 8188], [2015, 4, 1, 10000], [2018, 1, 1, 11000], [2020, 3, 1, 8500], [2021, 12, 1, 18218], [2022, 10, 1, 12600], [2024, 5, 20, 21500], [2025, 6, 1, 22800], [2025, 12, 31, 24200]
];
const ANCHORS_SP500 = [
  [2010, 1, 1, 1115], [2013, 12, 1, 1848], [2016, 12, 1, 2238], [2020, 3, 1, 2300], [2021, 12, 1, 4766], [2024, 12, 1, 5550], [2025, 6, 1, 5780], [2025, 12, 31, 6100]
];
const ANCHORS_NASDAQ = [
  [2010, 1, 1, 2308], [2016, 2, 1, 4200], [2020, 3, 1, 6800], [2021, 11, 1, 16000], [2023, 12, 1, 15011], [2024, 12, 1, 17800], [2025, 6, 1, 18500], [2025, 12, 31, 19800]
];
const ANCHORS_DOWJONES = [
  [2010, 1, 1, 10430], [2016, 1, 1, 15600], [2020, 3, 1, 19000], [2022, 1, 1, 36000], [2024, 12, 1, 41200], [2025, 6, 1, 42100], [2025, 12, 31, 44200]
];
const ANCHORS_GERMANY = [
  [2010, 1, 1, 6000], [2015, 4, 1, 12300], [2018, 1, 1, 13500], [2020, 3, 1, 8400], [2021, 12, 1, 15800], [2024, 5, 20, 18700], [2025, 6, 1, 19500], [2025, 12, 31, 20800]
];

const interpolateDaily = (
  startAnchor: number[], 
  endAnchor: number[], 
  name: string, 
  type: 'Reference' | 'Target'
): DataPoint[] => {
  const points: DataPoint[] = [];
  const [sy, sm, sd, sVal] = startAnchor;
  const [ey, em, ed, eVal] = endAnchor;

  const startDate = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  let volatility = 0.015; // Daily volatility is lower than weekly
  if (name.includes('KOSDAQ') || name.includes('NASDAQ') || name.includes('Taiwan')) volatility = 0.025;

  for (let i = 0; i <= diffDays; i++) {
    const ratio = i / diffDays;
    const linearTarget = sVal + (eVal - sVal) * ratio;
    const bridgeFactor = Math.sin(Math.PI * ratio); 
    const randomShift = randomNormal(0, linearTarget * volatility) * (0.3 + bridgeFactor);
    const val = Math.max(0, linearTarget + randomShift);
    
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    // Skip weekends for "daily" feel (simplified)
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    if (d.getTime() > endDate.getTime() && i < diffDays) continue;
    if (i === diffDays) {
       points.push({ date: formatDate(endDate), timestamp: endDate.getTime(), value: eVal, type: type, marketName: name, scenario: 'history' });
       break;
    }
    points.push({ date: formatDate(d), timestamp: d.getTime(), value: val, type: type, marketName: name, scenario: 'history' });
  }
  return points;
};

const generateRealData = (anchors: number[][], name: string, type: 'Reference' | 'Target'): DataPoint[] => {
  let allPoints: DataPoint[] = [];
  const sortedAnchors = [...anchors].sort((a, b) => {
    const dateA = new Date(a[0], a[1]-1, a[2]).getTime();
    const dateB = new Date(b[0], b[1]-1, b[2]).getTime();
    return dateA - dateB;
  });
  for (let i = 0; i < sortedAnchors.length - 1; i++) {
    const segment = interpolateDaily(sortedAnchors[i], sortedAnchors[i+1], name, type);
    if (i > 0) segment.shift();
    allPoints = allPoints.concat(segment);
  }
  return allPoints;
};

export const generateAllMarketData = () => {
  return { 
    japanData: generateRealData(ANCHORS_NIKKEI, 'Nikkei 225', 'Reference'),
    taiwanData: generateRealData(ANCHORS_TAIWAN, 'TWSE', 'Reference'),
    sp500Data: generateRealData(ANCHORS_SP500, 'S&P 500', 'Reference'),
    nasdaqData: generateRealData(ANCHORS_NASDAQ, 'NASDAQ', 'Reference'),
    dowData: generateRealData(ANCHORS_DOWJONES, 'Dow Jones', 'Reference'),
    germanyData: generateRealData(ANCHORS_GERMANY, 'DAX', 'Reference'),
    kospiData: generateRealData(ANCHORS_KOSPI, 'KOSPI', 'Target'),
    kosdaqData: generateRealData(ANCHORS_KOSDAQ, 'KOSDAQ', 'Target')
  };
};

const calculateLSTMNextStep = (prevVal: number, drift: number, volatility: number, momentum: number): { val: number, momentum: number } => {
    const noise = randomNormal(0, volatility);
    const newMomentum = (momentum * 0.85) + (drift * 0.15) + (noise * 0.1); 
    const step = newMomentum * prevVal;
    return { val: prevVal + step, momentum: newMomentum };
};

const calculateBoostingNextStep = (prevVal: number, drift: number, volatility: number): number => {
    const noise = randomNormal(0, volatility);
    let jump = 0;
    if (Math.random() > 0.95) jump = (Math.random() - 0.4) * volatility * 5.0;
    return prevVal * (1 + drift + noise + jump);
};

const calculateStandardNextStep = (prevVal: number, drift: number, volatility: number): number => {
    const noise = randomNormal(0, volatility);
    return prevVal * (1 + drift + noise);
};

const generateModelMetrics = (config: SimulationConfig): ModelMetrics => {
  const isAI = ['LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'].includes(config.modelType);
  
  let features = [
    { feature: 'Market Beta', importance: config.betaWeight * 0.4 },
  ];

  if (config.modelType !== 'CAPM') {
    features.push({ feature: 'Size (SMB)', importance: Math.abs(config.smbWeight) * 0.1 });
    features.push({ feature: 'Value (HML)', importance: config.hmlWeight * 0.15 });
  }

  const extendedModels: ModelType[] = ['FamaFrench5', 'FamaFrench7', 'LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'];
  if (extendedModels.includes(config.modelType)) {
    features.push({ feature: 'Profit (RMW)', importance: config.rmwWeight * 0.1 });
    features.push({ feature: 'Invest (CMA)', importance: config.cmaWeight * 0.05 });
  }

  const advancedModels: ModelType[] = ['FamaFrench7', 'LSTM', 'GRU', 'XGBoost', 'LightGBM', 'Ensemble'];
  if (advancedModels.includes(config.modelType)) {
    features.push({ feature: 'Quality (QMJ*)', importance: config.qmjWeight * 0.2 });
    features.push({ feature: 'Policy (PDF)', importance: config.pdfWeight * 0.25 });
  }

  const comparisonData = [
    { name: 'LSTM', accuracy: 0.82, auc: 0.79, precision: 0.78, recall: 0.77, f1: 0.77, prAuc: 0.76 },
    { name: 'GRU', accuracy: 0.80, auc: 0.77, precision: 0.76, recall: 0.75, f1: 0.75, prAuc: 0.74 },
    { name: 'XGBoost', accuracy: 0.85, auc: 0.83, precision: 0.82, recall: 0.81, f1: 0.81, prAuc: 0.80 },
    { name: 'LightGBM', accuracy: 0.86, auc: 0.84, precision: 0.83, recall: 0.82, f1: 0.82, prAuc: 0.81 },
    { name: 'Ensemble', accuracy: 0.89, auc: 0.87, precision: 0.86, recall: 0.85, f1: 0.85, prAuc: 0.84 }
  ];

  if (isAI) {
    // Add AI specific features to SHAP
    features.push({ feature: 'Time Momentum', importance: 0.3 + Math.random() * 0.2 });
    features.push({ feature: 'Volatility Cluster', importance: 0.15 + Math.random() * 0.1 });
    
    // Realistic base metrics with noise
    let base = { acc: 0.78, auc: 0.75, pre: 0.74, rec: 0.73, f1: 0.73, pr: 0.72 };
    if (config.modelType === 'LSTM') base = { acc: 0.82, auc: 0.79, pre: 0.78, rec: 0.77, f1: 0.77, pr: 0.76 };
    if (config.modelType === 'GRU') base = { acc: 0.80, auc: 0.77, pre: 0.76, rec: 0.75, f1: 0.75, pr: 0.74 };
    if (config.modelType === 'XGBoost') base = { acc: 0.85, auc: 0.83, pre: 0.82, rec: 0.81, f1: 0.81, pr: 0.80 };
    if (config.modelType === 'LightGBM') base = { acc: 0.86, auc: 0.84, pre: 0.83, rec: 0.82, f1: 0.82, pr: 0.81 };
    if (config.modelType === 'Ensemble') base = { acc: 0.89, auc: 0.87, pre: 0.86, rec: 0.85, f1: 0.85, pr: 0.84 };

    // Penalty for high volatility (Regime Shift Failure)
    const volPenalty = config.volatility > 7 ? 0.08 : 0;
    const noiseLevel = 0.05; // Increased noise

    // Generate Calibration Curve with more noise
    const calibrationCurve = Array.from({ length: 10 }, (_, i) => ({
      predicted: (i + 1) / 10,
      actual: Math.max(0, Math.min(1, ((i + 1) / 10) + (Math.random() * 0.15 - 0.075)))
    }));

    // Generate Confusion Matrix with more realistic error rates
    const confusionMatrix = {
      tp: Math.round(450 * (base.acc - volPenalty)),
      tn: Math.round(400 * (base.acc - volPenalty)),
      fp: Math.round(150 * (1 - (base.acc - volPenalty))),
      fn: Math.round(200 * (1 - (base.acc - volPenalty)))
    };

    return {
      accuracy: base.acc - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      rocAuc: base.auc - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      precision: base.pre - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      recall: base.rec - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      f1: base.f1 - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      prAuc: base.pr - volPenalty + (Math.random() * noiseLevel - noiseLevel/2),
      logLoss: 0.35 + Math.random() * 0.2, // Higher log loss
      brierScore: 0.18 + Math.random() * 0.1, // Higher brier score
      calibrationCurve,
      confusionMatrix,
      shapValues: features.sort((a, b) => b.importance - a.importance),
      comparisonIndex: 1.05 + Math.random() * 0.15,
      comparisonData
    };
  } else {
    // Statistical models
    let r2 = 0.65;
    if (config.modelType === 'CAPM') r2 = 0.45;
    if (config.modelType === 'FamaFrench3') r2 = 0.68;
    if (config.modelType === 'FamaFrench5') r2 = 0.78;
    if (config.modelType === 'FamaFrench7') r2 = 0.86;

    return {
      explanatoryPower: r2 + (Math.random() * 0.05),
      shapValues: features.sort((a, b) => b.importance - a.importance),
      comparisonIndex: 1.0,
      comparisonData
    };
  }
};

export const runSimulation = (
  historyData: DataPoint[], 
  config: SimulationConfig
): { alt1: DataPoint[], alt2: DataPoint[], alt3: DataPoint[], metrics: SimulationMetrics } => {
  const alt1: DataPoint[] = []; 
  const alt2: DataPoint[] = []; 
  const alt3: DataPoint[] = []; 

  const modelMetrics = generateModelMetrics(config);

  // Calculate Dynamic Bayesian Weights based on environment
  const calculateEnsembleWeights = (vol: number, horizon: number) => {
    // Base weights
    let w_lstm = 0.3;
    let w_gru = 0.2;
    let w_xgb = 0.35;
    let w_lgbm = 0.15;

    // Adjust for Volatility (High vol favors Boosting for jump detection)
    if (vol > 7) {
      w_xgb += 0.1;
      w_lgbm += 0.05;
      w_lstm -= 0.1;
      w_gru -= 0.05;
    } else if (vol < 3) {
      w_lstm += 0.1;
      w_gru += 0.05;
      w_xgb -= 0.1;
      w_lgbm -= 0.05;
    }

    // Adjust for Horizon (Long horizon favors LSTM for long-term dependencies)
    if (horizon > 84) { // > 7 years
      w_lstm += 0.1;
      w_xgb -= 0.1;
    }

    // Normalize
    const total = w_lstm + w_gru + w_xgb + w_lgbm;
    return {
      lstm: w_lstm / total,
      gru: w_gru / total,
      xgb: w_xgb / total,
      lgbm: w_lgbm / total
    };
  };

  const ensembleWeights = calculateEnsembleWeights(config.volatility, config.durationMonths);
  if (config.modelType === 'Ensemble' && modelMetrics) {
    // Store weights in metrics for UI display
    (modelMetrics as any).ensembleWeights = ensembleWeights;
  }

  if (!historyData || historyData.length === 0) return { 
    alt1, alt2, alt3, 
    metrics: { worstCAGR: 0, moderateCAGR: 0, bestCAGR: 0, modelMetrics } 
  };

  const lastPoint = historyData[historyData.length - 1];
  const startValue = lastPoint.value;
  const startDate = new Date(2025, 11, 31); 
  const toDailyRate = (annualRate: number) => Math.pow(1 + annualRate, 1/252) - 1;

  let annualBaseGrowth = 0.08; 
  let volatilityRef = 0.015; 
  switch (config.referenceMarket) {
    case 'Japan': annualBaseGrowth = 0.10; volatilityRef = 0.012; break;
    case 'Taiwan': annualBaseGrowth = 0.12; volatilityRef = 0.018; break;
    case 'SP500': annualBaseGrowth = 0.11; volatilityRef = 0.010; break;
    case 'NASDAQ': annualBaseGrowth = 0.15; volatilityRef = 0.020; break;
    case 'DowJones': annualBaseGrowth = 0.09; volatilityRef = 0.009; break;
    case 'Germany': annualBaseGrowth = 0.085; volatilityRef = 0.012; break;
  }

  const RISK_FREE_RATE = 0.032;
  const SMB_PREMIUM = 0.025;
  const HML_PREMIUM = 0.032;
  const RMW_PREMIUM = 0.035;
  const CMA_PREMIUM = 0.028;
  const QMJ_PREMIUM = 0.065; // Increased to reflect internalized SCI (Semiconductor Cycle)
  const PDF_PREMIUM = 0.040; // Policy Drive Factor

  const marketPremium = annualBaseGrowth - RISK_FREE_RATE;
  const simVol = (volatilityRef) * (config.volatility / 5.0);
  const totalDays = Math.floor(config.durationMonths * 21); 

  let val1 = startValue, val2 = startValue, val3 = startValue;
  let m1 = 0, m2 = 0, m3 = 0;

  // Augmented QMJ* Calculation: Internalized SCI (Semiconductor Cycle)
  // qmjWeight now represents the combined strength of Quality + Semiconductor Cycle
  const qmjStar = config.qmjWeight * (1 + config.pdfWeight * 0.3);
  
  // Interaction Effect between Quality/SCI and Policy
  const interactionEffect = config.pdfWeight * qmjStar * 0.04;

  const calculateAnnualReturn = (scenario: 'worst' | 'moderate' | 'best') => {
    let base = RISK_FREE_RATE;
    const mkt = config.betaWeight * marketPremium;
    const smb = config.smbWeight * SMB_PREMIUM;
    const hml = config.hmlWeight * HML_PREMIUM;
    const rmw = config.rmwWeight * RMW_PREMIUM;
    const cma = config.cmaWeight * CMA_PREMIUM;
    const qmj = qmjStar * QMJ_PREMIUM;
    const pdf = config.pdfWeight * PDF_PREMIUM;

    if (scenario === 'worst') {
        // Value Trap Scenario: Governance failure, SCI downturn
        return RISK_FREE_RATE + (0.5 * marketPremium) - (0.3 * SMB_PREMIUM);
    }

    let ret = 0;
    switch (config.modelType) {
        case 'CAPM':
            ret = base + mkt;
            break;
        case 'FamaFrench3':
            ret = base + mkt + smb + hml;
            break;
        case 'FamaFrench5':
            ret = base + mkt + smb + hml + rmw + cma;
            break;
        case 'FamaFrench7':
        default:
            // FF7 Augmented with QMJ* (Internalized SCI) and PDF
            ret = base + mkt + smb + hml + rmw + cma + qmj + pdf + interactionEffect;
            break;
    }

    if (scenario === 'best') ret += 0.04; // Enhanced Alpha boost
    return ret;
  };

  const worstAnn = calculateAnnualReturn('worst');
  const moderateAnn = calculateAnnualReturn('moderate');
  const bestAnn = calculateAnnualReturn('best');

  // RIM (Residual Income Model) Valuation Logic
  const calculateRIMMultiple = (t: number, total: number) => {
    const progress = t / total;
    // Multiple expansion based on QMJ* (SCI) and PDF
    const multipleBoost = (config.qmjWeight * 0.5 + config.pdfWeight * 0.3) * progress;
    return 1 + multipleBoost;
  };

  for (let i = 1; i <= totalDays; i++) {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    
    const dayOfWeek = newDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dStr = formatDate(newDate); 
    const ts = newDate.getTime();

    const lambda = Math.min(1.0, 0.3 + (i / totalDays) * 0.7);
    const rimFactor = calculateRIMMultiple(i, totalDays);
    
    const d1 = toDailyRate(worstAnn);
    const d2 = toDailyRate(moderateAnn * (0.7 + 0.3 * lambda) * rimFactor);
    const d3 = toDailyRate(bestAnn * (0.6 + 0.4 * lambda) * rimFactor);

    if (config.modelType === 'LSTM' || config.modelType === 'GRU') {
        const r1 = calculateLSTMNextStep(val1, d1, simVol * 0.8, m1); val1 = r1.val; m1 = r1.momentum;
        const r2 = calculateLSTMNextStep(val2, d2, simVol * 0.8, m2); val2 = r2.val; m2 = r2.momentum;
        const r3 = calculateLSTMNextStep(val3, d3, simVol * 0.8, m3); val3 = r3.val; m3 = r3.momentum;
    } else if (config.modelType === 'XGBoost' || config.modelType === 'LightGBM') {
        val1 = calculateBoostingNextStep(val1, d1, simVol * 1.1);
        val2 = calculateBoostingNextStep(val2, d2, simVol * 1.1);
        val3 = calculateBoostingNextStep(val3, d3, simVol * 1.1);
    } else if (config.modelType === 'Ensemble') {
        // Dynamic Bayesian Weights based on environment
        const { lstm: w_lstm, gru: w_gru, xgb: w_xgb, lgbm: w_lgbm } = ensembleWeights;
        
        // Simulate each component for one step and ensemble
        const step_lstm = calculateLSTMNextStep(val2, d2, simVol * 0.8, m2);
        const step_gru = calculateLSTMNextStep(val2, d2, simVol * 0.8, m2); // Simplified
        const step_xgb = calculateBoostingNextStep(val2, d2, simVol * 1.1);
        const step_lgbm = calculateBoostingNextStep(val2, d2, simVol * 1.1); // Simplified
        
        // Moderate path ensemble
        val2 = (step_lstm.val * w_lstm) + (step_gru.val * w_gru) + (step_xgb * w_xgb) + (step_lgbm * w_lgbm);
        m2 = (step_lstm.momentum * w_lstm) + (step_gru.momentum * w_gru);

        // Same for others (simplified for worst/best)
        val1 = calculateStandardNextStep(val1, d1, simVol);
        val3 = calculateStandardNextStep(val3, d3, simVol * 1.2); // Ensemble often finds better alpha
    } else {
        val1 = calculateStandardNextStep(val1, d1, simVol);
        val2 = calculateStandardNextStep(val2, d2, simVol);
        val3 = calculateStandardNextStep(val3, d3, simVol);
    }

    alt1.push({ date: dStr, timestamp: ts, value: val1, type: 'Prediction', scenario: 'alt1_worst' });
    alt2.push({ date: dStr, timestamp: ts, value: val2, type: 'Prediction', scenario: 'alt2_moderate' });
    alt3.push({ date: dStr, timestamp: ts, value: val3, type: 'Prediction', scenario: 'alt3_best' });
  }

  return { 
    alt1, alt2, alt3, 
    metrics: { worstCAGR: worstAnn, moderateCAGR: moderateAnn, bestCAGR: bestAnn, modelMetrics } 
  };
};
