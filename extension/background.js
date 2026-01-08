// Socrates Background Service Worker

// Side Panel 열기
chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url && tab.url.includes('acmicpc.net/problem/')) {
        await chrome.sidePanel.open({ tabId: tab.id });
    }
});

// Content Script에서 메시지 받기
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_PANEL') {
        chrome.sidePanel.open({ tabId: sender.tab.id });
    }

    if (message.type === 'GET_PROBLEM_DATA') {
        // 현재 탭에서 문제 데이터 요청
        chrome.tabs.sendMessage(sender.tab.id, { type: 'EXTRACT_PROBLEM' }, (response) => {
            sendResponse(response);
        });
        return true; // async response
    }
});

// 탭 업데이트 시 Side Panel 활성화 상태 관리
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('acmicpc.net/problem/')) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true
        });
    }
});
