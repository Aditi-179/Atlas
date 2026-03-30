import joblib
import os
import pandas as pd

class RFPredictor:
    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        PARENT_DIR = os.path.dirname(BASE_DIR)
        self.model_path = os.path.join(PARENT_DIR, "artifacts/rf_model.joblib")
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            print("✅ Random Forest Model Loaded Successfully.")
        else:
            print("⚠️ No trained model found in artifacts.")

    def predict(self, feature_dict: dict) -> tuple:
        if self.model is None:
            return 0.0, "Simulation (No Model Found)"

        # Convert dictionary to DataFrame for sklearn compatibility
        df = pd.DataFrame([feature_dict])
        
        # Get probability of the '1' (High Risk) class
        prob = self.model.predict_proba(df)[0][1]
        
        # Risk Stratification
        tier = "Green"
        if prob >= 0.70: tier = "Red"
        elif prob >= 0.40: tier = "Yellow"

        return float(prob), tier

# Global instance for the backend to use
predictor = RFPredictor()