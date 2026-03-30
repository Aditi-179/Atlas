from app.models.unified_predictor import predictor
from app.features.population_health.service import pop_service # <--- IMPORT THIS
from .schemas import RiskPredictionInput, RiskPredictionOutput

class RiskEngineService:
    async def get_prediction(self, data: RiskPredictionInput) -> RiskPredictionOutput:
        result = predictor.predict_dynamic(data)
        
        tier = "Green"
        if result['probability'] > 0.7: tier = "Red"
        elif result['probability'] > 0.4: tier = "Yellow"

        # --- NEW: SAVE TO POPULATION DATABASE ---
        save_data = {**result, "Age": data.Age, "risk_tier": tier}
        await pop_service.save_patient_result(save_data)
        
        return RiskPredictionOutput(
            risk_probability=result['probability'],
            risk_score=result['risk_score'],
            risk_tier=tier,
            model_used=result['model_used'],
            accuracy_at_training=result['accuracy'],
            top_contributors=result['top_contributors']
        )

ml_service = RiskEngineService()