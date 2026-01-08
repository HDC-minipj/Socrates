# 🦉 Socrates - 백준 소크라테스 AI 튜터

> 백준 문제를 **대신 풀어주지 않는** AI 튜터

정답을 바로 알려주는 대신, **단계별로 사고를 유도**하여 스스로 문제를 해결하도록 도와주는 크롬 익스텐션입니다.

---

## ✨ 특징

- 🎯 **소크라테스 방식**: 정답 대신 질문으로 사고 유도
- 🔒 **레벨 제한**: Level 5 전까지 코드 노출 없음
- 🎨 **세련된 UI**: 글래스모피즘 다크 테마
- ☁️ **서버리스**: 백엔드 없이 직접 OpenAI API 호출

---

## 🚀 설치 방법

### 1. Chrome Extension 설치

1. [Releases](https://github.com/your-repo/releases)에서 최신 버전 다운로드
2. 압축 해제
3. Chrome `chrome://extensions` 접속
4. 우측 상단 **개발자 모드** 활성화
5. **압축해제된 확장 프로그램을 로드합니다** 클릭
6. `extension` 폴더 선택

### 2. API 키 설정

1. Extension 아이콘 우클릭 → **옵션**
2. [OpenAI](https://platform.openai.com/api-keys)에서 API 키 발급
3. API 키 입력 → 저장

### 3. 사용하기

1. [백준](https://www.acmicpc.net) 문제 페이지 접속
2. 우측 하단 **힌트** 버튼 클릭
3. 사이드 패널에서 단계별 힌트 받기

---

## 📊 레벨 구조

| Level | 제공 내용 |
|-------|----------|
| 0 | 문제 요약 / 제약 정리 |
| 1 | 방향 힌트 |
| 2 | 사고 유도 질문 |
| 3 | 핵심 아이디어 |
| 4 | 접근법 / 의사코드 |
| 5 | 정답 코드 (경고 후 제공) |

---

## 🛠 기술 스택

- **Extension**: Chrome Manifest V3, Vanilla JS
- **AI**: OpenAI API (gpt-4o-mini), 직접 호출
- **UI**: CSS Glassmorphism, Dark Theme

---

## 📁 프로젝트 구조

```
Socrates/
├── extension/
│   ├── manifest.json
│   ├── ai.js          # OpenAI 직접 호출
│   ├── sidepanel.html/js
│   ├── options.html/js  # API 키 설정
│   └── styles.css
└── README.md
```

---

## 💰 비용

- OpenAI API 사용료는 **사용자 본인 부담**
- gpt-4o-mini 기준 문제당 약 $0.001~0.005

---

## ⚖️ 라이선스

MIT License
