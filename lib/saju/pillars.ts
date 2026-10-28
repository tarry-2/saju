// 사주 4기둥(년·월·일·시) 계산. 입력은 '한국 표준시(KST=UTC+9) 벽시계' 기준.
// 정확도 핵심 3가지: ①진태양시 보정(경도+균시차) ②입춘 기준 년주 ③24절기 기준 월주.

import { toJD, sunApparentLongitude, equationOfTime, solveSunLongitude } from './astro';

export interface BirthInput {
  year: number;   // 양력 연
  month: number;  // 1~12
  day: number;    // 1~31
  hour: number;   // 0~23 (벽시계)
  minute: number; // 0~59
  longitude?: number; // 출생지 경도(동경 +). 기본 서울 126.978
  hasTime?: boolean;  // 태어난 시각을 아는가(모르면 시주 생략)
  gender?: 'male' | 'female'; // 대운 방향 계산용
}

export interface Pillar {
  stem: number;   // 천간 0~9
  branch: number; // 지지 0~11
  gz: number;     // 60갑자 0~59
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  // 디버그/표시용 부가정보
  sajuYear: number;        // 입춘 기준 사주 연도
  solarLongitude: number;  // 생시의 태양 황경(deg)
  trueSolarTime: { hour: number; minute: number }; // 진태양시 벽시계
  correctionMinutes: number; // 적용된 총 보정(분)
}

// 1984-01-31 = 甲子일(gz 0). 이 날의 JDN을 앵커로 일주를 센다.
// ★주의: 흔히 '1984-02-02(음력 설날)이 갑자일'로 오해되나, 그날은 丙寅일이다. 실제 갑자일은 01-31.
//   교차검증: 이 앵커로 2000-01-01 = 戊午(무오), +10일 = 01-11 = 戊辰(무진) → 공개 만세력과 일치.
const ANCHOR_JDN = 2445731;

// 그레고리력 civil date → 정오 기준 JDN(정수).
function civilToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
function pillar(stem: number, branch: number): Pillar {
  // 60갑자 = 천간·지지가 맞물리는 조합. gz는 stem,branch로 유일 결정.
  let gz = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === mod(stem, 10) && i % 12 === mod(branch, 12)) { gz = i; break; }
  }
  return { stem: mod(stem, 10), branch: mod(branch, 12), gz };
}

export function computeFourPillars(input: BirthInput): FourPillars {
  const { year, month, day, hour, minute } = input;
  const longitude = input.longitude ?? 126.978; // 서울
  const hasTime = input.hasTime ?? true;

  // 1) 생시의 UTC 순간 → 태양 황경(천문적 실제값, 장소 무관).
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - 9 * 3600 * 1000;
  const utc = new Date(utcMs);
  const jd = toJD(utc);
  const lambda = sunApparentLongitude(jd);

  // 2) 진태양시 보정 = 경도차(동경135 기준) + 균시차.
  const lonCorrMin = (longitude - 135) * 4; // 1도 = 4분
  const eotMin = equationOfTime(jd);
  const corrMin = lonCorrMin + eotMin;
  // 진태양시 '벽시계'를 가상 Date의 UTC 필드에 담아 getUTC*로 읽는다.
  const trueSolar = new Date(Date.UTC(year, month - 1, day, hour, minute) + Math.round(corrMin) * 60000);
  const tsH = trueSolar.getUTCHours();
  const tsM = trueSolar.getUTCMinutes();

  // 3) 년주 — 입춘(황경 315°) 기준. 생시가 그 해 입춘 전이면 전년.
  const ipchunGuess = toJD(new Date(Date.UTC(year, 1, 4))); // 2월 4일경
  const ipchun = solveSunLongitude(315, ipchunGuess);
  const sajuYear = utc.getTime() < ipchun.getTime() ? year - 1 : year;
  const yearStem = mod(sajuYear - 4, 10);
  const yearBranch = mod(sajuYear - 4, 12);

  // 4) 월주 — 태양 황경으로 월지 결정(절입 시각 비교와 동치). 월간은 오호둔(년간→인월 천간).
  const monthOrder = Math.floor(mod(lambda + 45, 360) / 30); // 0=인월 … 11=축월
  const monthBranch = mod(monthOrder + 2, 12); // 인=2
  const yinStem = mod(2 + (yearStem % 5) * 2, 10); // 인월 천간
  const monthStem = mod(yinStem + monthOrder, 10);

  // 5) 일주 — 진태양시 날짜(야자시: 23시 넘으면 다음날) 기준 JDN.
  const dayRoll = tsH >= 23 ? 1 : 0;
  const civil = new Date(trueSolar.getTime() + dayRoll * 86400000);
  const jdn = civilToJDN(civil.getUTCFullYear(), civil.getUTCMonth() + 1, civil.getUTCDate());
  const dayGz = mod(jdn - ANCHOR_JDN, 60);
  const dayStem = dayGz % 10;
  const dayBranch = dayGz % 12;

  // 6) 시주 — 진태양시 시각으로 시지(자시 23:00 시작), 시간은 오자둔(일간→자시 천간).
  let hourPillar: Pillar | null = null;
  if (hasTime) {
    const hourBranch = mod(Math.floor((tsH * 60 + tsM + 60) / 120), 12); // 23:00~01:00=자
    const ziStem = mod((dayStem % 5) * 2, 10); // 자시 천간
    const hourStem = mod(ziStem + hourBranch, 10);
    hourPillar = pillar(hourStem, hourBranch);
  }

  return {
    year: pillar(yearStem, yearBranch),
    month: pillar(monthStem, monthBranch),
    day: pillar(dayStem, dayBranch),
    hour: hourPillar,
    sajuYear,
    solarLongitude: lambda,
    trueSolarTime: { hour: tsH, minute: tsM },
    correctionMinutes: Math.round(corrMin),
  };
}
