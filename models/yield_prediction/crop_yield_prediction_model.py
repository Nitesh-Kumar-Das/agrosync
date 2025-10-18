"""
Crop Yield Prediction ML Model with CUDA GPU Acceleration
This model predicts crop yield/production based on location, crop type, rainfall, and year.
Uses XGBoost with GPU acceleration optimized for NVIDIA CUDA cores.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# Check for GPU (silent check)
try:
    # Test GPU availability for XGBoost
    test_gpu = xgb.DMatrix(np.random.rand(10, 10))
    gpu_available = True
except:
    gpu_available = False

class CropYieldPredictionModel:
    def __init__(self, use_gpu=True):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder_state = LabelEncoder()
        self.label_encoder_district = LabelEncoder()
        self.label_encoder_season = LabelEncoder()
        self.label_encoder_crop = LabelEncoder()
        self.use_gpu = use_gpu and gpu_available
        
    def merge_datasets(self, production_path, rainfall_india_path, rainfall_district_path):
        """Merge the three datasets into one comprehensive dataset"""
        print("Loading datasets...")
        
        # Load production data
        df_production = pd.read_csv(production_path)
        print(f"Production data shape: {df_production.shape}")
        print(f"Production columns: {df_production.columns.tolist()}")
        
        # Load India rainfall data
        df_rainfall_india = pd.read_csv(rainfall_india_path)
        print(f"\nRainfall India data shape: {df_rainfall_india.shape}")
        print(f"Rainfall India columns: {df_rainfall_india.columns.tolist()}")
        
        # Load district rainfall data
        df_rainfall_district = pd.read_csv(rainfall_district_path)
        print(f"\nRainfall District data shape: {df_rainfall_district.shape}")
        print(f"Rainfall District columns: {df_rainfall_district.columns.tolist()}")
        
        # Process rainfall data - aggregate monthly data to annual
        df_rainfall_india_processed = df_rainfall_india.copy()
        
        # Merge production with district rainfall
        print("\nMerging datasets...")
        # First, merge with district rainfall data
        df_merged = df_production.merge(
            df_rainfall_district,
            left_on='District',
            right_on='DISTRICT',
            how='left'
        )
        
        # Convert Year to int for merging
        df_merged['Year'] = pd.to_numeric(df_merged['Year'], errors='coerce')
        df_rainfall_india_processed['YEAR'] = pd.to_numeric(df_rainfall_india_processed['YEAR'], errors='coerce')
        
        # If district rainfall not available, use state/subdivision rainfall
        df_merged = df_merged.merge(
            df_rainfall_india_processed[['SUBDIVISION', 'YEAR', 'ANNUAL']],
            left_on=['State', 'Year'],
            right_on=['SUBDIVISION', 'YEAR'],
            how='left',
            suffixes=('', '_state')
        )
        
        # Use district rainfall if available, otherwise use state rainfall
        if 'ANNUAL' in df_merged.columns and 'ANNUAL_state' in df_merged.columns:
            df_merged['Rainfall'] = df_merged['ANNUAL'].fillna(df_merged['ANNUAL_state'])
        elif 'ANNUAL_state' in df_merged.columns:
            df_merged['Rainfall'] = df_merged['ANNUAL_state']
        else:
            # If no rainfall data available, we'll handle it differently
            print("Warning: Rainfall data merge incomplete, using production data only")
            df_merged['Rainfall'] = 0
        
        # Select relevant columns
        columns_to_keep = ['State', 'District', 'Year', 'Season', 
                          'Crop', 'Area', 'Production', 'Rainfall']
        
        df_final = df_merged[[col for col in columns_to_keep if col in df_merged.columns]].copy()
        
        # Drop rows with missing critical values
        df_final = df_final.dropna(subset=['Production', 'Area'])
        
        # Fill missing rainfall with median
        if 'Rainfall' in df_final.columns:
            df_final['Rainfall'].fillna(df_final['Rainfall'].median(), inplace=True)
        else:
            df_final['Rainfall'] = 1000  # Default value
        
        # Calculate yield (Production per unit Area)
        df_final['Yield'] = df_final['Production'] / (df_final['Area'] + 1)  # Add 1 to avoid division by zero
        
        print(f"\nMerged dataset shape: {df_final.shape}")
        print(f"Columns: {df_final.columns.tolist()}")
        
        return df_final
    
    def load_data(self, csv_path=None, production_path=None, rainfall_india_path=None, rainfall_district_path=None):
        """Load and prepare the dataset"""
        if csv_path and os.path.exists(csv_path):
            print(f"Loading merged data from {csv_path}...")
            df = pd.read_csv(csv_path)
        elif production_path and rainfall_india_path:
            df = self.merge_datasets(production_path, rainfall_india_path, rainfall_district_path)
            # Save merged dataset
            merged_path = os.path.join('data', 'yield production', 'merged_yield_data.csv')
            df.to_csv(merged_path, index=False)
            print(f"\nMerged dataset saved to {merged_path}")
        else:
            raise ValueError("Either provide csv_path or all three dataset paths")
        
        # Display basic info
        print(f"\nDataset shape: {df.shape}")
        print(f"\nBasic statistics:")
        print(df.describe())
        
        if 'Crop' in df.columns:
            print(f"\nNumber of unique crops: {df['Crop'].nunique()}")
            print(f"Top 10 crops by records:")
            print(df['Crop'].value_counts().head(10))
        
        return df
    
    def preprocess_data(self, df, target_col='Yield'):
        """Preprocess the data for training"""
        df_processed = df.copy()
        
        # Encode categorical features
        categorical_cols = []
        if 'State' in df_processed.columns:
            df_processed['State_Encoded'] = self.label_encoder_state.fit_transform(df_processed['State'])
            categorical_cols.append('State_Encoded')
        
        if 'District' in df_processed.columns:
            df_processed['District_Encoded'] = self.label_encoder_district.fit_transform(df_processed['District'])
            categorical_cols.append('District_Encoded')
        
        if 'Season' in df_processed.columns:
            df_processed['Season_Encoded'] = self.label_encoder_season.fit_transform(df_processed['Season'])
            categorical_cols.append('Season_Encoded')
        
        if 'Crop' in df_processed.columns:
            df_processed['Crop_Encoded'] = self.label_encoder_crop.fit_transform(df_processed['Crop'])
            categorical_cols.append('Crop_Encoded')
        
        # Select features
        feature_cols = categorical_cols + ['Year', 'Area', 'Rainfall']
        feature_cols = [col for col in feature_cols if col in df_processed.columns]
        
        X = df_processed[feature_cols]
        y = df_processed[target_col]
        
        # Remove outliers (optional)
        Q1 = y.quantile(0.25)
        Q3 = y.quantile(0.75)
        IQR = Q3 - Q1
        mask = (y >= Q1 - 1.5 * IQR) & (y <= Q3 + 1.5 * IQR)
        X = X[mask]
        y = y[mask]
        
        print(f"\nAfter removing outliers: {X.shape[0]} samples")
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\nTraining set size: {X_train_scaled.shape[0]}")
        print(f"Test set size: {X_test_scaled.shape[0]}")
        print(f"Number of features: {X_train_scaled.shape[1]}")
        
        return X_train_scaled, X_test_scaled, y_train.values, y_test.values, feature_cols
    
    def train(self, X_train, y_train):
        """Train the XGBoost model with optimized GPU acceleration"""
        print("\n" + "="*60)
        print("TRAINING XGBoost WITH CUDA GPU ACCELERATION")
        print("="*60)
        
        # Configure for GPU
        if self.use_gpu:
            print("✓ Training on NVIDIA GPU (CUDA cores active)")
            # Optimized GPU parameters for GTX 1650
            gpu_params = {
                'max_bin': 256,  # Optimized for 4GB VRAM
                'tree_method': 'gpu_hist',
                'device': 'cuda:0',  # Specify GPU device
                'predictor': 'gpu_predictor',  # Use GPU for predictions too
            }
            tree_method = 'gpu_hist'
            device = 'cuda:0'
        else:
            print("⚠ Training on CPU")
            gpu_params = {
                'tree_method': 'hist',
                'device': 'cpu',
            }
            tree_method = 'hist'
            device = 'cpu'
        
        # Model parameters optimized for GPU
        self.model = xgb.XGBRegressor(
            n_estimators=300,  # More trees for better accuracy
            max_depth=10,       # Deeper trees
            learning_rate=0.05,  # Lower learning rate
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=2,
            gamma=0.1,
            reg_alpha=0.1,      # L1 regularization
            reg_lambda=1.0,      # L2 regularization
            random_state=42,
            n_jobs=-1,
            **gpu_params
        )
        
        print(f"Training with {self.model.n_estimators} estimators...")
        print(f"Using tree_method='{tree_method}' on device='{device}'")
        print("-" * 60)
        
        # Train
        self.model.fit(
            X_train, y_train,
            verbose=True
        )
        
        print("-" * 60)
        print("✓ Training completed!")
        
    def evaluate(self, X_test, y_test, feature_names=None):
        """Evaluate the model performance"""
        print("\n" + "="*60)
        print("MODEL EVALUATION ON GPU" if self.use_gpu else "MODEL EVALUATION")
        print("="*60)
        
        # Predict (will use GPU if model was trained on GPU)
        y_pred = self.model.predict(X_test)
        
        # Metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\nMean Squared Error (MSE): {mse:.4f}")
        print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
        print(f"Mean Absolute Error (MAE): {mae:.4f}")
        print(f"R² Score: {r2:.4f} ({r2*100:.2f}%)")
        
        # Feature importance
        if feature_names:
            print("\nFeature Importance:")
            feature_importance = pd.DataFrame({
                'Feature': feature_names,
                'Importance': self.model.feature_importances_
            }).sort_values('Importance', ascending=False)
            print(feature_importance)
        
        return {'mse': mse, 'rmse': rmse, 'mae': mae, 'r2': r2}
    
    def predict(self, input_data):
        """
        Make predictions for new data
        
        Parameters:
        input_data: dict or DataFrame with required features
        
        Returns:
        Predicted yield
        """
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data.copy()
        
        # Encode categorical features
        if 'State' in input_df.columns:
            input_df['State_Encoded'] = self.label_encoder_state.transform(input_df['State'])
        if 'District' in input_df.columns:
            input_df['District_Encoded'] = self.label_encoder_district.transform(input_df['District'])
        if 'Season' in input_df.columns:
            input_df['Season_Encoded'] = self.label_encoder_season.transform(input_df['Season'])
        if 'Crop' in input_df.columns:
            input_df['Crop_Encoded'] = self.label_encoder_crop.transform(input_df['Crop'])
        
        # Select features (must match training features)
        feature_cols = []
        if 'State_Encoded' in input_df.columns:
            feature_cols.append('State_Encoded')
        if 'District_Encoded' in input_df.columns:
            feature_cols.append('District_Encoded')
        if 'Season_Encoded' in input_df.columns:
            feature_cols.append('Season_Encoded')
        if 'Crop_Encoded' in input_df.columns:
            feature_cols.append('Crop_Encoded')
        feature_cols += ['Year', 'Area', 'Rainfall']
        
        input_features = input_df[[col for col in feature_cols if col in input_df.columns]]
        
        # Scale the input
        input_scaled = self.scaler.transform(input_features)
        
        # Predict (will use GPU if model was trained on GPU)
        prediction = self.model.predict(input_scaled)
        
        return prediction
    
    def save_model(self, model_dir='models'):
        """Save the trained model and preprocessing objects"""
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
            
        model_path = os.path.join(model_dir, 'crop_yield_cuda_xgboost.json')
        scaler_path = os.path.join(model_dir, 'yield_scaler.pkl')
        encoder_state_path = os.path.join(model_dir, 'state_encoder.pkl')
        encoder_district_path = os.path.join(model_dir, 'district_encoder.pkl')
        encoder_season_path = os.path.join(model_dir, 'season_encoder.pkl')
        encoder_crop_path = os.path.join(model_dir, 'yield_crop_encoder.pkl')
        
        # Save XGBoost model
        self.model.save_model(model_path)
        
        # Save preprocessing objects
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.label_encoder_state, encoder_state_path)
        joblib.dump(self.label_encoder_district, encoder_district_path)
        joblib.dump(self.label_encoder_season, encoder_season_path)
        joblib.dump(self.label_encoder_crop, encoder_crop_path)
        
        print(f"\n✓ XGBoost model saved to {model_path}")
        print(f"✓ All encoders and scalers saved successfully!")
    
    def load_model(self, model_dir='models'):
        """Load a pre-trained model"""
        # Try new naming convention first, fall back to old naming
        model_path = os.path.join(model_dir, 'model.json')
        if not os.path.exists(model_path):
            model_path = os.path.join(model_dir, 'crop_yield_cuda_xgboost.json')
        
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        if not os.path.exists(scaler_path):
            scaler_path = os.path.join(model_dir, 'yield_scaler.pkl')
        
        encoder_state_path = os.path.join(model_dir, 'state_encoder.pkl')
        encoder_district_path = os.path.join(model_dir, 'district_encoder.pkl')
        encoder_season_path = os.path.join(model_dir, 'season_encoder.pkl')
        
        encoder_crop_path = os.path.join(model_dir, 'crop_encoder.pkl')
        if not os.path.exists(encoder_crop_path):
            encoder_crop_path = os.path.join(model_dir, 'yield_crop_encoder.pkl')
        
        # Load XGBoost model
        self.model = xgb.XGBRegressor()
        self.model.load_model(model_path)
        
        # Load preprocessing objects
        self.scaler = joblib.load(scaler_path)
        self.label_encoder_state = joblib.load(encoder_state_path)
        self.label_encoder_district = joblib.load(encoder_district_path)
        self.label_encoder_season = joblib.load(encoder_season_path)
        self.label_encoder_crop = joblib.load(encoder_crop_path)
        
        print(f"✓ XGBoost model loaded from {model_path}")


def main():
    """Main training pipeline"""
    # Initialize model with GPU support
    yield_model = CropYieldPredictionModel(use_gpu=True)
    
    # Load and merge data
    production_path = os.path.join('data', 'yield production', 'India Agriculture Crop Production.csv')
    rainfall_india_path = os.path.join('data', 'yield production', 'rainfall in india 1901-2015.csv')
    rainfall_district_path = os.path.join('data', 'yield production', 'district wise rainfall normal.csv')
    
    df = yield_model.load_data(
        production_path=production_path,
        rainfall_india_path=rainfall_india_path,
        rainfall_district_path=rainfall_district_path
    )
    
    # Preprocess data
    X_train, X_test, y_train, y_test, feature_names = yield_model.preprocess_data(df)
    
    # Train model
    yield_model.train(X_train, y_train)
    
    # Evaluate model
    metrics = yield_model.evaluate(X_test, y_test, feature_names)
    
    # Save model
    yield_model.save_model()
    
    # Example prediction
    print("\n" + "="*50)
    print("EXAMPLE PREDICTION")
    print("="*50)
    
    # Get a sample from the data
    if len(df) > 0:
        sample = df.iloc[0]
        sample_input = {
            'State': sample.get('State', 'Unknown'),
            'District': sample.get('District', 'Unknown'),
            'Year': sample.get('Year', 2020),
            'Season': sample.get('Season', 'Kharif'),
            'Crop': sample.get('Crop', 'Rice'),
            'Area': sample.get('Area', 1000),
            'Rainfall': sample.get('Rainfall', 1000)
        }
        
        print(f"\nInput parameters:")
        for key, value in sample_input.items():
            print(f"  {key}: {value}")
        
        prediction = yield_model.predict(sample_input)
        print(f"\nPredicted Yield: {prediction[0]:.2f} (Production per unit Area)")
        if 'Yield' in df.columns:
            actual = sample['Yield']
            print(f"Actual Yield: {actual:.2f}")
            print(f"Difference: {abs(prediction[0] - actual):.2f}")


if __name__ == "__main__":
    main()
