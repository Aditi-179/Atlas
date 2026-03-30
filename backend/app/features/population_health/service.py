import asyncio
import csv
import os
from datetime import datetime, timedelta
from typing import Any, AsyncGenerator, Dict, Iterable, List, Optional

from app.core.database import db
from .schemas import InterventionConfig, PopulationSimulationItem, PopulationStats, RiskDistribution


class PopulationHealthService:
    def __init__(self) -> None:
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl_seconds = 120

    def save_patient_result(self, risk_data: dict):
        """Saves screening output to MongoDB using both legacy and nested fields."""
        if db is None:
            return False

        try:
            output_payload = risk_data.get("output") if isinstance(risk_data.get("output"), dict) else {}
            if not output_payload:
                output_payload = {
                    "risk_score": risk_data["risk_score"],
                    "top_contributors": risk_data.get("top_contributors", []),
                }

            input_payload = risk_data.get("input") if isinstance(risk_data.get("input"), dict) else {}
            if not input_payload:
                input_payload = {
                    "Age": risk_data.get("Age", 0),
                    "village": risk_data.get("village") or risk_data.get("Village"),
                    "phc": risk_data.get("phc") or risk_data.get("PHC"),
                    "Smoker": risk_data.get("Smoker", 0),
                }

            record = {
                "timestamp": datetime.now().isoformat(),
                "input": input_payload,
                "output": output_payload,
                "risk_score": output_payload.get("risk_score"),
                "risk_tier": risk_data.get("risk_tier"),
                "age": risk_data.get("Age", 0),
                "model_used": risk_data.get("model_used"),
                "accuracy": risk_data.get("accuracy"),
                "top_contributors": output_payload.get("top_contributors", []),
            }

            try:
                loop = asyncio.get_running_loop()
                loop.create_task(db["predictions"].insert_one(record))
            except RuntimeError:
                pass
            return True
        except Exception as e:
            print(f"Failed to save record: {e}")
            return False

    async def get_stats(self) -> PopulationStats:
        """Backward-compatible dashboard stats endpoint."""
        groups = await self.get_population_data(source="mongo", location_field="phc")
        total = sum(item.population for item in groups)
        distribution = {"Red": 0, "Yellow": 0, "Green": 0}
        weighted_risk_sum = 0.0

        for item in groups:
            distribution["Red"] += item.risk_distribution.red
            distribution["Yellow"] += item.risk_distribution.yellow
            distribution["Green"] += item.risk_distribution.green
            weighted_risk_sum += item.avg_risk_score * item.population

        avg_score = round(weighted_risk_sum / total, 2) if total else 0.0
        return PopulationStats(
            total_screened=total,
            risk_distribution=distribution,
            average_risk_score=avg_score,
            high_risk_priority_count=distribution["Red"],
        )

    async def get_population_data(
        self,
        source: str = "mongo",
        location_field: str = "phc",
        phc: Optional[str] = None,
        csv_path: Optional[str] = None,
        use_cache: bool = True,
    ) -> List[PopulationSimulationItem]:
        cache_key = f"population:{source}:{location_field}:{phc}:{csv_path or ''}"
        if use_cache:
            cached = self._get_cache(cache_key)
            if cached is not None:
                return cached

        if source == "mongo":
            result = await self._aggregate_population_mongo(location_field=location_field, phc=phc)
        else:
            result = self._aggregate_population_csv(location_field=location_field, phc=phc, csv_path=csv_path)

        if use_cache:
            self._set_cache(cache_key, result)
        return result

    def calculate_risk_distribution(self, red: int, yellow: int, green: int) -> RiskDistribution:
        return RiskDistribution(red=red, yellow=yellow, green=green)

    async def simulate_intervention(
        self,
        intervention: InterventionConfig,
        source: str = "mongo",
        location_field: str = "phc",
        phc: Optional[str] = None,
        csv_path: Optional[str] = None,
        forecast_months: int = 6,
    ) -> List[PopulationSimulationItem]:
        grouped: Dict[str, Dict[str, Any]] = {}

        async for rec in self._stream_records(source=source, location_field=location_field, phc=phc, csv_path=csv_path):
            location = rec["location"]
            if location not in grouped:
                grouped[location] = {
                    "population": 0,
                    "score_sum": 0.0,
                    "red": 0,
                    "yellow": 0,
                    "green": 0,
                    "before_hospitalizations": 0.0,
                    "after_hospitalizations": 0.0,
                }

            original_score = rec["risk_score"]
            adjusted_score = self._apply_intervention_to_score(
                score=original_score,
                smoker=rec.get("smoker", False),
                intervention=intervention,
            )

            grouped[location]["population"] += 1
            grouped[location]["score_sum"] += adjusted_score

            new_tier = self._risk_tier(adjusted_score)
            if new_tier == "red":
                grouped[location]["red"] += 1
            elif new_tier == "yellow":
                grouped[location]["yellow"] += 1
            else:
                grouped[location]["green"] += 1

            grouped[location]["before_hospitalizations"] += self._hospitalization_probability(original_score)
            grouped[location]["after_hospitalizations"] += self._hospitalization_probability(adjusted_score)

        result: List[PopulationSimulationItem] = []
        for location, stats in grouped.items():
            if stats["population"] == 0:
                continue

            impact = self.forecast_outcomes(
                before_monthly=stats["before_hospitalizations"],
                after_monthly=stats["after_hospitalizations"],
                months=forecast_months,
            )

            result.append(
                PopulationSimulationItem(
                    phc=location,
                    population=stats["population"],
                    avg_risk_score=round(stats["score_sum"] / stats["population"], 2),
                    risk_distribution=self.calculate_risk_distribution(
                        red=stats["red"],
                        yellow=stats["yellow"],
                        green=stats["green"],
                    ),
                    intervention_impact=impact,
                )
            )

        result.sort(key=lambda x: x.phc)
        return result

    def forecast_outcomes(self, before_monthly: float, after_monthly: float, months: int = 6) -> Dict[str, Any]:
        before = int(round(before_monthly * months))
        after = int(round(after_monthly * months))
        reduction = before - after
        reduction_percent = round((reduction / before) * 100, 2) if before > 0 else 0.0
        return {
            "before_hospitalizations": max(before, 0),
            "after_hospitalizations": max(after, 0),
            "reduction_percent": max(reduction_percent, 0.0),
        }

    async def _aggregate_population_mongo(
        self,
        location_field: str,
        phc: Optional[str] = None,
    ) -> List[PopulationSimulationItem]:
        if db is None:
            return []

        location_expr = {
            "$ifNull": [
                f"$input.{location_field}",
                {"$ifNull": [f"${location_field}", "Unknown"]},
            ]
        }
        risk_expr = {
            "$convert": {
                "input": {"$ifNull": ["$output.risk_score", "$risk_score"]},
                "to": "double",
                "onError": None,
                "onNull": None,
            }
        }

        pipeline: List[Dict[str, Any]] = [
            {
                "$project": {
                    "location": location_expr,
                    "risk_score": risk_expr,
                }
            },
            {"$match": {"risk_score": {"$ne": None}}},
        ]

        if phc:
            pipeline.append({"$match": {"location": phc}})

        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": "$location",
                        "total_population": {"$sum": 1},
                        "avg_risk_score": {"$avg": "$risk_score"},
                        "count_red": {
                            "$sum": {
                                "$cond": [{"$gt": ["$risk_score", 70]}, 1, 0]
                            }
                        },
                        "count_yellow": {
                            "$sum": {
                                "$cond": [
                                    {
                                        "$and": [
                                            {"$gte": ["$risk_score", 40]},
                                            {"$lte": ["$risk_score", 70]},
                                        ]
                                    },
                                    1,
                                    0,
                                ]
                            }
                        },
                        "count_green": {
                            "$sum": {
                                "$cond": [{"$lt": ["$risk_score", 40]}, 1, 0]
                            }
                        },
                    }
                },
                {"$sort": {"_id": 1}},
            ]
        )

        cursor = db["predictions"].aggregate(pipeline, allowDiskUse=True)
        result: List[PopulationSimulationItem] = []
        async for row in cursor:
            result.append(
                PopulationSimulationItem(
                    phc=str(row.get("_id") or "Unknown"),
                    population=int(row.get("total_population", 0)),
                    avg_risk_score=round(float(row.get("avg_risk_score", 0.0)), 2),
                    risk_distribution=self.calculate_risk_distribution(
                        red=int(row.get("count_red", 0)),
                        yellow=int(row.get("count_yellow", 0)),
                        green=int(row.get("count_green", 0)),
                    ),
                    intervention_impact={
                        "before_hospitalizations": 0,
                        "after_hospitalizations": 0,
                        "reduction_percent": 0.0,
                    },
                )
            )
        return result

    def _aggregate_population_csv(
        self,
        location_field: str,
        phc: Optional[str] = None,
        csv_path: Optional[str] = None,
    ) -> List[PopulationSimulationItem]:
        path = csv_path or os.path.join(os.getcwd(), "app", "data", "ui_final_demo_data.csv")
        if not os.path.exists(path):
            return []

        groups: Dict[str, Dict[str, Any]] = {}
        with open(path, "r", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                location = self._pick_location_from_row(row, location_field)
                if phc and location != phc:
                    continue

                risk_score = self._extract_risk_from_row(row)
                if risk_score is None:
                    continue

                if location not in groups:
                    groups[location] = {"population": 0, "score_sum": 0.0, "red": 0, "yellow": 0, "green": 0}

                groups[location]["population"] += 1
                groups[location]["score_sum"] += risk_score

                tier = self._risk_tier(risk_score)
                if tier == "red":
                    groups[location]["red"] += 1
                elif tier == "yellow":
                    groups[location]["yellow"] += 1
                else:
                    groups[location]["green"] += 1

        result: List[PopulationSimulationItem] = []
        for location, stats in groups.items():
            population = stats["population"]
            result.append(
                PopulationSimulationItem(
                    phc=location,
                    population=population,
                    avg_risk_score=round(stats["score_sum"] / population, 2) if population else 0.0,
                    risk_distribution=self.calculate_risk_distribution(
                        red=stats["red"], yellow=stats["yellow"], green=stats["green"]
                    ),
                    intervention_impact={
                        "before_hospitalizations": 0,
                        "after_hospitalizations": 0,
                        "reduction_percent": 0.0,
                    },
                )
            )

        result.sort(key=lambda x: x.phc)
        return result

    async def _stream_records(
        self,
        source: str,
        location_field: str,
        phc: Optional[str],
        csv_path: Optional[str],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if source == "mongo":
            async for item in self._stream_mongo_records(location_field=location_field, phc=phc):
                yield item
            return

        for item in self._stream_csv_records(location_field=location_field, phc=phc, csv_path=csv_path):
            yield item

    async def _stream_mongo_records(
        self,
        location_field: str,
        phc: Optional[str],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if db is None:
            return

        projection = {
            "_id": 0,
            "input": 1,
            "output": 1,
            "risk_score": 1,
            "Smoker": 1,
            "smoker": 1,
            location_field: 1,
        }
        cursor = db["predictions"].find({}, projection=projection, batch_size=1000)

        async for doc in cursor:
            rec = self._normalize_prediction_doc(doc, location_field)
            if rec is None:
                continue
            if phc and rec["location"] != phc:
                continue
            yield rec

    def _stream_csv_records(
        self,
        location_field: str,
        phc: Optional[str],
        csv_path: Optional[str],
    ) -> Iterable[Dict[str, Any]]:
        path = csv_path or os.path.join(os.getcwd(), "app", "data", "ui_final_demo_data.csv")
        if not os.path.exists(path):
            return

        with open(path, "r", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                location = self._pick_location_from_row(row, location_field)
                if phc and location != phc:
                    continue

                risk_score = self._extract_risk_from_row(row)
                if risk_score is None:
                    continue

                smoker = self._to_bool(row.get("Smoker") or row.get("smoker"))
                yield {"location": location, "risk_score": risk_score, "smoker": smoker}

    def _normalize_prediction_doc(self, doc: Dict[str, Any], location_field: str) -> Optional[Dict[str, Any]]:
        input_data = doc.get("input") if isinstance(doc.get("input"), dict) else {}
        output_data = doc.get("output") if isinstance(doc.get("output"), dict) else {}

        location = input_data.get(location_field) or doc.get(location_field) or "Unknown"
        score = self._to_float(output_data.get("risk_score"))
        if score is None:
            score = self._to_float(doc.get("risk_score"))
        if score is None:
            return None

        smoker = self._to_bool(
            input_data.get("Smoker")
            or input_data.get("smoker")
            or doc.get("Smoker")
            or doc.get("smoker")
        )

        return {
            "location": str(location),
            "risk_score": max(0.0, min(100.0, score)),
            "smoker": smoker,
        }

    def _apply_intervention_to_score(self, score: float, smoker: bool, intervention: InterventionConfig) -> float:
        adjusted = score

        if score > 70:
            red_impact = 0.10 * (intervention.home_visit_increase / 100.0)
            adjusted *= (1 - min(red_impact, 0.10))

        if smoker:
            smoker_impact = 0.08 * (intervention.counseling_sessions / 100.0)
            adjusted *= (1 - min(smoker_impact, 0.08))

        screening_impact = 0.05 * (intervention.screening_boost / 100.0)
        adjusted *= (1 - min(screening_impact, 0.05))

        return round(max(0.0, min(100.0, adjusted)), 2)

    def _hospitalization_probability(self, score: float) -> float:
        if score > 70:
            return 0.10
        if score >= 40:
            return 0.04
        return 0.01

    def _risk_tier(self, score: float) -> str:
        if score > 70:
            return "red"
        if score >= 40:
            return "yellow"
        return "green"

    def _extract_risk_from_row(self, row: Dict[str, Any]) -> Optional[float]:
        for key in ("risk_score", "Overall_NCD_Risk", "overall_ncd_risk", "NCD_Risk"):
            value = self._to_float(row.get(key))
            if value is not None:
                return max(0.0, min(100.0, value))
        return None

    def _pick_location_from_row(self, row: Dict[str, Any], location_field: str) -> str:
        for key in (
            location_field,
            location_field.lower(),
            location_field.upper(),
            "PHC",
            "phc",
            "Village",
            "village",
            "City",
            "city",
        ):
            value = row.get(key)
            if value is not None and str(value).strip():
                return str(value).strip()
        return "Unknown"

    def _to_float(self, value: Any) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _to_bool(self, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value > 0
        if value is None:
            return False
        normalized = str(value).strip().lower()
        return normalized in {"1", "true", "yes", "y"}

    def _get_cache(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        if entry["expires_at"] < datetime.utcnow():
            self._cache.pop(key, None)
            return None
        return entry["value"]

    def _set_cache(self, key: str, value: Any) -> None:
        self._cache[key] = {
            "value": value,
            "expires_at": datetime.utcnow() + timedelta(seconds=self._cache_ttl_seconds),
        }


pop_service = PopulationHealthService()