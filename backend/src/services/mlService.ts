import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import logger from '../middleware/logger';
const PYTHON_API = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
interface MLServiceOptions {
  timeout?: number;
  retries?: number;
}
class MLService {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  constructor(options: MLServiceOptions = {}) {
    this.baseURL = PYTHON_API;
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
  }
  async callPythonModel<T = any>(
    endpoint: string,
    data: any,
    isFile: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let attempt = 0;
    while (attempt < this.retries) {
      try {
        logger.debug(`ML Service: Calling ${url} (attempt ${attempt + 1})`);
        const config: any = {
          timeout: this.timeout,
          headers: isFile ? { 'Content-Type': 'multipart/form-data' } : {},
        };
        const response = await axios.post(url, data, config);
        logger.info(`ML Service: Success - ${endpoint}`);
        return response.data;
      } catch (error) {
        attempt++;
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          logger.error(`ML Service Error (${endpoint}): ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
          throw new Error(`ML Service returned error: ${axiosError.response.data}`);
        } else if (axiosError.request) {
          logger.error(`ML Service Error (${endpoint}): No response received`);
          if (attempt >= this.retries) {
            throw new Error('ML Service is not responding. Please ensure Python backend is running.');
          }
        } else {
          logger.error(`ML Service Error (${endpoint}): ${axiosError.message}`);
          throw new Error(`Failed to call ML Service: ${axiosError.message}`);
        }
        if (attempt < this.retries) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.info(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error(`Failed to call ML Service after ${this.retries} attempts`);
  }
  async predictCrop(data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }): Promise<any> {
    return this.callPythonModel('/predict_crop', data);
  }
  async detectDisease(imageBuffer: Buffer, filename: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageBuffer, filename);
    return this.callPythonModel('/detect_disease', formData, true);
  }
  async predictFertilizer(data: {
    temperature: number;
    humidity: number;
    moisture: number;
    soil_type: string;
    crop_type: string;
    nitrogen: number;
    potassium: number;
    phosphorous: number;
  }): Promise<any> {
    return this.callPythonModel('/predict_fertilizer', data);
  }
  async predictYield(data: {
    state: string;
    district: string;
    season: string;
    crop: string;
    year: number;
    area: number;
    rainfall: number;
  }): Promise<any> {
    return this.callPythonModel('/predict_yield', data);
  }
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
export default new MLService();
