// Socrates Side Panel - Main Logic (Serverless v2)

// State
let state = {
    currentLevel: 0,
    maxLevel: 5,
    problem: null,
    hints: [],
    isLoading: false
};

// AI Client
const ai = new SocratesAI();

// DOM Elements
const elements = {
    problemId: document.getElementById('problem-id'),
    problemTitle: document.getElementById('problem-title'),
    problemDesc: document.getElementById('problem-desc'),
    levelText: document.getElementById('level-text'),
    levelProgress: document.getElementById('level-progress'),
    hintsContainer: document.getElementById('hints-container'),
    nextHintBtn: document.getElementById('next-hint-btn'),
    actionHint: document.getElementById('action-hint'),
    resetBtn: document.getElementById('reset-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    setupBtn: document.getElementById('setup-btn'),
    apiWarning: document.getElementById('api-warning')
};

// Initialize
async function init() {
    console.log('[Socrates] Side Panel 초기화 (Serverless v2)');

    // Check API key/provider
    await ai.loadSettings();

    // Only require API key if provider is OpenAI
    const isConfigured = ai.provider === 'local' || (ai.provider === 'openai' && ai.apiKey);

    if (!isConfigured) {
        showApiWarning(true);
    } else {
        showApiWarning(false);
    }

    // Load problem from storage
    await loadProblem();

    // Setup event listeners
    setupEventListeners();

    // Listen for problem changes (when user navigates to different problem)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.currentProblem) {
            const newProblem = changes.currentProblem.newValue;
            if (newProblem && newProblem.problemId !== state.problem?.problemId) {
                console.log('[Socrates] 새 문제 감지:', newProblem.problemId);
                resetForNewProblem(newProblem);
            }
        }
    });

    // Listen for settings changes (API key, Provider)
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
        if (areaName === 'sync') {
            await ai.loadSettings();
            const isConfigured = ai.provider === 'local' || (ai.provider === 'openai' && ai.apiKey);
            showApiWarning(!isConfigured);
        }
    });

    // Auto-generate Level 0 summary if configured
    if (state.problem && state.hints.length === 0 && isConfigured) {
        await requestHint(0);
    }
}

// Reset state for new problem
function resetForNewProblem(newProblem) {
    state.problem = newProblem;
    state.currentLevel = 0;
    state.hints = [];

    renderProblem();
    elements.hintsContainer.innerHTML = '';
    elements.levelProgress.style.width = '0%';
    elements.levelText.textContent = 'Level 0';
    elements.nextHintBtn.style.background = '';
    elements.nextHintBtn.querySelector('.btn-text').textContent = '다음 힌트 받기';
    elements.nextHintBtn.disabled = false;
    elements.actionHint.textContent = 'Level 1로 진행합니다';

    document.querySelectorAll('.level-dot').forEach(dot => {
        dot.classList.remove('active', 'completed');
        if (dot.dataset.level === '0') dot.classList.add('active');
    });

    // Auto-generate Level 0 for new problem
    requestHint(0);
}

// Show/hide API warning
function showApiWarning(show) {
    elements.apiWarning.style.display = show ? 'block' : 'none';
}

// Load problem data from storage
async function loadProblem() {
    try {
        const data = await chrome.storage.local.get('currentProblem');
        if (data.currentProblem) {
            state.problem = data.currentProblem;
            renderProblem();
        }
    } catch (error) {
        console.error('[Socrates] 문제 로드 실패:', error);
    }
}

// Render problem info
function renderProblem() {
    if (!state.problem) return;

    elements.problemId.textContent = `#${state.problem.problemId}`;
    elements.problemTitle.textContent = state.problem.title;
    elements.problemDesc.textContent = state.problem.description?.substring(0, 100) + '...';
}

// Setup event listeners
function setupEventListeners() {
    elements.nextHintBtn.addEventListener('click', () => {
        if (state.currentLevel < state.maxLevel) {
            requestHint(state.currentLevel + 1);
        }
    });

    elements.resetBtn.addEventListener('click', resetSession);

    elements.settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    if (elements.setupBtn) {
        elements.setupBtn.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }
}

