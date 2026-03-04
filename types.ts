
export type ScenarioType = 'history' | 'alt1_worst' | 'alt2_moderate' | 'alt3_best';
export type ReferenceMarket = 'Japan' | 'Taiwan' | 'SP500' | 'NASDAQ' | 'DowJones' | 'Germany';
export type TargetIndex = 'KOSPI' | 'KOSDAQ';
export type ModelType = 'CAPM' | 'FamaFrench3' | 'FamaFrench5' | 'FamaFrench7' | 'LSTM' | 'GRU' | 'XGBoost' | 'LightGBM' | 'Ensemble';

export interface DataPoint {
  date: string; // YYYY-MM-DD
  timestamp: number;
  value: number; // The actual index value
  ratio?: number; // Percentage growth from simulation start
  type: 'Reference' | 'Target' | 'Prediction';
  marketName?: string; 
  scenario: ScenarioType;
}

export interface SimulationConfig {
  // Augmented 7-Factor Inputs
  betaWeight: number;   // Market Risk (Mkt-RF)
  smbWeight: number;    // Size (Small Minus Big)
  hmlWeight: number;    // Value (High Minus Low)
  rmwWeight: number;    // Profitability (Robust Minus Weak)
  cmaWeight: number;    // Investment (Conservative Minus Aggressive)
  qmjWeight: number;    // Quality (QMJ*) - Internalizes SCI
  pdfWeight: number;    // Policy-Drive Factor (PDF)

  volatility: number;   // Random noise level (1 - 10)
  durationMonths: number; // 12 - 120
  referenceMarket: ReferenceMarket;
  targetIndex: TargetIndex;
  historyCutoffYear: number; // Limit historical data to this year
  
  // AI Model Selection
  modelType: ModelType;
}

export interface SHAPValue {
  feature: string;
  importance: number;
}

export interface ModelComparisonData {
  name: string;
  accuracy: number;
  auc: number;
  precision: number;
  recall: number;
  f1: number;
  prAuc: number;
}

export interface CalibrationPoint {
  predicted: number;
  actual: number;
}

export interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export interface ModelMetrics {
  accuracy?: number; // RMSE or R-squared
  rocAuc?: number; // Area Under Curve
  precision?: number;
  recall?: number;
  f1?: number;
  prAuc?: number;
  logLoss?: number;
  brierScore?: number;
  calibrationCurve?: CalibrationPoint[];
  confusionMatrix?: ConfusionMatrix;
  explanatoryPower?: number; // R-squared for statistical models
  shapValues: SHAPValue[];
  comparisonIndex: number; // Relative performance index
  comparisonData?: ModelComparisonData[];
  ensembleWeights?: {
    lstm: number;
    gru: number;
    xgb: number;
    lgbm: number;
  };
}

export interface SimulationMetrics {
  worstCAGR: number;
  moderateCAGR: number;
  bestCAGR: number;
  modelMetrics: ModelMetrics;
}
