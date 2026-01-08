// BOJ Algorithm Helper - Popup Script

const API_BASE_URL = 'http://localhost:8000';

// DOM 요소들
const problemInfo = document.getElementById('problem-info');
const problemId = document.getElementById('problem-id');
const problemTitle = document.getElementById('problem-title');
const statusMessage = document.getElementById('status-message');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const algorithms = document.getElementById('algorithms');
const explanation = document.getElementById('explanation');
const error = document.getElementById('error');
const errorMessage = document.getElementById('error-message');

let currentProblemData = null;

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    await checkCurrentPage();
});

// 현재 페이지 확인
// 현재 페이지 확인
async function checkCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url || !tab.url.includes('acmicpc.net/problem/')) {
            showStatus('백준 문제 페이지에서 사용해주세요');
            return;
        }

        try {
            await sendMessageToContentScript(tab.id);
        } catch (err) {
            console.log('Content script not ready, attempting injection...', err);

            // 연결 실패 시 스크립트 주입 시도
            if (err.message.includes('Could not establish connection') || err.message.includes('Receiving end does not exist')) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });

                    // 주입 후 잠시 대기 (스크립트 로드 시간 확보)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // 재시도
                    await sendMessageToContentScript(tab.id);
                } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                    showStatus('페이지를 새로고침(F5) 해주세요.');
                }
            } else {
                throw err;
            }
        }
    } catch (err) {
        console.error('Error checking page:', err);
        showStatus('오류가 발생했습니다: ' + err.message);
    }
}

// Content Script에 메시지 보내기 Helper
async function sendMessageToContentScript(tabId) {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractProblem' });

    if (response && response.fullText) {
        currentProblemData = response;
        showProblemInfo(response);
        enableAnalyzeButton();
    } else {
        throw new Error('Invalid response');
    }
}

// 문제 정보 표시
function showProblemInfo(data) {
    problemId.textContent = `#${data.problemId}`;
    problemTitle.textContent = data.title || '제목 없음';
    problemInfo.classList.remove('hidden');
    statusMessage.classList.add('hidden');
}

// 상태 메시지 표시
function showStatus(message) {
    statusMessage.querySelector('p').textContent = message;
    statusMessage.classList.remove('hidden');
    problemInfo.classList.add('hidden');
}

// 분석 버튼 활성화
function enableAnalyzeButton() {
    analyzeBtn.disabled = false;
}

// 분석 버튼 클릭 핸들러
analyzeBtn.addEventListener('click', async () => {
    if (!currentProblemData) return;

    await analyzeProblem(currentProblemData.fullText);
});

// 문제 분석 API 호출
async function analyzeProblem(problemText) {
    showLoading();
    hideError();
    hideResult();

    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                problem_text: problemText
            })
        });

        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        showResult(data);
    } catch (err) {
        console.error('Analysis error:', err);
        showError(err.message || '분석 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
        hideLoading();
    }
}

// 로딩 표시
function showLoading() {
    loading.classList.remove('hidden');
    analyzeBtn.disabled = true;
}

function hideLoading() {
    loading.classList.add('hidden');
    analyzeBtn.disabled = false;
}

// 결과 표시
function showResult(data) {
    // 알고리즘 태그 표시
    algorithms.innerHTML = '';
    if (data.algorithms && data.algorithms.length > 0) {
        data.algorithms.forEach(algo => {
            const tag = document.createElement('div');
            tag.className = 'algorithm-tag';
            tag.innerHTML = `
        <span>${algo.name}</span>
        <span class="score">${Math.round(algo.score * 100)}%</span>
      `;
            algorithms.appendChild(tag);
        });
    }

    // 설명 표시
    explanation.textContent = data.explanation || '설명을 생성할 수 없습니다.';

    result.classList.remove('hidden');
}

function hideResult() {
    result.classList.add('hidden');
}

// 오류 표시
function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}
