import json, os
from datetime import date
from .schemas import AdherenceLog, AdherenceSummary

class AdherenceService:
    def __init__(self):
        self.db_path = "app/data/adherence_logs.json"
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if not os.path.exists(self.db_path):
            with open(self.db_path, 'w') as f: json.dump({}, f)

    def log_daily_activity(self, log: AdherenceLog):
        with open(self.db_path, 'r') as f:
            data = json.load(f)
        
        pid = log.patient_id
        if pid not in data: 
            data[pid] = []
        
        # Save as dict for JSON serialization
        data[pid].append(log.model_dump(mode='json'))
        
        with open(self.db_path, 'w') as f:
            json.dump(data, f, indent=4)
            
        return {"status": "Logged successfully"}

    def get_patient_summary(self, patient_id: str) -> AdherenceSummary:
        if not os.path.exists(self.db_path):
             return AdherenceSummary(adherence_index=0, current_status="No Data", trend="Flat")
             
        with open(self.db_path, 'r') as f:
            data = json.load(f).get(patient_id, [])
        
        if not data:
            return AdherenceSummary(adherence_index=0, current_status="No Data", trend="Flat")

        # Calculate average adherence over last 7 entries
        recent = data[-7:]
        total_points = len(recent) * 3
        points_earned = sum([1 for r in recent if r['took_meds']]) + \
                        sum([1 for r in recent if r['healthy_diet']]) + \
                        sum([1 for r in recent if r['exercised']])
        
        index = (points_earned / total_points) * 100
        
        status = "Critical" if index < 50 else ("At Risk" if index < 80 else "Stable")
        
        # Simple trend detection
        trend = "Improving" if len(data) > 1 and index >= 50 else "Declining"
        
        # Factor in detailed history
        recent_history = [
            {"date": str(r.get('log_date')), "meds": r.get('meds_detail'), "exercise": r.get('exercise_detail')} 
            for r in data[-10:] if r.get('meds_detail') or r.get('exercise_detail')
        ]
        
        return AdherenceSummary(
            adherence_index=round(index, 2), 
            current_status=status, 
            trend=trend,
            recent_logs=recent_history
        )

adherence_service = AdherenceService()