from fastapi import APIRouter
from .service import bias_auditor
from .schemas import AuditReport

router = APIRouter()

@router.get("/run-audit", response_model=AuditReport)
async def perform_bias_check():
    """Performs a real-time equity audit on the population dataset."""
    return bias_auditor.run_equity_audit()