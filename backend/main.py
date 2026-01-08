# -*- coding: utf-8 -*-
# Socrates FastAPI Backend
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import traceback

from api.routes import router

# Load .env
load_dotenv()

# App
app = FastAPI(
    title="Socrates API",
    description="Baekjoon Socratic AI Tutor Backend",
    version="1.0.0"
)

# CORS - Extension 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Chrome Extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = str(exc)
    print(f"[ERROR] {error_msg}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg}
    )

# Routes
app.include_router(router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "socrates"}


@app.get("/")
async def root():
    return {"message": "Socrates API v1.0.0", "docs": "/docs"}
