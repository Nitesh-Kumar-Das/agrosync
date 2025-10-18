from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional
import sys
import os
from pathlib import Path
import uvicorn
import uuid
import logging
from datetime import datetime
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
if MODELS_DIR.exists():
    logger.info(f"Using models directory: {MODELS_DIR}")
else:
    MODELS_DIR = Path("/app/models")
    logger.info(f"Using Docker models directory: {MODELS_DIR}")
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(MODELS_DIR.parent) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR.parent))
from models.crop.crop_recommendation_model import CropRecommendationModel
from models.fertilizer.fertilizer_prediction_model import FertilizerPredictionModel
from models.yield_prediction.crop_yield_prediction_model import CropYieldPredictionModel
from models.disease.plant_disease_detection_cnn import PlantDiseaseDetectionModel
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/jpg', 'image/png'}
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
app = FastAPI(
    title="AgroAI ML Service",
    description="Machine Learning service for agricultural predictions",
    version="1.0.0"
)
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Restricted to specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only needed methods
    allow_headers=["*"],
)
logger.info("Loading ML models...")
crop_model = CropRecommendationModel()
fertilizer_model = FertilizerPredictionModel()
yield_model = CropYieldPredictionModel()
disease_model = PlantDiseaseDetectionModel()
try:
    crop_model.load_model(str(MODELS_DIR / 'crop'))
    logger.info("✓ Crop recommendation model loaded")
except Exception as e:
    logger.error(f"✗ Failed to load crop model: {e}")
try:
    fertilizer_model.load_model(str(MODELS_DIR / 'fertilizer'))
    logger.info("✓ Fertilizer prediction model loaded")
except Exception as e:
    logger.error(f"✗ Failed to load fertilizer model: {e}")
try:
    yield_model.load_model(str(MODELS_DIR / 'yield_prediction'))
    logger.info("✓ Yield prediction model loaded")
except Exception as e:
    logger.error(f"✗ Failed to load yield model: {e}")
try:
    disease_model.load_model(str(MODELS_DIR / 'disease' / 'best_plant_disease.pth'))
    logger.info("✓ Disease detection model loaded")
except Exception as e:
    logger.error(f"✗ Failed to load disease model: {e}")
logger.info("All models loaded successfully!\n")
class CropRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content (0-200 kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content (0-200 kg/ha)")
    potassium: float = Field(..., ge=0, le=200, description="Potassium content (0-200 kg/ha)")
    temperature: float = Field(..., ge=-50, le=60, description="Temperature (-50 to 60°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (0-100%)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH (0-14)")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (0-5000mm)")
class FertilizerRequest(BaseModel):
    temperature: float = Field(..., ge=-50, le=60, description="Temperature (-50 to 60°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (0-100%)")
    moisture: float = Field(..., ge=0, le=100, description="Soil moisture (0-100%)")
    soil_type: str = Field(..., description="Soil type")
    crop_type: str = Field(..., min_length=2, max_length=50, description="Crop type")
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content (0-200 kg/ha)")
    potassium: float = Field(..., ge=0, le=200, description="Potassium content (0-200 kg/ha)")
    phosphorous: float = Field(..., ge=0, le=200, description="Phosphorus content (0-200 kg/ha)")
    @validator('soil_type')
    def validate_soil_type(cls, v):
        allowed = {'Sandy', 'Loamy', 'Black', 'Red', 'Clayey'}
        if v not in allowed:
            raise ValueError(f"Soil type must be one of: {', '.join(allowed)}")
        return v
class YieldRequest(BaseModel):
    state: str = Field(..., min_length=2, max_length=100, description="State name")
    district: str = Field(..., min_length=2, max_length=100, description="District name")
    season: str = Field(..., description="Growing season")
    crop: str = Field(..., min_length=2, max_length=100, description="Crop name")
    year: int = Field(..., ge=1950, le=2100, description="Year (1950-2100)")
    area: float = Field(..., ge=0.01, le=1000000, description="Area in hectares")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (0-5000mm)")
    @validator('season')
    def validate_season(cls, v):
        allowed = {'Kharif', 'Rabi', 'Summer', 'Winter', 'Whole Year', 'Autumn'}
        if v not in allowed:
            raise ValueError(f"Season must be one of: {', '.join(allowed)}")
        return v
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    duration = (datetime.now() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - Duration: {duration:.2f}s")
    return response
@app.get("/")
async def root():
    return {
        "message": "AgroAI ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "crop": "/predict_crop",
            "disease": "/detect_disease",
            "fertilizer": "/predict_fertilizer",
            "yield": "/predict_yield",
            "health": "/health"
        }
    }
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "crop": "loaded",
            "fertilizer": "loaded",
            "yield": "loaded",
            "disease": "loaded"
        }
    }
