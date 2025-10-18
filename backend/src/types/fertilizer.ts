export interface FertilizerPredictionInput {
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: string;
  cropType: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
}
export interface FertilizerPredictionResult {
  fertilizer: string;
  confidence?: number;
}
