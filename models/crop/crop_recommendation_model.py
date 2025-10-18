"""
Crop Recommendation ML Model
This model predicts the best crop to grow based on soil and environmental parameters.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os

class CropRecommendationModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        
    def load_data(self, csv_path):
        """Load and prepare the dataset"""
        print(f"Loading data from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Display basic info
        print(f"\nDataset shape: {df.shape}")
        print(f"\nColumn names: {df.columns.tolist()}")
        print(f"\nCrop types: {df['label'].unique()}")
        print(f"\nNumber of crops: {df['label'].nunique()}")
        print(f"\nClass distribution:\n{df['label'].value_counts()}")
        
        return df
    
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Separate features and target
        X = df[self.feature_names]
        y = df['label']
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"\nTraining set size: {X_train_scaled.shape[0]}")
        print(f"Test set size: {X_test_scaled.shape[0]}")
        
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
            target_names=self.label_encoder.classes_
        ))
        
        # Feature importance
        print("\nFeature Importance:")
        feature_importance = pd.DataFrame({
            'Feature': self.feature_names,
            'Importance': self.model.feature_importances_
        }).sort_values('Importance', ascending=False)
        print(feature_importance)
        
        return accuracy
    
    def predict(self, input_data):
        """
        Make predictions for new data
        
        Parameters:
        input_data: dict or DataFrame with keys/columns: N, P, K, temperature, humidity, ph, rainfall
        
        Returns:
        Predicted crop name(s)
        """
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data
            
        # Ensure correct column order
        input_df = input_df[self.feature_names]
        
        # Scale the input
        input_scaled = self.scaler.transform(input_df)
        
        # Predict
        prediction_encoded = self.model.predict(input_scaled)
        prediction = self.label_encoder.inverse_transform(prediction_encoded)
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(input_scaled)
        
        return prediction, probabilities
    
    def save_model(self, model_dir='models'):
        """Save the trained model and preprocessing objects"""
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
            
        model_path = os.path.join(model_dir, 'crop_recommendation_rf.pkl')
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
        
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.label_encoder, encoder_path)
        
        print(f"\nModel saved to {model_path}")
        print(f"Scaler saved to {scaler_path}")
        print(f"Label encoder saved to {encoder_path}")
    
    def load_model(self, model_dir='models'):
        """Load a pre-trained model"""
        # Try new naming convention first, fall back to old naming
        model_path = os.path.join(model_dir, 'model.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(model_dir, 'crop_recommendation_rf.pkl')
        
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        
        encoder_path = os.path.join(model_dir, 'encoder.pkl')
        if not os.path.exists(encoder_path):
            encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.label_encoder = joblib.load(encoder_path)
        
        print(f"Model loaded from {model_path}")


def main():
    """Main training pipeline"""
    # Initialize model
    crop_model = CropRecommendationModel()
    
    # Load data
    data_path = os.path.join('data', 'crop-recommendation', 'Crop_recommendation.csv')
    df = crop_model.load_data(data_path)
    
    # Preprocess data
    X_train, X_test, y_train, y_test = crop_model.preprocess_data(df)
    
    # Train model
    crop_model.train(X_train, y_train)
    
    # Evaluate model
    accuracy = crop_model.evaluate(X_test, y_test)
    
    # Save model
    crop_model.save_model()
    
    # Example prediction
    print("\n" + "="*50)
    print("EXAMPLE PREDICTION")
    print("="*50)
    
    sample_input = {
        'N': 90,
        'P': 42,
        'K': 43,
        'temperature': 20.8,
        'humidity': 82.0,
        'ph': 6.5,
        'rainfall': 202.9
    }
    
    print(f"\nInput parameters: {sample_input}")
    prediction, probabilities = crop_model.predict(sample_input)
    print(f"Recommended crop: {prediction[0]}")
    
    # Show top 3 predictions
    top_3_idx = np.argsort(probabilities[0])[-3:][::-1]
    print("\nTop 3 recommendations:")
    for idx in top_3_idx:
        crop = crop_model.label_encoder.classes_[idx]
        prob = probabilities[0][idx]
        print(f"  {crop}: {prob*100:.2f}%")


if __name__ == "__main__":
    main()
