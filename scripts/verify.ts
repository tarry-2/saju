// 계산엔진 검증 — 알려진 날짜의 사주를 뽑아 공개 만세력과 대조한다.
import { computeSaju, type BirthInput } from '../lib/saju';

const cases: { label: string; input: BirthInput }[] = [
  { label: '앵커 1984-02-02 12:00 서울 (일주 甲子 기대)', input: { year: 1984, month: 2, day: 2, hour: 12, minute: 0 } },
  { label: '2000-01-01 12:00 서울', input: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 } },
  { label: '2024-01-01 12:00 서울', input: { year: 2024, month: 1, day: 1, hour: 12, minute: 0 } },
  { label: '1990-05-15 09:30 서울', input: { year: 1990, month: 5, day: 15, hour: 9, minute: 30 } },
  { label: '2024-02-04 입춘근처 17:00 서울', input: { year: 2024, month: 2, day: 4, hour: 17, minute: 0 } },
  { label: '1988-09-22 06:00 서울', input: { year: 1988, month: 9, day: 22, hour: 6, minute: 0 } },
];

for (const c of cases) {
  const r = computeSaju(c.input);
  console.log('■', c.label);
  console.log(`   년 ${r.display.year}  월 ${r.display.month}  일 ${r.display.day}  시 ${r.display.hour ?? '(모름)'}`);
  console.log(`   사주년 ${r.pillars.sajuYear} · 황경 ${r.pillars.solarLongitude.toFixed(2)}° · 진태양시 ${String(r.pillars.trueSolarTime.hour).padStart(2,'0')}:${String(r.pillars.trueSolarTime.minute).padStart(2,'0')} (보정 ${r.pillars.correctionMinutes}분)`);
  console.log(`   오행 목${r.elements.목} 화${r.elements.화} 토${r.elements.토} 금${r.elements.금} 수${r.elements.수}`);
  console.log('');
}
