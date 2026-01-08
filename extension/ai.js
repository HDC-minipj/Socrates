// Socrates AI - OpenAI API Direct Client

const SYSTEM_PROMPTS = {
    0: `You are a Socratic algorithm tutor. Help the student find the answer on their own.

Level 0: Problem Summary
- Summarize the problem in one sentence
- Clearly explain input and output
- List key constraints
- DO NOT mention code, algorithms, or approaches
- Respond in Korean`,

    1: `You are a Socratic algorithm tutor. Help the student find the answer on their own.

Level 1: Direction Hint
- Hint at what type of problem this is (don't say directly)
- Use analogies from similar situations
- Hint at the perspective to approach from
- DO NOT mention algorithm names directly
- Respond in Korean`,

    2: `You are a Socratic algorithm tutor. Help the student find the answer on their own.

Level 2: Thinking Questions
- Present 3 questions to help the student think
- Each question should touch the core of problem solving
- DO NOT give answers to the questions
- Respond in Korean`,

    3: `You are a Socratic algorithm tutor. Help the student find the answer on their own.

Level 3: Core Idea
- Reveal one core idea to solve this problem
- Explain why this idea applies
- You may mention algorithm names
- DO NOT explain implementation details
- DO NOT show code
- Respond in Korean`,

    4: `You are a Socratic algorithm tutor. Help the student find the answer on their own.

Level 4: Approach
- Explain step-by-step approach
- You may use pseudocode
- Express formulas mathematically if needed
- NO actual programming language code
- Respond in Korean`,

    5: `You are an algorithm tutor. The student requested the final solution.

Level 5: Solution
- Provide the complete solution code (Python)
- Explain each part briefly
- Analyze time/space complexity
- Respond in Korean`
};

const LEVEL_NAMES = {
    0: '문제 요약',
    1: '방향 힌트',
    2: '사고 유도',
    3: '핵심 아이디어',
    4: '접근법',
    5: '정답 코드'
};

class SocratesAI {
    constructor() {
        this.apiKey = null;
    }

    async loadApiKey() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['openaiApiKey'], (result) => {
                this.apiKey = result.openaiApiKey || null;
                resolve(this.apiKey);
            });
        });
    }

    async generateHint(problem, level) {
        if (!this.apiKey) {
            await this.loadApiKey();
        }

        if (!this.apiKey) {
            throw new Error('API_KEY_NOT_SET');
        }

        const systemPrompt = SYSTEM_PROMPTS[level] || SYSTEM_PROMPTS[0];
        const userPrompt = this.buildUserPrompt(problem, level);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        let hint = data.choices[0].message.content;

        // Filter code blocks for levels < 5
        if (level < 5) {
            hint = this.filterCode(hint);
        }

        return {
            level,
            hint,
            levelName: LEVEL_NAMES[level]
        };
    }

    buildUserPrompt(problem, level) {
        let examples = '';
        if (problem.examples && problem.examples.length > 0) {
            problem.examples.forEach((ex, i) => {
                examples += `\nExample ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}\n`;
            });
        }

        // RAG: 알고리즘 유형 검색
        let ragContext = '';
        if (window.AlgorithmRAG) {
            const rag = new window.AlgorithmRAG();
            const ragResult = rag.search(problem);
            ragContext = ragResult.prompt;
        }

        return `
## Baekjoon Problem #${problem.problemId}

**Title**: ${problem.title}

**Description**:
${problem.description}

**Input**:
${problem.input || 'N/A'}

**Output**:
${problem.output || 'N/A'}

**Constraints**:
${problem.limit || 'N/A'}

${examples}
${ragContext}
---

Current Level: Level ${level}
Please provide Level ${level} assistance for this problem.
`.trim();
    }

    filterCode(text) {
        // Remove code blocks
        return text.replace(/```[\s\S]*?```/g, '[코드는 Level 5에서 공개됩니다]');
    }
}

// Export for use in sidepanel
window.SocratesAI = SocratesAI;
window.LEVEL_NAMES = LEVEL_NAMES;
