// Options page logic

const apiKeyInput = document.getElementById('api-key');
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-btn');

// Load saved API key
chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
        apiKeyInput.value = result.openaiApiKey;
    }
});

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.textContent = '👁';
    }
});

// Save API key
saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        showStatus('API 키를 입력해주세요.', 'error');
        return;
    }

    if (!apiKey.startsWith('sk-')) {
        showStatus('올바른 API 키 형식이 아닙니다.', 'error');
        return;
    }

    // Validate API key
    saveBtn.textContent = '확인 중...';
    saveBtn.disabled = true;

    try {
        const valid = await validateApiKey(apiKey);
        if (valid) {
            chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
                showStatus('✓ API 키가 저장되었습니다!', 'success');
            });
        } else {
            showStatus('API 키가 유효하지 않습니다.', 'error');
        }
    } catch (error) {
        showStatus('API 키 확인 중 오류가 발생했습니다.', 'error');
    } finally {
        saveBtn.textContent = '저장하기';
        saveBtn.disabled = false;
    }
});

// Validate API key by making a test request
async function validateApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Show status message
function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
}
