from app.models.unified_predictor import predictor
from app.features.risk_engine.schemas import RiskPredictionInput
from .schemas import SimulationInput, SimulationOutput

class BehavioralSimService:
    def run_simulation(self, data: SimulationInput) -> SimulationOutput:
        # 1. Get Current Risk using unified predictor
        current_result = predictor.predict_dynamic(data.current_state)
        current_prob = current_result['probability']

        # 2. Create Simulated State (Copy current, then override with changes)
        simulated_data = data.current_state.model_dump()
        for key, value in data.modified_habits.items():
            if key in simulated_data:
                simulated_data[key] = value
        
        # 3. Get Simulated Risk - create a new RiskPredictionInput from modified data
        simulated_input = RiskPredictionInput(**simulated_data)
        sim_result = predictor.predict_dynamic(simulated_input)
        sim_prob = sim_result['probability']

        # 4. Calculate Difference
        reduction = current_prob - sim_prob
        
        message = "Lifestyle changes could significantly lower your risk."
        if reduction > 0.15:
            message = "Extremely high impact! These changes are critical for your health."
        elif reduction <= 0:
            message = "Maintain your current healthy habits to stay in the green zone."

        return SimulationOutput(
            current_risk=round(current_prob, 4),
            simulated_risk=round(sim_prob, 4),
            risk_reduction=round(reduction, 4),
            impact_message=message
        )

behavioral_sim_service = BehavioralSimService()
