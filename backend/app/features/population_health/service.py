from datetime import datetime
from .schemas import PopulationStats
from app.core.database import db
import asyncio
class PopulationHealthService:
    def save_patient_result(self, risk_data: dict):
        """Saves a new screening result to MongoDB Atlas."""
        if db is None: return False
        
        try:
            record = {
                "timestamp": datetime.now().isoformat(),
                "risk_score": risk_data['risk_score'],
                "risk_tier": risk_data['risk_tier'],
                "age": risk_data.get('Age', 0),
                "model_used": risk_data.get('model_used'),
                "accuracy": risk_data.get('accuracy'),
                "top_contributors": risk_data.get('top_contributors', [])
            }

            # Fire and forget async DB task from synchronous context
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(db["predictions"].insert_one(record))
            except RuntimeError:
                pass # No running loop to schedule it on
            return True
        except Exception as e:
            print(f"Failed to save record: {e}")
            return False

    async def get_stats(self) -> PopulationStats:
        """Aggregates all saved records from MongoDB for the NGO dashboard."""
        if db is None: return PopulationStats(total_screened=0, risk_distribution={}, average_risk_score=0, high_risk_priority_count=0)
        
        cursor = db["predictions"].find(
            {
                "risk_tier": {"$in": ["Red", "Yellow", "Green"]},
                "risk_score": {"$type": "number"}
            },
            {"_id": 0, "risk_tier": 1, "risk_score": 1}
        )
        records = await cursor.to_list(length=5000)

        if not records:
            return PopulationStats(total_screened=0, risk_distribution={}, average_risk_score=0, high_risk_priority_count=0)

        dist = {"Red": 0, "Yellow": 0, "Green": 0}
        total_score = 0
        
        for r in records:
            tier = r.get('risk_tier')
            score = r.get('risk_score')
            if tier not in dist or not isinstance(score, (int, float)):
                continue
            dist[tier] = dist.get(tier, 0) + 1
            total_score += score

        return PopulationStats(
            total_screened=sum(dist.values()),
            risk_distribution=dist,
            average_risk_score=round(total_score / max(1, sum(dist.values())), 2),
            high_risk_priority_count=dist.get("Red", 0)
        )

# Singleton instance
pop_service = PopulationHealthService()