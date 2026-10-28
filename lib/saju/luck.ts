// 대운(大運) 계산 — 10년 주기의 운 흐름.
// 방향: 양남음녀=순행, 음남양녀=역행(년간의 음양 + 성별).
// 대운수(시작 나이): 생시에서 순행이면 '다음 절', 역행이면 '이전 절'까지의 일수 ÷ 3.
import { toJD, solveSunLongitude, MONTH_TERM_LONGITUDES } from './astro';
import { STEM_YINYANG } from './constants';
import type { BirthInput, FourPillars } from './pillars';

export type Gender = 'male' | 'female';

export interface LuckPillar { age: number; gz: number; }
export interface LuckResult {
  forward: boolean;   // 순행 여부
  startAge: number;   // 대운 시작 나이(대운수)
  pillars: LuckPillar[];
}

function mod(n: number, m: number) { return ((n % m) + m) % m; }

export function computeLuck(input: BirthInput, fp: FourPillars, gender: Gender): LuckResult {
  const utc = new Date(Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute) - 9 * 3600 * 1000);
  const jd = toJD(utc);
  const monthOrder = Math.floor(mod(fp.solarLongitude + 45, 360) / 30); // 0=인월

  const yangYear = STEM_YINYANG[fp.year.stem] === '양';
  const male = gender === 'male';
  const forward = (yangYear && male) || (!yangYear && !male);

  // 순행=다음 절입, 역행=현재 월의 절입(직전)까지의 거리.
  const termLong = forward
    ? MONTH_TERM_LONGITUDES[(monthOrder + 1) % 12]
    : MONTH_TERM_LONGITUDES[monthOrder];
  const termDate = solveSunLongitude(termLong, jd + (forward ? 15 : -15));
  const diffDays = Math.abs(termDate.getTime() - utc.getTime()) / 86400000;
  const startAge = Math.max(1, Math.round(diffDays / 3)); // 3일 = 1년

  const pillars: LuckPillar[] = [];
  for (let i = 1; i <= 9; i++) {
    const gz = mod(fp.month.gz + (forward ? i : -i), 60);
    pillars.push({ age: startAge + (i - 1) * 10, gz });
  }
  return { forward, startAge, pillars };
}
