from flask import Flask, request, render_template
import numpy as np
import pandas as pd
import pickle
import os

# Load ML models
model = pickle.load(open('model.pkl', 'rb'))
sc = pickle.load(open('standscaler.pkl', 'rb'))
ms = pickle.load(open('minmaxscaler.pkl', 'rb'))

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['DATA_FILE'] = 'Crop_recommendation.csv'

def load_crop_data():
    """Load and prepare the crop recommendation data"""
    try:
        file_path = os.path.join(app.root_path, app.config['DATA_FILE'])
        df = pd.read_csv(file_path)
        
        # Ensure required columns exist
        required_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("CSV file missing required columns")
            
        return df
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return None

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/about')
def about():
    print("Rendering about page")  # Debugging print
    return render_template("about.html")

@app.route('/contact')
def contact():
    print("Rendering contact page")  # Debugging print
    return render_template("contact.html")

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '').strip().lower()
    results = []
    error = None
    
    df = load_crop_data()
    
    if df is None:
        error = "Could not load crop database. Please check if the CSV file exists and has the correct format."
    elif query:
        try:
            # Convert all data to strings and check for query matches
            mask = (
                df.astype(str)
                .apply(lambda col: col.str.contains(query, case=False))
                .any(axis=1)
            )
            results = df[mask].to_dict('records')
        except Exception as e:
            error = f"Search error: {str(e)}"
    
    return render_template('search.html',
                         results=results,
                         query=query,
                         error=error,
                         data_file=app.config['DATA_FILE'])

@app.route("/predict", methods=['POST'])
def predict():
    # Get form data
    N = request.form.get('Nitrogen')
    P = request.form.get('Phosporus')
    K = request.form.get('Potassium')
    temp = request.form.get('Temperature')
    humidity = request.form.get('Humidity')
    ph = request.form.get('Ph')
    rainfall = request.form.get('Rainfall')

    # Validate inputs
    if None in [N, P, K, temp, humidity, ph, rainfall]:
        return render_template('index.html', result="Please fill all the fields")
    
    try:
        feature_list = [float(N), float(P), float(K), float(temp), 
                       float(humidity), float(ph), float(rainfall)]
    except ValueError:
        return render_template('index.html', result="Please enter valid numbers in all fields")

    # Make prediction
    single_pred = np.array(feature_list).reshape(1, -1)
    
    try:
        scaled_features = ms.transform(single_pred)
        final_features = sc.transform(scaled_features)
        prediction = model.predict(final_features)
    except Exception as e:
        return render_template('index.html', result=f"Prediction error: {str(e)}")

    crop_dict = {
        1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 
        6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 
        10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
        14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 
        18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans", 
        21: "Chickpea", 22: "Coffee"
    }

    if prediction[0] in crop_dict:
        crop = crop_dict[prediction[0]]
        result = f"{crop} is the best crop to be cultivated with these conditions"
    else:
        result = "Sorry, we could not determine the best crop for these conditions"
    
    return render_template('index.html', result=result)

if __name__ == "__main__":
    app.run(debug=True)