import os

# 1. 🧠 소크라테스 서버 (server.py)
# - 이제 단순 텍스트가 아니라, 5단계로 나뉜 질문 리스트를 줍니다.
server_code = """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 소크라테스식 데이터베이스 (예시: 1000번 A+B 문제)
# 실제 서비스에선 이 내용을 LLM(GPT)이 실시간으로 생성하게 됩니다.
socratic_db = {
    "1000": [
        {
            "step": "1. 문제 재정의",
            "question": "이 문제에서 진짜로 구해야 하는 값은 무엇인가요?\\n입력받은 두 숫자를 그대로 출력하는 게 아니라, 그 사이의 '관계'를 계산해야 하지 않나요?"
        },
        {
            "step": "2. 제약 조건 질문",
            "question": "입력되는 A와 B는 0보다 크고 10보다 작습니다.\\n이 정도 크기라면, 데이터 타입(int, long 등)에 신경 쓸 필요가 있을까요?"
        },
        {
            "step": "3. 반복 구조 유도",
            "question": "이 문제는 반복이 필요한가요, 아니면 단 한 번의 연산으로 끝나는가요?\\n입력을 받고 -> 계산하고 -> 출력하는 흐름을 그려보세요."
        },
        {
            "step": "4. 반례 질문",
            "question": "만약 A가 1이고 B가 2라면 3이 나와야 합니다.\\n그런데 예제 입력과 다른 숫자를 넣어도 항상 정답이 나오나요?"
        },
        {
            "step": "5. 알고리즘 귀결",
            "question": "이 문제는 복잡한 알고리즘이 필요한가요?\\n단순한 '사칙연산 구현' 문제인지 확인해 보세요."
        }
    ],
    "2557": [
        {"step": "1. 문제 재정의", "question": "컴퓨터 화면에 특정 문장을 띄우는 것이 목표입니다. 어떤 함수가 필요할까요?"},
        {"step": "2. 제약 조건", "question": "대소문자가 정확해야 합니다. 'Hello World'와 'Hello world'는 다릅니다."},
        {"step": "5. 결론", "question": "Python의 print 함수 사용법을 정확히 알고 있나요?"}
    ]
}

@app.get("/hint/{problem_id}")
def get_socratic_hint(problem_id: str):
    # 해당 문제의 소크라테스 질문 리스트를 반환
    hints = socratic_db.get(problem_id)

    if not hints:
        return {"found": False, "msg": "🤔 흠, 이 문제는 아직 소크라테스 선생님이 분석하지 못했네요."}

    return {"found": True, "hints": hints}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
"""

# 2. 📺 소크라테스 UI (popup.html)
# - 질문을 하나씩 보여줄 공간과 [다음 질문] 버튼을 만듭니다.
html_code = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <style>
        body { width: 320px; padding: 15px; font-family: 'Malgun Gothic', sans-serif; background-color: #fcfcfc;}
        h3 { margin-top: 0; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }

        .chat-container {
            min-height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .bubble {
            background: #fff;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            font-size: 14px;
            line-height: 1.5;
            color: #444;
        }

        .step-badge {
            display: inline-block;
            background: #000;
            color: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-bottom: 8px;
            font-weight: bold;
        }

        button { 
            width: 100%; 
            padding: 12px; 
            background: #333; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            font-size: 14px;
            transition: 0.2s;
        }
        button:hover { background: #555; }
        button:disabled { background: #ccc; cursor: not-allowed; }

        #hidden-area { display: none; }
    </style>
</head>
<body>
    <h3>🏛️ 소크라테스 힌트</h3>

    <div class="chat-container">
        <div id="output-area">
            <div class="bubble">
                문제를 풀다가 막히셨나요?<br>
                제가 질문을 던져 드릴게요. 스스로 답을 찾아보세요.
            </div>
        </div>

        <button id="actionBtn">힌트 시작하기</button>
    </div>

    <script src="popup.js"></script>
</body>
</html>"""

# 3. 🧠 로직 처리 (popup.js)
# - 버튼을 누를 때마다 배열에 있는 질문을 하나씩 꺼내서 보여줌
js_code = """
let hintsData = [];
let currentStep = 0;

const outputArea = document.getElementById('output-area');
const actionBtn = document.getElementById('actionBtn');

// 화면에 말풍선 추가하는 함수
function addBubble(stepTitle, text) {
    // 기존 내용 지우고 새로 보여주기 (집중을 위해)
    outputArea.innerHTML = `
        <div class="bubble">
            <span class="step-badge">${stepTitle}</span><br>
            ${text}
        </div>
    `;
}

actionBtn.addEventListener('click', () => {
    // 1. 처음 시작할 때 (DB에서 데이터 가져오기)
    if (currentStep === 0 && hintsData.length === 0) {
        actionBtn.innerText = "로딩 중...";
        actionBtn.disabled = true;

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            let currentUrl = tabs[0].url;
            if (currentUrl.includes('acmicpc.net/problem/')) {
                let problemId = currentUrl.split('/').pop();

                fetch(`http://127.0.0.1:8000/hint/${problemId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.found) {
                            hintsData = data.hints;
                            showNextHint(); // 첫 번째 힌트 바로 보여주기
                        } else {
                            outputArea.innerHTML = `<div class="bubble">${data.msg}</div>`;
                            actionBtn.innerText = "다시 시도";
                            actionBtn.disabled = false;
                        }
                    })
                    .catch(err => {
                        outputArea.innerHTML = `<div class="bubble">❌ 서버 연결 실패!<br>server.py를 켜주세요.</div>`;
                        actionBtn.disabled = false;
                        actionBtn.innerText = "힌트 시작하기";
                    });
            } else {
                outputArea.innerHTML = `<div class="bubble">⚠️ 백준 문제 페이지가 아닙니다.</div>`;
                actionBtn.disabled = false;
                actionBtn.innerText = "다시 시도";
            }
        });
    } 
    // 2. 데이터가 이미 있을 때 (다음 힌트 보여주기)
    else {
        showNextHint();
    }
});

function showNextHint() {
    if (currentStep < hintsData.length) {
        let hint = hintsData[currentStep];
        addBubble(hint.step, hint.question);
        currentStep++;

        if (currentStep >= hintsData.length) {
            actionBtn.innerText = "모든 질문이 끝났습니다";
            actionBtn.disabled = true;
        } else {
            actionBtn.innerText = "다음 질문 던져주세요 🤔";
            actionBtn.disabled = false;
        }
    }
}
"""


def create_file(filename, content):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ {filename} 업데이트 완료!")


if __name__ == "__main__":
    create_file("server.py", server_code)
    create_file("popup.html", html_code)
    create_file("popup.js", js_code)

    print("\\n🚀 소크라테스 모드 장착 완료!")
    print("1. 파이참에서 'server'를 재시작하세요. (기존 거 끄고 다시 Run)")
    print("2. 크롬 확장 프로그램 관리자에서 [다시 로드] 버튼을 누르세요.")
    print("3. 백준 1000번 문제(A+B)에서 테스트해보세요!")