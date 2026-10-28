// 사주 기본 상수 — 천간·지지·오행·음양.
// 모든 인덱스는 0부터. 천간 10개, 지지 12개, 60갑자.

export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type Element = '목' | '화' | '토' | '금' | '수';
export const ELEMENTS: Element[] = ['목', '화', '토', '금', '수'];

// 천간 오행: 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수
export const STEM_ELEMENT: Element[] = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
// 지지 오행: 자=수, 축=토, 인=목, 묘=목, 진=토, 사=화, 오=화, 미=토, 신=금, 유=금, 술=토, 해=수
export const BRANCH_ELEMENT: Element[] = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];

// 음양: 천간 짝수 인덱스(갑병무경임)=양(+), 홀수(을정기신계)=음(-). 지지도 동일 규칙(자인진오신술=양).
export const STEM_YINYANG: ('양' | '음')[] = STEMS.map((_, i) => (i % 2 === 0 ? '양' : '음'));
export const BRANCH_YINYANG: ('양' | '음')[] = BRANCHES.map((_, i) => (i % 2 === 0 ? '양' : '음'));

// 지지별 '지장간'(숨은 천간) — 본기(정기) 중심. 십성·오행 세기 보정에 사용(가중치 간이판).
// [여기, 중기, 정기] 천간 인덱스. 없으면 생략. 정기(마지막)가 대표.
export const HIDDEN_STEMS: number[][] = [
  [9],        // 자: 계
  [5, 9, 7],  // 축: 기 계 신
  [0, 2, 4],  // 인: 갑 병 무
  [1],        // 묘: 을
  [4, 1, 9],  // 진: 무 을 계
  [2, 4, 6],  // 사: 병 무 경
  [3, 5],     // 오: 정 기
  [5, 3, 1],  // 미: 기 정 을
  [6, 8, 4],  // 신: 경 임 무
  [7],        // 유: 신
  [4, 7, 3],  // 술: 무 신 정
  [8, 0],     // 해: 임 갑
];

// 십성(十星) — 일간 기준 다른 천간/지지와의 관계. 오행 생극 + 음양 동이로 결정.
export const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'] as const;
export type TenGod = (typeof TEN_GODS)[number];

export function stemName(i: number, hanja = false) {
  return (hanja ? STEMS_HANJA : STEMS)[((i % 10) + 10) % 10];
}
export function branchName(i: number, hanja = false) {
  return (hanja ? BRANCHES_HANJA : BRANCHES)[((i % 12) + 12) % 12];
}
// 60갑자 조합 이름(천간지지). gz = 0..59.
export function ganzhiName(gz: number, hanja = false) {
  const g = ((gz % 60) + 60) % 60;
  return stemName(g % 10, hanja) + branchName(g % 12, hanja);
}
