// BOJ Algorithm Helper - Content Script
// 백준 문제 페이지에서 문제 정보를 추출하는 스크립트

(function() {
  'use strict';

  // 문제 정보 추출 함수
  function extractProblemInfo() {
    const problemInfo = {
      problemId: null,
      title: null,
      description: null,
      input: null,
      output: null,
      fullText: null
    };

    try {
      // 문제 번호 추출 (URL에서)
      const urlMatch = window.location.pathname.match(/\/problem\/(\d+)/);
      if (urlMatch) {
        problemInfo.problemId = urlMatch[1];
      }

      // 문제 제목 추출
      const titleElement = document.getElementById('problem_title');
      if (titleElement) {
        problemInfo.title = titleElement.textContent.trim();
      }

      // 문제 설명 추출
      const descriptionElement = document.getElementById('problem_description');
      if (descriptionElement) {
        problemInfo.description = descriptionElement.textContent.trim();
      }

      // 입력 설명 추출
      const inputElement = document.getElementById('problem_input');
      if (inputElement) {
        problemInfo.input = inputElement.textContent.trim();
      }

      // 출력 설명 추출
      const outputElement = document.getElementById('problem_output');
      if (outputElement) {
        problemInfo.output = outputElement.textContent.trim();
      }

      // 전체 텍스트 조합
      const parts = [];
      if (problemInfo.title) parts.push(`제목: ${problemInfo.title}`);
      if (problemInfo.description) parts.push(`문제 설명:\n${problemInfo.description}`);
      if (problemInfo.input) parts.push(`입력:\n${problemInfo.input}`);
      if (problemInfo.output) parts.push(`출력:\n${problemInfo.output}`);
      
      problemInfo.fullText = parts.join('\n\n');

    } catch (error) {
      console.error('BOJ Helper: 문제 정보 추출 중 오류 발생', error);
    }

    return problemInfo;
  }

  // 중복 실행 방지
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // 메시지 리스너 - popup에서 요청 시 문제 정보 반환
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractProblem') {
      const problemInfo = extractProblemInfo();
      sendResponse(problemInfo);
    }
    return true; // 비동기 응답을 위해 true 반환
  });

  // 페이지 로드 완료 시 준비 상태 알림
  console.log('BOJ Algorithm Helper: Content script loaded for problem page');
})();
