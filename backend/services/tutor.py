# -*- coding: utf-8 -*-
# Socrates Tutor Service
import os
import re
from dotenv import load_dotenv
from openai import AsyncOpenAI

# .env 먼저 로드
load_dotenv()

from services.prompts import get_system_prompt, get_level_name

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class SocratesTutor:
    """소크라테스식 AI 튜터 - 레벨별 힌트 생성"""
    
    def __init__(self):
        self.model = "gpt-4o-mini"
    
    async def generate_hint(self, problem: dict, level: int) -> dict:
        """레벨에 맞는 힌트 생성"""
        
        system_prompt = get_system_prompt(level)
        user_prompt = self._build_user_prompt(problem, level)
        
        response = await client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        hint_text = response.choices[0].message.content
        
        # Level 0-4: 코드 블록 강제 제거
        if level < 5:
            hint_text = self._filter_code(hint_text)
        
        return {
            "level": level,
            "hint": hint_text,
            "levelName": get_level_name(level)
        }
    
    def _build_user_prompt(self, problem: dict, level: int) -> str:
        """문제 정보로 프롬프트 구성"""
        
        examples_text = ""
        for i, ex in enumerate(problem.get("examples", []), 1):
            examples_text += f"\n예제 {i}:\n입력: {ex.get('input', '')}\n출력: {ex.get('output', '')}\n"
        
        prompt = f"""
## 백준 문제 #{problem.get('problemId', '')}

**제목**: {problem.get('title', '')}

**문제 설명**:
{problem.get('description', '')}

**입력 설명**:
{problem.get('input', '')}

**출력 설명**:
{problem.get('output', '')}

**제한 조건**:
{problem.get('limit', '')}

{examples_text}

---

현재 레벨: Level {level}
위 문제에 대해 Level {level}에 맞는 도움을 제공해주세요.
"""
        return prompt.strip()
    
    def _filter_code(self, text: str) -> str:
        """
        코드 블록 강제 제거 (Level 0-4)
        - 백틱 코드 블록 제거
        - 의사코드 허용 (Level 4)
        """
        # 백틱 3개 코드 블록 제거
        text = re.sub(r'```[\s\S]*?```', '[코드는 Level 5에서 공개됩니다]', text)
        
        # 인라인 코드 중 실제 코드 느낌나는 것 제거
        # (변수명, 함수 호출 등은 허용)
        
        return text
