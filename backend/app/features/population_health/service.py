import json
import os
from datetime import datetime
from .schemas import PopulationStats

class PopulationHealthService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        # Store records in app/data/records.json
        self.db_path = os.path.abspath(os.path.join(self.base_dir, "../../data/records.json"))
        
        # Ensure the data directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if not os.path.exists(self.db_path):
            with open(self.db_path, 'w') as f:
                json.dump([], f)

    def save_patient_result(self, risk_data: dict):
        """Saves a new screening result to our local JSON store"""
        try:
            with open(self.db_path, 'r') as f:
                records = json.load(f)
            
            # Add metadata
            record = {
                "timestamp": datetime.now().isoformat(),
                "risk_score": risk_data['risk_score'],
                "risk_tier": risk_data['risk_tier'],
                "age": risk_data.get('Age', 0)
            }
            
            records.append(record)
            
            with open(self.db_path, 'w') as f:
                json.dump(records, f)
            return True
        except Exception as e:
            print(f"Failed to save record: {e}")
            return False

    def get_stats(self) -> PopulationStats:
        """Aggregates all saved records for the NGO dashboard"""
        with open(self.db_path, 'r') as f:
            records = json.load(f)

        if not records:
            return PopulationStats(total_screened=0, risk_distribution={}, average_risk_score=0, high_risk_priority_count=0)

        dist = {"Red": 0, "Yellow": 0, "Green": 0}
        total_score = 0
        
        for r in records:
            tier = r['risk_tier']
            dist[tier] = dist.get(tier, 0) + 1
            total_score += r['risk_score']

        return PopulationStats(
            total_screened=len(records),
            risk_distribution=dist,
            average_risk_score=round(total_score / len(records), 2),
            high_risk_priority_count=dist.get("Red", 0)
        )

# Singleton instance
pop_service = PopulationHealthService()