@app.post("/predict_crop")
async def predict_crop(request: CropRequest):
    try:
        logger.info(f"Crop prediction request: N={request.nitrogen}, P={request.phosphorus}, K={request.potassium}")
        input_data = {
            'N': request.nitrogen,
            'P': request.phosphorus,
            'K': request.potassium,
            'temperature': request.temperature,
            'humidity': request.humidity,
            'ph': request.ph,
            'rainfall': request.rainfall
        }
        prediction, probabilities = crop_model.predict(input_data)
        confidence = float(probabilities[0].max())
        logger.info(f"Crop prediction successful: {prediction[0]} (confidence: {confidence:.2f})")
        return {
            "crop": prediction[0],
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"Crop prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict crop recommendation")
@app.post("/detect_disease")
async def detect_disease(file: UploadFile = File(...)):
    temp_path = None
    try:
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        temp_path = Path("uploads") / unique_filename
        temp_path.parent.mkdir(exist_ok=True)
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
        try:
            disease, confidence = disease_model.predict(str(temp_path))
            recommendation = get_disease_recommendation(disease)
            logger.info(f"Disease detection successful: {disease} (confidence: {confidence}%)")
            return {
                "disease": disease,
                "confidence": float(confidence) / 100,  # Convert to 0-1 range
                "recommendation": recommendation
            }
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to detect plant disease")
@app.post("/predict_fertilizer")
async def predict_fertilizer(request: FertilizerRequest):
    try:
        logger.info(f"Fertilizer prediction request: Soil={request.soil_type}, Crop={request.crop_type}")
        input_data = {
            'Temparature': request.temperature,  # Note: Original dataset has typo "Temparature"
            'Humidity ': request.humidity,  # Note: Has trailing space in original dataset
            'Moisture': request.moisture,
            'Soil Type': request.soil_type,
            'Crop Type': request.crop_type,
            'Nitrogen': request.nitrogen,
            'Potassium': request.potassium,
            'Phosphorous': request.phosphorous
        }
        prediction, probabilities = fertilizer_model.predict(input_data)
        confidence = float(probabilities[0].max())
        logger.info(f"Fertilizer prediction successful: {prediction[0]} (confidence: {confidence:.2f})")
        return {
            "fertilizer": prediction[0],
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"Fertilizer prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict fertilizer recommendation")
@app.post("/predict_yield")
async def predict_yield(request: YieldRequest):
    try:
        logger.info(f"Yield prediction request: {request.crop} in {request.district}, {request.state}")
        input_data = {
            'State': request.state,
            'District': request.district,
            'Season': request.season,
            'Crop': request.crop,
            'Year': request.year,
            'Area': request.area,
            'Rainfall': request.rainfall
        }
        prediction = yield_model.predict(input_data)
        logger.info(f"Yield prediction successful: {prediction[0]:.2f} tonnes")
        return {
            "predictedYield": float(prediction[0]),
            "unit": "tonnes"
        }
    except Exception as e:
        logger.error(f"Yield prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict crop yield")
def get_disease_recommendation(disease: str) -> str:
    recommendations = {
        "Tomato_Late_blight": "Apply copper-based fungicide. Remove infected leaves. Ensure good air circulation.",
        "Tomato_Early_blight": "Use chlorothalonil fungicide. Practice crop rotation. Water at soil level.",
        "Tomato_Bacterial_spot": "Apply copper sprays. Remove infected plants. Use resistant varieties.",
        "Tomato_Leaf_Mold": "Improve ventilation. Reduce humidity. Apply fungicide if severe.",
        "Tomato_Septoria_leaf_spot": "Remove infected leaves. Apply fungicide. Mulch around plants.",
        "Tomato_Spider_mites_Two_spotted_spider_mite": "Spray with neem oil. Increase humidity. Use predatory mites.",
        "Tomato__Target_Spot": "Apply fungicide. Remove affected leaves. Improve air circulation.",
        "Tomato__Tomato_YellowLeaf__Curl_Virus": "Control whiteflies. Remove infected plants. Use resistant varieties.",
        "Tomato__Tomato_mosaic_virus": "Remove infected plants. Sanitize tools. Use virus-free seeds.",
        "Tomato_healthy": "Plant is healthy! Continue regular care and monitoring.",
        "Potato___Early_blight": "Apply fungicide. Remove infected foliage. Practice crop rotation.",
        "Potato___Late_blight": "Use copper fungicide. Destroy infected plants. Ensure proper spacing.",
        "Potato___healthy": "Potato plant is healthy! Maintain current care practices.",
        "Pepper__bell___Bacterial_spot": "Apply copper bactericide. Remove infected leaves. Use drip irrigation.",
        "Pepper__bell___healthy": "Pepper plant is healthy! Keep up the good work!"
    }
    return recommendations.get(disease, "Consult local agricultural expert for treatment advice.")
if __name__ == "__main__":
    is_dev = os.getenv('ENV', 'development') == 'development'
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=is_dev,
        log_level="info"
    )
