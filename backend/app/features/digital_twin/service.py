from app.models.unified_predictor import predictor
from app.core.llm_agent import llm
from .schemas import RiskPredictionInput, DigitalTwinResponse, TwinProjection
import copy

class DigitalTwinService:
    def _simulate_trajectory(self, base_data: dict, is_optimized: bool) -> list:
        trajectory = []
        current_data = copy.deepcopy(base_data)
        
        for month in [0, 3, 6, 12]:
            # Run prediction for this month's state
            input_model = RiskPredictionInput(**current_data)
            result = predictor.predict_dynamic(input_model)
            
            trajectory.append(TwinProjection(
                month=month,
                risk_score=result['risk_score'],
                clinical_state={"BMI": current_data['BMI'], "HighBP": current_data['HighBP']}
            ))
            
            # Simulate aging and vital drift over time
            if not is_optimized:
                # Baseline: Things get worse if untreated (Age goes up, BMI creeps up)
                if month == 6: current_data['Age'] = min(13, current_data['Age'] + 1)
                current_data['BMI'] += 0.2
            else:
                # Optimized: Patient adheres to protocol (BP drops, BMI drops, stops smoking)
                current_data['Smoker'] = 0
                current_data['PhysActivity'] = 1
                current_data['Veggies'] = 1
                current_data['Fruits'] = 1
                current_data['BMI'] = max(18.0, current_data['BMI'] - 0.5)
                if month >= 3: current_data['HighBP'] = 0 # Meds kick in
                
        return trajectory

    def generate_twin(self, data: RiskPredictionInput) -> DigitalTwinResponse:
        base_dict = data.model_dump()
        
        # 1. Generate the Math (XGBoost)
        baseline = self._simulate_trajectory(base_dict, is_optimized=False)
        optimized = self._simulate_trajectory(base_dict, is_optimized=True)
        
        # 2. Generate the Story (Groq LLM)
        sys_prompt = """You are an expert NCD epidemiologist analyzing a Digital Twin projection. 
        Output valid JSON: {"clinical_narrative": "A compelling 2-sentence story explaining the trajectory difference."}"""
        
        user_prompt = f"""
        Month 12 Baseline Risk: {baseline[-1].risk_score}%
        Month 12 Optimized Risk: {optimized[-1].risk_score}%
        Patient Profile: BMI {base_dict['BMI']}, Smoker: {base_dict['Smoker']}
        Explain the life-saving impact of the optimized trajectory.
        """
        
        llm_response = llm.generate_json(sys_prompt, user_prompt)
        
        return DigitalTwinResponse(
            baseline_trajectory=baseline,
            optimized_trajectory=optimized,
            clinical_narrative=llm_response.get("clinical_narrative", "Data projected successfully.")
        )

twin_service = DigitalTwinService()