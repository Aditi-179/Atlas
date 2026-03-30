from app.models.predict import predictor
from .schemas import SimulationInput, SimulationOutput

class BehavioralSimService:
    def run_simulation(self, data: SimulationInput) -> SimulationOutput:
        # 1. Get Current Risk
        current_data = data.current_state.model_dump()
        current_prob, _ = predictor.predict(current_data)

        # 2. Create Simulated State (Copy current, then override with changes)
        simulated_data = current_data.copy()
        for key, value in data.modified_habits.items():
            if key in simulated_data:
                simulated_data[key] = value
        
        # 3. Get Simulated Risk
        sim_prob, _ = predictor.predict(simulated_data)

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