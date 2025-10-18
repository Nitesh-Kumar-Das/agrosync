export interface DiseasePredictionResult {
  disease: string;
  confidence: number;
  recommendation?: string;
}
export interface DiseaseDetectionInput {
  image: Express.Multer.File;
}
