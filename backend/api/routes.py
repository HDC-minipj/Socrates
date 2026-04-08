# -*- coding: utf-8 -*-
# API Routes
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.tutor import SocratesTutor

router = APIRouter()
tutor = SocratesTutor()


class Example(BaseModel):
    input: str
    output: str


class Problem(BaseModel):
    problemId: str
    title: str
    description: str
    input: Optional[str] = ""
    output: Optional[str] = ""
    limit: Optional[str] = ""
    examples: List[Example] = []
    tags: List[str] = []
    url: str


class HintRequest(BaseModel):
    problem: Problem
    level: int


class HintResponse(BaseModel):
    level: int
    hint: str
    levelName: str


@router.post("/hint", response_model=HintResponse)
async def get_hint(request: HintRequest):
    """
    레벨별 힌트 요청
    
    - Level 0: 문제 요약
    - Level 1: 방향 힌트
    - Level 2: 사고 유도 질문
    - Level 3: 핵심 아이디어
    - Level 4: 접근법/의사코드
    - Level 5: 정답 코드
    """
    if request.level < 0 or request.level > 5:
        raise HTTPException(status_code=400, detail="Level must be 0-5")
    
    try:
        result = await tutor.generate_hint(
            problem=request.problem.model_dump(),
            level=request.level
        )
        return result
    except Exception as e:
        error_msg = str(e).encode('utf-8', errors='replace').decode('utf-8')
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/parse")
async def parse_problem(problem: Problem):
    """문제 파싱 확인 (디버그용)"""
    return {
        "parsed": True,
        "problemId": problem.problemId,
        "title": problem.title
    }
