export interface YieldPredictionInput {
  state: string;
  district: string;
  season: string;
  crop: string;
  year: number;
  area: number;
  rainfall: number;
}
export interface YieldPredictionResult {
  predictedYield: number;
  unit: string;
}
