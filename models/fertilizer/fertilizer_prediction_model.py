"""
Fertilizer Prediction ML Model
This model predicts the best fertilizer to use based on soil type, crop type, and nutrient levels.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os

class FertilizerPredictionModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder_fertilizer = LabelEncoder()
        self.label_encoder_soil = LabelEncoder()
        self.label_encoder_crop = LabelEncoder()
        self.feature_names = ['Temparature', 'Humidity ', 'Moisture', 
                             'Nitrogen', 'Potassium', 'Phosphorous']
        self.categorical_features = ['Soil Type', 'Crop Type']
        
    def load_data(self, csv_path):
        """Load and prepare the dataset"""
        print(f"Loading data from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Display basic info
        print(f"\nDataset shape: {df.shape}")
        print(f"\nColumn names: {df.columns.tolist()}")
        print(f"\nFertilizer types: {df['Fertilizer Name'].unique()}")
        print(f"\nNumber of fertilizers: {df['Fertilizer Name'].nunique()}")
        print(f"\nSoil types: {df['Soil Type'].unique()}")
        print(f"\nCrop types: {df['Crop Type'].unique()}")
        print(f"\nFertilizer distribution:\n{df['Fertilizer Name'].value_counts()}")
        
        return df
    
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Make a copy
        df_processed = df.copy()
        
        # Encode categorical features
        df_processed['Soil Type Encoded'] = self.label_encoder_soil.fit_transform(df['Soil Type'])
        df_processed['Crop Type Encoded'] = self.label_encoder_crop.fit_transform(df['Crop Type'])
        
        # Encode target variable
        y_encoded = self.label_encoder_fertilizer.fit_transform(df['Fertilizer Name'])
        
        # Select features for model
        feature_cols = self.feature_names + ['Soil Type Encoded', 'Crop Type Encoded']
        X = df_processed[feature_cols]
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\nTraining set size: {X_train_scaled.shape[0]}")
        print(f"Test set size: {X_test_scaled.shape[0]}")
        print(f"Number of features: {X_train_scaled.shape[1]}")
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train(self, X_train, y_train):
        """Train the Random Forest model"""
        print("\nTraining Random Forest Classifier...")
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        print("Training completed!")
        
    def evaluate(self, X_test, y_test):
        """Evaluate the model performance"""
        print("\n" + "="*50)
        print("MODEL EVALUATION")
        print("="*50)
        
        y_pred = self.model.predict(X_test)
        
        # Accuracy
        accuracy = accuracy_score(y_test, y_pred)
        print(f"\nAccuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        
        # Classification report
        print("\nClassification Report:")
        print(classification_report(
            y_test, 
            y_pred, 
            target_names=self.label_encoder_fertilizer.classes_,
            zero_division=0
        ))
        
        # Feature importance
        print("\nFeature Importance:")
        all_features = self.feature_names + ['Soil Type', 'Crop Type']
        feature_importance = pd.DataFrame({
            'Feature': all_features,
            'Importance': self.model.feature_importances_
        }).sort_values('Importance', ascending=False)
        print(feature_importance)
        
        return accuracy
    
    def predict(self, input_data):
        """
        Make predictions for new data
        
        Parameters:
        input_data: dict or DataFrame with keys/columns: 
                   Temparature, Humidity , Moisture, Soil Type, Crop Type,
                   Nitrogen, Potassium, Phosphorous
        
        Returns:
        Predicted fertilizer name(s) and probabilities
        """
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data.copy()
        
        # Encode categorical features
        input_df['Soil Type Encoded'] = self.label_encoder_soil.transform(input_df['Soil Type'])
        input_df['Crop Type Encoded'] = self.label_encoder_crop.transform(input_df['Crop Type'])
        
        # Select features in correct order
        feature_cols = self.feature_names + ['Soil Type Encoded', 'Crop Type Encoded']
        input_features = input_df[feature_cols]
        
        # Scale the input
        input_scaled = self.scaler.transform(input_features)
        
        # Predict
        prediction_encoded = self.model.predict(input_scaled)
        prediction = self.label_encoder_fertilizer.inverse_transform(prediction_encoded)
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(input_scaled)
        
        return prediction, probabilities
    
    def save_model(self, model_dir='models'):
        """Save the trained model and preprocessing objects"""
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
            
        model_path = os.path.join(model_dir, 'fertilizer_prediction_rf.pkl')
        scaler_path = os.path.join(model_dir, 'fertilizer_scaler.pkl')
        encoder_fert_path = os.path.join(model_dir, 'fertilizer_label_encoder.pkl')
        encoder_soil_path = os.path.join(model_dir, 'soil_label_encoder.pkl')
        encoder_crop_path = os.path.join(model_dir, 'crop_label_encoder.pkl')
        
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.label_encoder_fertilizer, encoder_fert_path)
        joblib.dump(self.label_encoder_soil, encoder_soil_path)
        joblib.dump(self.label_encoder_crop, encoder_crop_path)
        
        print(f"\nModel saved to {model_path}")
        print(f"Scaler saved to {scaler_path}")
        print(f"Fertilizer label encoder saved to {encoder_fert_path}")
        print(f"Soil label encoder saved to {encoder_soil_path}")
        print(f"Crop label encoder saved to {encoder_crop_path}")
    
    def load_model(self, model_dir='models'):
        """Load a pre-trained model"""
        # Try new naming convention first, fall back to old naming
        model_path = os.path.join(model_dir, 'model.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(model_dir, 'fertilizer_prediction_rf.pkl')
        
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        if not os.path.exists(scaler_path):
            scaler_path = os.path.join(model_dir, 'fertilizer_scaler.pkl')
        
        encoder_fert_path = os.path.join(model_dir, 'fertilizer_encoder.pkl')
        if not os.path.exists(encoder_fert_path):
            encoder_fert_path = os.path.join(model_dir, 'fertilizer_label_encoder.pkl')
        
        encoder_soil_path = os.path.join(model_dir, 'soil_encoder.pkl')
        if not os.path.exists(encoder_soil_path):
            encoder_soil_path = os.path.join(model_dir, 'soil_label_encoder.pkl')
        
        encoder_crop_path = os.path.join(model_dir, 'crop_encoder.pkl')
        if not os.path.exists(encoder_crop_path):
            encoder_crop_path = os.path.join(model_dir, 'crop_label_encoder.pkl')
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.label_encoder_fertilizer = joblib.load(encoder_fert_path)
        self.label_encoder_soil = joblib.load(encoder_soil_path)
        self.label_encoder_crop = joblib.load(encoder_crop_path)
        
        print(f"Model loaded from {model_path}")
    
    def get_fertilizer_info(self):
        """Get information about available soil types, crop types, and fertilizers"""
        info = {
            'Soil Types': self.label_encoder_soil.classes_.tolist(),
            'Crop Types': self.label_encoder_crop.classes_.tolist(),
            'Fertilizers': self.label_encoder_fertilizer.classes_.tolist()
        }
        return info


def main():
    """Main training pipeline"""
    # Initialize model
    fertilizer_model = FertilizerPredictionModel()
    
    # Load data
    data_path = os.path.join('data', 'Fertilizer Prediction', 'Fertilizer Prediction.csv')
    df = fertilizer_model.load_data(data_path)
    
    # Preprocess data
    X_train, X_test, y_train, y_test = fertilizer_model.preprocess_data(df)
    
    # Train model
    fertilizer_model.train(X_train, y_train)
    
    # Evaluate model
    accuracy = fertilizer_model.evaluate(X_test, y_test)
    
    # Save model
    fertilizer_model.save_model()
    
    # Example prediction
    print("\n" + "="*50)
    print("EXAMPLE PREDICTION")
    print("="*50)
    
    sample_input = {
        'Temparature': 26,
        'Humidity ': 52,
        'Moisture': 38,
        'Soil Type': 'Sandy',
        'Crop Type': 'Maize',
        'Nitrogen': 37,
        'Potassium': 0,
        'Phosphorous': 0
    }
    
    print(f"\nInput parameters:")
    for key, value in sample_input.items():
        print(f"  {key}: {value}")
    
    prediction, probabilities = fertilizer_model.predict(sample_input)
    print(f"\nRecommended fertilizer: {prediction[0]}")
    
    # Show top 3 predictions
    top_3_idx = np.argsort(probabilities[0])[-3:][::-1]
    print("\nTop 3 recommendations:")
    for idx in top_3_idx:
        fertilizer = fertilizer_model.label_encoder_fertilizer.classes_[idx]
        prob = probabilities[0][idx]
        print(f"  {fertilizer}: {prob*100:.2f}%")
    
    # Display available options
    print("\n" + "="*50)
    print("AVAILABLE OPTIONS")
    print("="*50)
    info = fertilizer_model.get_fertilizer_info()
    for key, values in info.items():
        print(f"\n{key}: {', '.join(values)}")


if __name__ == "__main__":
    main()
