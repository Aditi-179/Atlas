import os
import joblib
import pandas as pd
import shap
import logging
import numpy as np
from app.features.risk_engine.schemas import RiskPredictionInput
from app.models.db_models import create_prediction_doc

# Setup logging to see errors in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UnifiedPredictor:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        artifact_path = os.path.join(self.base_dir, "artifacts")
        
        try:
            # 1. Load Models
            self.rf_model = joblib.load(os.path.join(artifact_path, "rf_model.joblib"))
            self.xgb_model = joblib.load(os.path.join(artifact_path, "xgb_model.pkl"))
            
            # 2. Load expected column order (Crucial for XGBoost)
            # Your sidebar shows 'xgb_columns.pkl' exists
            self.expected_columns = joblib.load(os.path.join(artifact_path, "xgb_columns.pkl"))
            
            # 3. Initialize Explainers (Optional: wrap in try-except if shap fails)
            try:
                self.xgb_explainer = shap.TreeExplainer(self.xgb_model)
            except:
                self.xgb_explainer = None
                logger.warning("SHAP Explainer could not be initialized.")

            self.rf_acc = 0.6378
            self.xgb_acc = 0.8240
            logger.info("✅ Models and Column Metadata loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Initialization Failed: {e}")
            raise e

    def _engineer_features(self, data: dict):
        # Must match your cleaning.py EXACTLY
        data['Metabolic_Risk_Index'] = data['BMI'] * data['Age']
        data['Clinical_Burden'] = data['HighBP'] + data['HighChol']
        data['Healthy_Habits_Score'] = data['PhysActivity'] + data['Veggies']
        data['Unhealthy_Lifestyle_Index'] = data['Smoker'] + data['HvyAlcoholConsump'] + data['HighBP']
        data['Physical_Mobility_Risk'] = data['BMI'] * data['DiffWalk']
        return data

    def predict_dynamic(self, input_data: RiskPredictionInput):
        try:
            # 1. Engineer Features
            raw_dict = input_data.model_dump()
            full_dict = self._engineer_features(raw_dict)
            
            # 2. Create DataFrame and REORDER columns to match training
            df = pd.DataFrame([full_dict])
            
            # Ensure all expected columns exist, fill missing with 0
            for col in self.expected_columns:
                if col not in df.columns:
                    df[col] = 0
            
            # SORT columns to match the model's exact expected order
            df = df[self.expected_columns]

            # 3. Pick Best Model
            model = self.xgb_model if self.xgb_acc > self.rf_acc else self.rf_model
            name = "XGBoost (Optimized)" if self.xgb_acc > self.rf_acc else "Random Forest"
            
            # 4. Inference
            prob = float(model.predict_proba(df)[0][1])

            # 5. SHAP explainability for top predictive drivers
            top_contributors = []
            if self.xgb_explainer is not None and model == self.xgb_model:
                try:
                    shap_values = self.xgb_explainer.shap_values(df)

                    # Handle SHAP outputs across versions/models.
                    # Expected final vector shape: (n_features,)
                    if isinstance(shap_values, list):
                        shap_vector = np.array(shap_values[-1][0])
                    else:
                        arr = np.array(shap_values)
                        if arr.ndim == 3:
                            # Binary class tree models can return [samples, features, classes]
                            shap_vector = arr[0, :, -1]
                        elif arr.ndim == 2:
                            shap_vector = arr[0]
                        else:
                            shap_vector = arr.reshape(-1)

                    contributors = [
                        {
                            "feature": str(col),
                            "impact": float(shap_vector[idx])
                        }
                        for idx, col in enumerate(df.columns)
                    ]

                    contributors.sort(key=lambda item: abs(item["impact"]), reverse=True)
                    top_contributors = contributors[:6]
                except Exception as shap_error:
                    logger.warning(f"SHAP generation failed: {shap_error}")
                    
            
            return {
                "probability": prob,
                "risk_score": round(prob * 100, 2),
                "model_used": name,
                "accuracy": self.xgb_acc if self.xgb_acc > self.rf_acc else self.rf_acc,
                "top_contributors": top_contributors
            }
        except Exception as e:
            logger.error(f"❌ Prediction Error: {e}")
            raise e

predictor = UnifiedPredictor()