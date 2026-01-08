// Options page logic

const providerSelect = document.getElementById('provider-select');
const openaiConfig = document.getElementById('openai-config');
const localConfig = document.getElementById('local-config');
const apiKeyInput = document.getElementById('api-key');
const localUrlInput = document.getElementById('local-url');
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-btn');

// Load saved settings
chrome.storage.sync.get(['provider', 'openaiApiKey', 'localUrl'], (result) => {
    // Set Provider
    if (result.provider) {
        providerSelect.value = result.provider;
    }

    // Set API Key
    if (result.openaiApiKey) {
        apiKeyInput.value = result.openaiApiKey;
    }

    // Set Local URL
    if (result.localUrl) {
        localUrlInput.value = result.localUrl;
    }

    updateUI();
});

// Helper: Update UI based on provider selection
function updateUI() {
    const provider = providerSelect.value;
    if (provider === 'local') {
        openaiConfig.style.display = 'none';
        localConfig.style.display = 'block';
    } else {
        openaiConfig.style.display = 'block';
        localConfig.style.display = 'none';
    }
}

// Event Listeners
providerSelect.addEventListener('change', updateUI);

toggleBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.textContent = '👁';
    }
});

saveBtn.addEventListener('click', async () => {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const localUrl = localUrlInput.value.trim();

    saveBtn.textContent = '확인 중...';
    saveBtn.disabled = true;

    try {
        let valid = false;

        if (provider === 'openai') {
            if (!apiKey) {
                showStatus('API 키를 입력해주세요.', 'error');
                return;
            }
            if (!apiKey.startsWith('sk-')) {
                showStatus('올바른 API 키 형식이 아닙니다.', 'error');
                return;
            }
            valid = await validateOpenAI(apiKey);
        } else {
            // Local Llama
            if (!localUrl) {
                showStatus('로컬 서버 URL을 입력해주세요.', 'error');
                return;
            }
            valid = await validateLocal(localUrl);
        }

        if (valid) {
            chrome.storage.sync.set({
                provider: provider,
                openaiApiKey: apiKey,
                localUrl: localUrl
            }, () => {
                showStatus('✓ 설정이 저장되었습니다!', 'success');
            });
        } else {
            // Validation failed but allow saving for Local Llama with warning
            if (provider === 'local') {
                const proceed = confirm('로컬 서버 연결을 확인할 수 없습니다. (CORS 문제일 수 있음)\n그래도 이 설정을 저장하시겠습니까?');
                if (proceed) {
                    chrome.storage.sync.set({
                        provider: provider,
                        openaiApiKey: apiKey,
                        localUrl: localUrl
                    }, () => {
                        showStatus('⚠ 경고: 검증 없이 저장되었습니다. 작동하지 않을 수 있습니다.', 'success');
                    });
                } else {
                    showStatus('로컬 서버 연결 실패. 주소를 확인하세요.', 'error');
                }
            } else {
                showStatus('API 키가 유효하지 않습니다.', 'error');
            }
        }
    } catch (error) {
        console.error(error);
        showStatus('설정 확인 중 오류가 발생했습니다.', 'error');
    } finally {
        saveBtn.textContent = '저장하기';
        saveBtn.disabled = false;
    }
});

async function validateOpenAI(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function validateLocal(url) {
    try {
        // Simple health check or models list
        // Note: url is chat completions endpoint, we might need base url for models list
        // But users act typically just verify by pinging
        // Let's try to fetch models list if possible based on convention,
        // OR just try a dummy completion?
        // Let's try a dummy completion to be sure.

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'x', // dummy
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 1
            })
        });

        // Even 400 or 500 means server is reachable
        // If fetch throws, it's unreachable
        return true;
    } catch (error) {
        return false;
    }
}

function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
}
