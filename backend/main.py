from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="BOJ Algorithm Helper API",
    description="RAG 기반 알고리즘 문제 분석 API",
    version="1.0.0"
)

# CORS 설정 - Chrome Extension에서 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경용, 프로덕션에서는 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RAG 서비스 임포트 (지연 로딩)
rag_service = None

def get_service():
    global rag_service
    if rag_service is None:
        from rag_service import get_rag_service
        rag_service = get_rag_service()
    return rag_service


# 요청/응답 모델
class AnalyzeRequest(BaseModel):
    problem_text: str

class AlgorithmMatch(BaseModel):
    name: str
    score: float

class AnalyzeResponse(BaseModel):
    algorithms: List[AlgorithmMatch]
    explanation: str


@app.get("/")
async def root():
    """헬스 체크 엔드포인트"""
    return {
        "status": "ok",
        "message": "BOJ Algorithm Helper API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    api_key_set = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "ok",
        "openai_api_key_configured": api_key_set
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_problem(request: AnalyzeRequest):
    """
    문제 분석 엔드포인트
    
    - 문제 설명 텍스트를 받아 관련 알고리즘을 검색하고
    - LLM을 통해 풀이 접근 방법을 설명합니다.
    """
    if not request.problem_text or len(request.problem_text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="문제 설명이 너무 짧습니다. 최소 10자 이상 입력해주세요."
        )
    
    try:
        service = get_service()
        result = service.analyze_problem(request.problem_text)
        
        return AnalyzeResponse(
            algorithms=[
                AlgorithmMatch(name=algo["name"], score=algo["score"])
                for algo in result["algorithms"]
            ],
            explanation=result["explanation"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"분석 중 오류가 발생했습니다: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
