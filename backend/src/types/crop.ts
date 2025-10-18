export interface CropPredictionInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}
export interface CropPredictionResult {
  crop: string;
  confidence: number;
}
