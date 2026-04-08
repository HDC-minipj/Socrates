// Socrates Algorithm Database - 알고리즘 유형별 풀이 패턴

const ALGORITHM_DB = {
    dp: {
        name: "다이나믹 프로그래밍",
        aliases: ["DP", "동적계획법", "메모이제이션"],
        keywords: ["최소", "최대", "최솟값", "최댓값", "경우의 수", "가지수", "방법의 수",
            "피보나치", "점화식", "부분문제", "최적", "조합", "타일", "계단"],
        coreIdea: "큰 문제를 작은 부분 문제로 나누고, 부분 문제의 해를 저장하여 재사용합니다.",
        approach: [
            "1. 문제에서 구하려는 값을 정의 (상태 정의)",
            "2. 작은 문제와 큰 문제 사이의 관계식 도출 (점화식)",
            "3. 가장 작은 문제의 답 설정 (초기값)",
            "4. 작은 문제부터 큰 문제 순으로 계산 (Bottom-up) 또는 재귀+메모 (Top-down)"
        ],
        commonPatterns: [
            "dp[i] = dp[i-1] + dp[i-2] (피보나치형)",
            "dp[i] = min(dp[i-1], dp[i-2], ...) + cost (최솟값형)",
            "dp[i][j] = dp[i-1][j] + dp[i][j-1] (2차원형)"
        ]
    },

    bfs: {
        name: "너비 우선 탐색",
        aliases: ["BFS", "Breadth First Search"],
        keywords: ["최단", "거리", "최소 이동", "미로", "레벨", "단계", "칸",
            "상하좌우", "그래프", "탐색", "도달"],
        coreIdea: "시작점에서 가까운 정점부터 차례로 방문하여 최단 거리를 구합니다.",
        approach: [
            "1. 시작점을 큐에 넣고 방문 표시",
            "2. 큐에서 노드를 꺼내 인접 노드 탐색",
            "3. 방문하지 않은 인접 노드를 큐에 추가",
            "4. 큐가 빌 때까지 반복"
        ],
        commonPatterns: [
            "dx, dy 배열로 상하좌우 이동",
            "visited 배열로 방문 체크",
            "distance 배열로 거리 저장"
        ]
    },

    dfs: {
        name: "깊이 우선 탐색",
        aliases: ["DFS", "Depth First Search"],
        keywords: ["경로", "연결", "모든 경우", "백트래킹", "탐색", "순회",
            "사이클", "컴포넌트", "재귀"],
        coreIdea: "한 방향으로 끝까지 탐색한 후 돌아와서 다른 방향을 탐색합니다.",
        approach: [
            "1. 현재 노드 방문 처리",
            "2. 인접 노드 중 방문하지 않은 노드로 재귀 호출",
            "3. 더 이상 갈 곳이 없으면 이전 단계로 복귀",
            "4. 모든 노드를 방문할 때까지 반복"
        ],
        commonPatterns: [
            "재귀 함수로 구현",
            "스택으로 구현 가능",
            "visited 배열 필수"
        ]
    },

    greedy: {
        name: "그리디 알고리즘",
        aliases: ["탐욕법", "Greedy"],
        keywords: ["최대", "최소", "회의", "선택", "정렬", "가장 큰", "가장 작은",
            "우선", "먼저", "욕심"],
        coreIdea: "각 단계에서 가장 좋아 보이는 선택을 하여 전체 최적해를 구합니다.",
        approach: [
            "1. 문제를 작은 선택의 연속으로 분해",
            "2. 각 단계에서의 최적 선택 기준 결정",
            "3. 선택이 전체 최적해로 이어지는지 증명",
            "4. 기준에 따라 정렬 후 순차 선택"
        ],
        commonPatterns: [
            "정렬 후 처리",
            "우선순위 큐 활용",
            "구간 문제는 끝점 기준 정렬"
        ]
    },

    binary_search: {
        name: "이분 탐색",
        aliases: ["이진 탐색", "Binary Search"],
        keywords: ["정렬", "찾기", "탐색", "중간", "반", "logN", "파라메트릭"],
        coreIdea: "정렬된 데이터에서 중간값과 비교하여 탐색 범위를 절반씩 줄입니다.",
        approach: [
            "1. 시작점(left)과 끝점(right) 설정",
            "2. 중간값(mid) 계산",
            "3. 조건에 따라 left 또는 right 이동",
            "4. left > right가 될 때까지 반복"
        ],
        commonPatterns: [
            "while (left <= right)",
            "mid = (left + right) / 2",
            "파라메트릭: 답을 정해놓고 가능한지 판별"
        ]
    },

    sorting: {
        name: "정렬",
        aliases: ["Sort", "Sorting"],
        keywords: ["정렬", "순서", "오름차순", "내림차순", "나열", "줄 세우기"],
        coreIdea: "데이터를 특정 기준에 따라 순서대로 배열합니다.",
        approach: [
            "1. 정렬 기준 결정 (어떤 값 기준?)",
            "2. 오름차순/내림차순 결정",
            "3. 다중 조건시 우선순위 결정",
            "4. 언어 내장 정렬 함수 활용"
        ],
        commonPatterns: [
            "Python: sorted(), .sort()",
            "비교 함수/key 함수 작성",
            "튜플로 다중 조건 정렬"
        ]
    },

    two_pointers: {
        name: "투 포인터",
        aliases: ["Two Pointers", "슬라이딩 윈도우"],
        keywords: ["구간", "부분", "연속", "합", "윈도우", "시작", "끝", "포인터"],
        coreIdea: "두 개의 포인터를 이용하여 구간을 효율적으로 탐색합니다.",
        approach: [
            "1. 시작 포인터와 끝 포인터 설정",
            "2. 조건에 따라 포인터 이동",
            "3. 구간 내 합/개수 등 계산",
            "4. 목표 조건을 만족할 때까지 반복"
        ],
        commonPatterns: [
            "while (start <= end)",
            "조건 만족시 start++, 불만족시 end++",
            "구간 합 문제에 자주 사용"
        ]
    },

    graph: {
        name: "그래프",
        aliases: ["Graph"],
        keywords: ["노드", "간선", "정점", "연결", "인접", "행렬", "리스트"],
        coreIdea: "정점과 간선으로 이루어진 자료구조로 관계를 표현합니다.",
        approach: [
            "1. 입력 형태 파악 (인접 행렬 vs 인접 리스트)",
            "2. 방향 그래프 vs 무방향 그래프 확인",
            "3. 가중치 유무 확인",
            "4. 적절한 탐색 알고리즘 선택 (BFS/DFS)"
        ],
        commonPatterns: [
            "인접 리스트: graph[a].append(b)",
            "무방향: 양방향 추가",
            "방문 배열 필수"
        ]
    },

    shortest_path: {
        name: "최단 경로",
        aliases: ["다익스트라", "Dijkstra", "벨만포드", "플로이드"],
        keywords: ["최단", "경로", "거리", "가중치", "비용", "이동"],
        coreIdea: "그래프에서 한 정점에서 다른 정점까지의 최소 비용 경로를 찾습니다.",
        approach: [
            "1. 시작점에서 각 정점까지 거리를 무한대로 초기화",
            "2. 시작점 거리는 0으로 설정",
            "3. 최소 거리 정점을 선택하여 인접 정점 갱신",
            "4. 모든 정점을 처리할 때까지 반복"
        ],
        commonPatterns: [
            "다익스트라: 양수 가중치, 우선순위 큐",
            "벨만포드: 음수 가중치 가능",
            "플로이드: 모든 쌍 최단 경로"
        ]
    },

    implementation: {
        name: "구현",
        aliases: ["시뮬레이션", "Implementation"],
        keywords: ["구현", "시뮬레이션", "조건", "규칙", "따라서", "수행"],
        coreIdea: "문제에서 설명하는 대로 정확히 코드로 옮깁니다.",
        approach: [
            "1. 문제 조건을 꼼꼼히 파악",
            "2. 예외 케이스 확인",
            "3. 단계별로 구현",
            "4. 예제로 검증"
        ],
        commonPatterns: [
            "조건문으로 분기 처리",
            "반복문으로 시뮬레이션",
            "경계값 주의"
        ]
    },

    string: {
        name: "문자열",
        aliases: ["String"],
        keywords: ["문자열", "문자", "글자", "단어", "알파벳", "부분 문자열"],
        coreIdea: "문자열의 특성을 이용하여 패턴 매칭, 변환 등을 수행합니다.",
        approach: [
            "1. 입력 문자열 파싱",
            "2. 필요한 변환/비교 수행",
            "3. 결과 문자열 구성"
        ],
        commonPatterns: [
            "슬라이싱: s[i:j]",
            "split, join 활용",
            "아스키 코드 활용"
        ]
    },

    math: {
        name: "수학",
        aliases: ["Math", "정수론"],
        keywords: ["약수", "배수", "소수", "GCD", "LCM", "나머지", "모듈러"],
        coreIdea: "수학적 성질과 공식을 이용하여 효율적으로 계산합니다.",
        approach: [
            "1. 관련 수학 공식/정리 파악",
            "2. 큰 수 처리 시 모듈러 연산",
            "3. 소수 판별은 에라토스테네스",
            "4. GCD는 유클리드 알고리즘"
        ],
        commonPatterns: [
            "GCD: gcd(a, b) = gcd(b, a%b)",
            "소수 판정: sqrt(n)까지만 확인",
            "조합: nCr = n! / (r! * (n-r)!)"
        ]
    },

    brute_force: {
        name: "완전 탐색",
        aliases: ["브루트포스", "Brute Force"],
        keywords: ["모든", "전부", "다", "경우", "가능한", "시도"],
        coreIdea: "가능한 모든 경우를 시도하여 답을 찾습니다.",
        approach: [
            "1. 모든 경우의 수 파악",
            "2. 시간 복잡도 계산 (가능한지 확인)",
            "3. 반복문 또는 재귀로 모든 경우 탐색",
            "4. 조건을 만족하는 경우 카운트/저장"
        ],
        commonPatterns: [
            "중첩 for문",
            "재귀로 조합/순열 생성",
            "itertools 모듈 활용"
        ]
    },

    backtracking: {
        name: "백트래킹",
        aliases: ["Backtracking"],
        keywords: ["조합", "순열", "N과 M", "가지치기", "선택", "제외"],
        coreIdea: "가능성이 없는 경로는 더 이상 탐색하지 않고 되돌아갑니다.",
        approach: [
            "1. 선택지를 순서대로 탐색",
            "2. 조건을 만족하지 않으면 이전으로 복귀",
            "3. 가지치기 조건 설계",
            "4. 재귀 함수로 구현"
        ],
        commonPatterns: [
            "visited 배열로 선택 관리",
            "조건 불만족 시 return",
            "깊이 제한으로 종료 조건"
        ]
    },

    prefix_sum: {
        name: "누적 합",
        aliases: ["Prefix Sum", "구간 합"],
        keywords: ["구간", "합", "누적", "부분합", "범위"],
        coreIdea: "미리 누적 합을 계산해두어 구간 합을 O(1)에 구합니다.",
        approach: [
            "1. prefix[i] = prefix[i-1] + arr[i] 계산",
            "2. 구간 [l, r] 합 = prefix[r] - prefix[l-1]",
            "3. 2차원은 포함-배제 원리 적용"
        ],
        commonPatterns: [
            "prefix = [0] + list(accumulate(arr))",
            "prefix[r] - prefix[l-1]",
            "2D: +우하 -우상 -좌하 +좌상"
        ]
    }
};

// Export
window.ALGORITHM_DB = ALGORITHM_DB;
