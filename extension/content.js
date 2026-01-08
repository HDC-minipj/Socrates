// Socrates Content Script - 백준 문제 페이지 DOM 추출

(function () {
    'use strict';

    // 문제 데이터 추출
    function extractProblemData() {
        const problemId = window.location.pathname.split('/').pop();

        // 문제 제목
        const titleEl = document.querySelector('#problem_title');
        const title = titleEl ? titleEl.textContent.trim() : '';

        // 문제 설명
        const descEl = document.querySelector('#problem_description');
        const description = descEl ? descEl.textContent.trim() : '';

        // 입력 설명
        const inputEl = document.querySelector('#problem_input');
        const input = inputEl ? inputEl.textContent.trim() : '';

        // 출력 설명
        const outputEl = document.querySelector('#problem_output');
        const output = outputEl ? outputEl.textContent.trim() : '';

        // 제한 조건
        const limitEl = document.querySelector('#problem_limit');
        const limit = limitEl ? limitEl.textContent.trim() : '';

        // 예제 입력/출력
        const examples = [];
        const sampleInputs = document.querySelectorAll('[id^="sample-input-"]');
        const sampleOutputs = document.querySelectorAll('[id^="sample-output-"]');

        sampleInputs.forEach((inputEl, i) => {
            const outputEl = sampleOutputs[i];
            examples.push({
                input: inputEl ? inputEl.textContent.trim() : '',
                output: outputEl ? outputEl.textContent.trim() : ''
            });
        });

        // 알고리즘 분류 (힌트에 있을 수 있음)
        const tagEls = document.querySelectorAll('.spoiler-link');
        const tags = Array.from(tagEls).map(el => el.textContent.trim());

        return {
            problemId,
            title,
            description,
            input,
            output,
            limit,
            examples,
            tags,
            url: window.location.href
        };
    }

    // 플로팅 버튼 생성
    function createFloatingButton() {
        const btn = document.createElement('button');
        btn.id = 'socrates-fab';
        btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
      <span>힌트</span>
    `;
        btn.setAttribute('title', 'Socrates 열기');

        btn.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: 'OPEN_PANEL' });
        });

        document.body.appendChild(btn);
    }

    // 메시지 리스너 (Side Panel에서 문제 데이터 요청)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'EXTRACT_PROBLEM') {
            const data = extractProblemData();
            sendResponse(data);
        }
        return true;
    });

    // 문제 데이터를 storage에 저장 (Side Panel에서 접근용)
    function saveProblemToStorage() {
        const data = extractProblemData();
        chrome.storage.local.set({ currentProblem: data });
    }

    // 초기화
    function init() {
        // 플로팅 버튼 생성
        createFloatingButton();

        // 문제 데이터 저장
        saveProblemToStorage();

        console.log('[Socrates] 초기화 완료');
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
