from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

# Import Domain Routers
from app.features.decision_support.router import router as decision_support_router
from app.features.risk_engine.router import router as risk_router
from app.features.population_health.router import router as pop_router
from app.features.RAG.router import router as rag_router
from app.features.auth.router import router as auth_router
from app.features.mobile_api.router import router as mobile_api_router
from app.features.behavioral_sim.router import router as behavioral_sim_router
from app.features.digital_twin.router import router as digital_twin_router
from app.features.health_agent.router import router as health_agent_router
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for CareFlow AI 🛡️"
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Feature Routers
app.include_router(
    decision_support_router, 
    prefix=f"{settings.API_V1_STR}/decision-support", 
    tags=["Decision Support"]
)
app.include_router(
    risk_router, 
    prefix=f"{settings.API_V1_STR}/risk-engine", 
    tags=["Risk Engine"]
)

# Mobile & Auth Routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)
app.include_router(
    mobile_api_router,
    prefix=f"{settings.API_V1_STR}/mobile",
    tags=["Mobile App API"]
)

app.include_router(
    pop_router, 
    prefix=f"{settings.API_V1_STR}/population-health", 
    tags=["Population Health"]
)

app.include_router(
    rag_router,
    prefix=f"{settings.API_V1_STR}/rag",
    tags=["RAG NLP Analysis"]
)

app.include_router(
    behavioral_sim_router,
    prefix=f"{settings.API_V1_STR}/behavioral-sim",
    tags=["Behavioral Simulation"]
)

app.include_router(
    digital_twin_router,
    prefix=f"{settings.API_V1_STR}/digital-twin",
    tags=["Digital Twin"]
)

app.include_router(
    health_agent_router,
    prefix=f"{settings.API_V1_STR}/health-agent",
    tags=["Health Agent Voice Assistant"]
)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "operational", "system": settings.PROJECT_NAME}

@app.get("/", include_in_schema=False)
def serve_frontend():
    return RedirectResponse(url="/static/index.html")