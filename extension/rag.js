// Socrates RAG - Algorithm Type Retrieval

class AlgorithmRAG {
    constructor() {
        this.db = window.ALGORITHM_DB;
    }

    /**
     * 문제 설명에서 알고리즘 유형 추론
     * @param {object} problem - 문제 데이터
     * @returns {array} 매칭된 알고리즘 유형들 (점수 높은 순)
     */
    inferAlgorithmTypes(problem) {
        const text = this.buildSearchText(problem).toLowerCase();
        const scores = {};

        for (const [type, data] of Object.entries(this.db)) {
            let score = 0;

            // 키워드 매칭
            for (const keyword of data.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score += 10;
                }
            }

            // 별칭 매칭 (높은 가중치)
            for (const alias of data.aliases) {
                if (text.includes(alias.toLowerCase())) {
                    score += 20;
                }
            }

            // 이름 매칭
            if (text.includes(data.name.toLowerCase())) {
                score += 30;
            }

            if (score > 0) {
                scores[type] = { score, data };
            }
        }

        // 점수 순 정렬
        const sorted = Object.entries(scores)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 3); // 상위 3개

        return sorted.map(([type, { score, data }]) => ({
            type,
            name: data.name,
            score,
            coreIdea: data.coreIdea,
            approach: data.approach,
            patterns: data.commonPatterns
        }));
    }

    /**
     * 검색용 텍스트 구성
     */
    buildSearchText(problem) {
        return [
            problem.title || '',
            problem.description || '',
            problem.input || '',
            problem.output || '',
            problem.limit || '',
            ...(problem.tags || [])
        ].join(' ');
    }

    /**
     * RAG 결과를 프롬프트에 삽입할 형태로 변환
     */
    formatForPrompt(matches) {
        if (!matches || matches.length === 0) {
            return '';
        }

        let result = '\n\n---\n## 참고: 유사한 알고리즘 유형\n\n';

        matches.forEach((match, i) => {
            result += `### ${i + 1}. ${match.name} (신뢰도: ${Math.min(100, match.score)}%)\n`;
            result += `**핵심 아이디어**: ${match.coreIdea}\n\n`;
            result += `**접근 방법**:\n`;
            match.approach.forEach(step => {
                result += `${step}\n`;
            });
            result += `\n**자주 사용하는 패턴**:\n`;
            match.patterns.forEach(pattern => {
                result += `- ${pattern}\n`;
            });
            result += '\n';
        });

        result += '---\n';
        result += '위 정보를 참고하되, 레벨에 맞게 힌트를 제공하세요.\n';

        return result;
    }

    /**
     * 문제에 대한 RAG 검색 수행
     */
    search(problem) {
        const matches = this.inferAlgorithmTypes(problem);
        console.log('[RAG] 알고리즘 유형 추론:', matches.map(m => m.name));
        return {
            matches,
            prompt: this.formatForPrompt(matches)
        };
    }
}

// Export
window.AlgorithmRAG = AlgorithmRAG;
