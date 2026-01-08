
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
