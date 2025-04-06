# AgroSync 🌾🤖

AgroSync is a modern crop classification and recommendation system designed for farmers and agri-professionals. It leverages machine learning to provide insights for optimal crop planning and resource management. 🚜💡

## Features 🚀

- **Crop Classification:** Use ML models to accurately classify crops.
- **Smart Recommendations:** Receive tailored crop recommendations based on data analysis.
- **User-friendly Web Interface:** Interact through an intuitive UI built with Python & HTML.
- **Data-Driven Insights:** Utilize CSV datasets to drive informed decisions.
- **Cloud-Ready Deployment:** Easily deploy with Heroku using the included `Procfile`.

## Live Demo 🌐

Try AgroSync live here: [https://agrosync.onrender.com](https://agrosync.onrender.com)

## Project Structure 🗂️

- **`app.py`**: Main application file that runs the web server.
- **`templates/`**: Contains HTML templates for the interface.
- **`Crop Classification With Recommendation System.ipynb`**: Jupyter Notebook for data exploration, model training, and evaluation.
- **`Crop_recommendation.csv`**: Dataset used for training and testing the recommendation system.
- **`model.pkl`**: Serialized machine learning model for crop classification.
- **`minmaxscaler.pkl` & `standscaler.pkl`**: Preprocessing scaler objects.
- **`requirements.txt`**: Lists the Python dependencies.
- **`Procfile`**: For deployment on platforms like Heroku.
- **`img.jpg`**: Visual asset used within the project.

## Getting Started 🚀

### Prerequisites 📋

- Python 3.6 or above 🐍
- pip (Python package installer)
- (Optional) Virtual environment tool (e.g., `venv` or `virtualenv`) 🔧

### Installation 💻

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Nitesh-Kumar-Das/agrosync.git
   cd agrosync
   ```

2. **Create and Activate a Virtual Environment (Optional):**

   ```bash
   python -m venv venv
   source venv/bin/activate    # On Windows use: venv\Scripts\activate
   ```

3. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

### Running the Application 🏃‍♂️

Start the web server:

```bash
python app.py
```

Then, open your browser and navigate to [http://localhost:5000](http://localhost:5000) to access AgroSync.

## Deployment 🌐

This project includes a `Procfile` for deployment on Heroku or similar platforms. Make sure to configure your environment variables and settings appropriately before deploying.

## Usage 🎯

- **Crop Classification:** Input parameters through the web interface to classify crops.
- **Smart Recommendations:** Get personalized recommendations based on your data inputs.
- **Learn & Explore:** Dive into the Jupyter Notebook for deeper insights and experimentation.

## Contributing 🤝

We welcome contributions! To contribute:

1. Fork the repository 🍴
2. Create a new branch for your feature or bug fix 🌿
3. Commit your changes with clear messages 💬
4. Open a pull request with a detailed description 📬

## License 📄
Open to everybody
For more details on usage, don't hesitate to get in touch with the repository owner.

## Acknowledgements 🙏

- A big thank you to the open-source community and all contributors making modern agri-tech solutions possible.
- Special shout-out to farmers and agri-enthusiasts driving innovation in agriculture! 🌱🌍
