import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from algorithm_data import ALGORITHM_DATA

# 환경 변수 로드
load_dotenv()

class RAGService:
    """RAG 기반 알고리즘 분석 서비스"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = "text-embedding-3-small"
        self.llm_model = "gpt-4o-mini"
        self.dimension = 1536  # text-embedding-3-small 차원
        
        # FAISS 인덱스 및 알고리즘 데이터
        self.index: Optional[faiss.IndexFlatIP] = None
        self.algorithm_docs: List[Dict[str, Any]] = []
        
        # 초기화
        self._build_vector_db()
    
    def _get_embedding(self, text: str) -> np.ndarray:
        """텍스트를 임베딩 벡터로 변환"""
        response = self.client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        embedding = np.array(response.data[0].embedding, dtype=np.float32)
        # 정규화 (코사인 유사도를 위해)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding
    
    def _build_vector_db(self):
        """알고리즘 데이터로 벡터 DB 구축"""
        print("벡터 DB 구축 중...")
        
        self.algorithm_docs = []
        embeddings = []
        
        for algo in ALGORITHM_DATA:
            # 알고리즘 설명 텍스트 조합
            doc_text = f"{algo['name']}\n{algo['description']}"
            
            # 임베딩 생성
            embedding = self._get_embedding(doc_text)
            embeddings.append(embedding)
            
            self.algorithm_docs.append({
                "name": algo["name"],
                "korean_name": algo.get("korean_name", algo["name"]),
                "description": algo["description"],
                "keywords": algo.get("keywords", [])
            })
        
        # FAISS 인덱스 생성 (Inner Product for cosine similarity with normalized vectors)
        embeddings_matrix = np.array(embeddings, dtype=np.float32)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(embeddings_matrix)
        
        print(f"벡터 DB 구축 완료: {len(self.algorithm_docs)}개 알고리즘 로드됨")
    
    def search_algorithms(self, problem_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """문제 설명과 유사한 알고리즘 검색"""
        # 문제 설명 임베딩
        query_embedding = self._get_embedding(problem_text)
        query_embedding = query_embedding.reshape(1, -1)
        
        # FAISS 검색
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.algorithm_docs):
                algo = self.algorithm_docs[idx]
                results.append({
                    "name": algo["name"],
                    "korean_name": algo["korean_name"],
                    "description": algo["description"],
                    "score": float(scores[0][i])
                })
        
        return results
    
    def generate_explanation(self, problem_text: str, algorithms: List[Dict[str, Any]]) -> str:
        """LLM을 사용하여 문제에 대한 알고리즘 설명 생성"""
        
        # 검색된 알고리즘 이름만 추출
        algo_names = [algo['name'] for algo in algorithms]
        
        prompt = f"""당신은 알고리즘 문제 풀이 전문가입니다. 아래 문제를 분석해주세요.

## 문제
{problem_text}

## 관련 알고리즘
{', '.join(algo_names)}

## 출력 형식 (반드시 이 형식을 따라주세요)

### 🎯 추천 알고리즘
[가장 적합한 알고리즘 1개만 선택]

### 💡 선택 이유
[2-3문장으로 간결하게]

### 📝 풀이 접근
1. [첫 번째 단계]
2. [두 번째 단계]
3. [세 번째 단계]

### ⚠️ 주의사항
- [핵심 주의점 1개]

---
규칙:
- 간결하고 명확하게 작성
- 코드는 제공하지 않음
- 각 섹션은 짧게 유지"""

        response = self.client.chat.completions.create(
            model=self.llm_model,
            messages=[
                {"role": "system", "content": "당신은 간결하고 구조적으로 설명하는 알고리즘 튜터입니다. 불필요한 서론 없이 바로 본론으로 들어갑니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    
    def analyze_problem(self, problem_text: str, top_k: int = 3) -> Dict[str, Any]:
        """문제 분석 전체 파이프라인 실행"""
        # 1. 관련 알고리즘 검색
        algorithms = self.search_algorithms(problem_text, top_k)
        
        # 2. LLM 설명 생성
        explanation = self.generate_explanation(problem_text, algorithms)
        
        return {
            "algorithms": [
                {"name": algo["name"], "score": algo["score"]}
                for algo in algorithms
            ],
            "explanation": explanation
        }


# 서비스 인스턴스 (싱글톤 패턴)
_rag_service: Optional[RAGService] = None

def get_rag_service() -> RAGService:
    """RAG 서비스 인스턴스 반환"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
