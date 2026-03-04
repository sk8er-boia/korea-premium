
import { GoogleGenAI } from "@google/genai";
import { SimulationConfig, SimulationMetrics, DataPoint } from "../types";

export const analyzeSimulationResults = async (
  apiKey: string,
  config: SimulationConfig,
  metrics: SimulationMetrics,
  historyData: DataPoint[],
  simResults: { alt1: DataPoint[], alt2: DataPoint[], alt3: DataPoint[] }
): Promise<string> => {
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a world-class financial analyst specializing in the Korean stock market (KOSPI/KOSDAQ) and the "Korea Value-Up" initiative.
    Analyze the following simulation results and provide a professional, data-driven insight report in Korean.

    ### Simulation Configuration:
    - Target Index: ${config.targetIndex}
    - Reference Market: ${config.referenceMarket}
    - Model Type: ${config.modelType}
    - Factors: Beta(${config.betaWeight}), SMB(${config.smbWeight}), HML(${config.hmlWeight}), RMW(${config.rmwWeight}), CMA(${config.cmaWeight}), QMJ*(${config.qmjWeight}), PDF(${config.pdfWeight})
    - Duration: ${config.durationMonths} months

    ### Simulation Metrics (CAGR):
    - Worst Case: ${(metrics.worstCAGR * 100).toFixed(2)}%
    - Moderate Case: ${(metrics.moderateCAGR * 100).toFixed(2)}%
    - Best Case: ${(metrics.bestCAGR * 100).toFixed(2)}%

    ### Context:
    The "Korea Value-Up" program aims to resolve the "Korea Discount" by improving corporate governance, shareholder returns, and capital efficiency, similar to the reforms seen in the Japanese market (TSE).

    ### Task:
    1. **Model Methodology & Context**: 
       - If the model is CAPM: Explain the Capital Asset Pricing Model and how it uses Beta to estimate returns.
       - If the model is FF3: Explain how it builds on CAPM by adding SMB (Size) and HML (Value) factors.
       - If the model is FF5: Explain how it builds on FF3 by adding RMW (Profitability) and CMA (Investment) factors.
       - If the model is FF7: Explain how it builds on FF5 by adding QMJ* (Quality) and PDF (Policy-Drive) factors.
       - If the model is LSTM/GRU/XGBoost/LightGBM/Ensemble: Provide a brief technical description of the algorithm and its strengths in financial time-series forecasting.
    
    2. **Calculated Values & Performance Analysis**: 
       - Analyze the specific metrics provided (CAGR, Accuracy/R², etc.) in the context of the chosen model (${config.modelType}).
       - Explain how the factor weights (Beta: ${config.betaWeight}, SMB: ${config.smbWeight}, HML: ${config.hmlWeight}, RMW: ${config.rmwWeight}, CMA: ${config.cmaWeight}, QMJ*: ${config.qmjWeight}, PDF: ${config.pdfWeight}) influenced the final index predictions.
    
    3. **Scenario Assessment**: 
       - Evaluate the probability of the 'Best Case' vs 'Worst Case' given current global macro conditions and the chosen reference market (${config.referenceMarket}).
    
    4. **Strategic Advice**: 
       - Provide 3 actionable investment or policy recommendations to achieve the 'Best Case' scenario for ${config.targetIndex}.

    Please format the response in clean Markdown with professional terminology. Use a sophisticated, analytical tone. Ensure the explanation is strictly limited to the factors and methodology relevant to the selected model (${config.modelType}).
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "분석 결과를 생성할 수 없습니다.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("not found")) {
      throw new Error("INVALID_API_KEY");
    }
    throw new Error("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};