// Request hint from OpenAI directly
async function requestHint(level) {
    if (state.isLoading || !state.problem) return;

    // Check settings
    await ai.loadSettings();

    const isConfigured = ai.provider === 'local' || (ai.provider === 'openai' && ai.apiKey);

    if (!isConfigured) {
        showApiWarning(true);
        showError('API 키를 먼저 설정해주세요.');
        return;
    }

    // Level 5 confirmation
    if (level === 5) {
        const confirmed = confirm('⚠️ 정답 코드를 보시겠습니까?\n\n이 단계는 학습에 도움이 되지 않을 수 있습니다.\n정말 포기하고 정답을 보시겠습니까?');
        if (!confirmed) return;
    }

    state.isLoading = true;
    setLoading(true);

    try {
        const result = await ai.generateHint(state.problem, level);

        // Update state
        state.currentLevel = level;
        state.hints.push({
            level: level,
            content: result.hint
        });

        // Success - hide warning
        showApiWarning(false);

        // Render
        updateLevelProgress();
        addHintCard(level, result.hint);
        updateActionButton();

    } catch (error) {
        console.error('[Socrates] 힌트 요청 실패:', error);

        if (error.message === 'API_KEY_NOT_SET') {
            showApiWarning(true);
            showError('API 키를 설정해주세요.');
        } else {
            showError(`오류: ${error.message}`);
        }
    } finally {
        state.isLoading = false;
        setLoading(false);
    }
}

// Update level progress bar and dots
function updateLevelProgress() {
    const progress = (state.currentLevel / state.maxLevel) * 100;
    elements.levelProgress.style.width = `${progress}%`;
    elements.levelText.textContent = `Level ${state.currentLevel}`;

    // Update dots
    document.querySelectorAll('.level-dot').forEach(dot => {
        const dotLevel = parseInt(dot.dataset.level);
        dot.classList.remove('active', 'completed');

        if (dotLevel < state.currentLevel) {
            dot.classList.add('completed');
        } else if (dotLevel === state.currentLevel) {
            dot.classList.add('active');
        }
    });
}

// Add hint card with typing effect
function addHintCard(level, content) {
    const card = document.createElement('div');
    card.className = 'hint-card';
    card.innerHTML = `
    <div class="hint-card-header">
      <span class="hint-level-badge level-${level}">Level ${level}</span>
      <span class="hint-title">${LEVEL_NAMES[level]}</span>
    </div>
    <div class="hint-content" id="hint-${level}"></div>
  `;

    elements.hintsContainer.appendChild(card);

    // Scroll to new card
    card.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Typing effect
    typeText(document.getElementById(`hint-${level}`), content);
}

// Typing animation
function typeText(element, text, speed = 15) {
    let i = 0;
    element.innerHTML = '<span class="typing-cursor"></span>';

    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor"></span>';
            i++;
            setTimeout(type, speed);
        } else {
            element.innerHTML = text;
        }
    }

    type();
}

// Update action button
function updateActionButton() {
    if (state.currentLevel >= state.maxLevel) {
        elements.nextHintBtn.disabled = true;
        elements.nextHintBtn.querySelector('.btn-text').textContent = '완료';
        elements.actionHint.textContent = '모든 단계를 완료했습니다';
        return;
    }

    const nextLevel = state.currentLevel + 1;
    elements.nextHintBtn.querySelector('.btn-text').textContent =
        nextLevel === 5 ? '⚠️ 정답 보기' : '다음 힌트 받기';
    elements.actionHint.textContent =
        `Level ${nextLevel}: ${LEVEL_NAMES[nextLevel]}`;

    // Level 5 warning
    if (nextLevel === 5) {
        elements.nextHintBtn.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
    }
}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        elements.nextHintBtn.classList.add('loading');
        elements.nextHintBtn.disabled = true;
    } else {
        elements.nextHintBtn.classList.remove('loading');
        elements.nextHintBtn.disabled = false;
    }
}

// Reset session
function resetSession() {
    state.currentLevel = 0;
    state.hints = [];

    elements.hintsContainer.innerHTML = '';
    elements.levelProgress.style.width = '0%';
    elements.levelText.textContent = 'Level 0';
    elements.nextHintBtn.style.background = '';
    elements.nextHintBtn.querySelector('.btn-text').textContent = '다음 힌트 받기';
    elements.actionHint.textContent = 'Level 1로 진행합니다';

    // Update dots
    document.querySelectorAll('.level-dot').forEach(dot => {
        dot.classList.remove('active', 'completed');
        if (dot.dataset.level === '0') dot.classList.add('active');
    });

    // Re-request Level 0
    if (state.problem) {
        requestHint(0);
    }
}

// Show error message
function showError(message) {
    const card = document.createElement('div');
    card.className = 'hint-card';
    card.style.borderColor = '#ef4444';
    card.innerHTML = `
    <div class="hint-content" style="color: #ef4444;">
      ⚠️ ${message}
    </div>
  `;
    elements.hintsContainer.appendChild(card);
}

// Start
document.addEventListener('DOMContentLoaded', init);
