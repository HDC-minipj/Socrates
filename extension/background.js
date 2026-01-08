// BOJ Algorithm Helper - Background Service Worker

// 설치 시 초기화
chrome.runtime.onInstalled.addListener(() => {
    console.log('BOJ Algorithm Helper installed');
});

// 메시지 핸들러 (필요시 확장)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'ok' });
    }
    return true;
});
