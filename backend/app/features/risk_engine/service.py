from app.models.predict import predictor
from .schemas import RiskPredictionInput, RiskPredictionOutput

class RiskEngineService:
    def get_prediction(self, data: RiskPredictionInput) -> RiskPredictionOutput:
        # 1. Map incoming API data to the dictionary format expected by the model
        feature_dict = data.model_dump()
        
        # 2. Get prediction from our RF wrapper in the models folder
        prob, tier = predictor.predict(feature_dict)
        
        return RiskPredictionOutput(
            risk_probability=round(prob, 4),
            risk_tier=tier,
            model_used="Random Forest Classifier"
        )

# Singleton for the router
ml_service = RiskEngineService()