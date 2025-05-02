from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.v1.routers import router
from contextlib import asynccontextmanager
from db.database import Base, engine
from core.config import settings

load_dotenv(".env")

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        yield

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# Configure CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.FRONTEND_URL], 
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
#     allow_headers=["*"],  # Allow all headers
# )

app.mount("/storage", StaticFiles(directory="storage"), name="static")

# Include API routers
app.include_router(router, prefix="/digital-permits/api/v1")

@app.get("/")
async def root():
    return {"detail": "Welcome to the Digital Permit API!"}
