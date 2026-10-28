// 오행 분포 + 십성(十星) 계산.
import {
  STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG, ELEMENTS, HIDDEN_STEMS,
  TEN_GODS, type Element, type TenGod,
} from './constants';
import type { FourPillars } from './pillars';

// 일간(dayStem) 기준, 대상 천간(targetStem)의 십성.
export function tenGodOfStem(dayStem: number, targetStem: number): TenGod {
  const di = ELEMENTS.indexOf(STEM_ELEMENT[dayStem]);
  const ti = ELEMENTS.indexOf(STEM_ELEMENT[targetStem]);
  const rel = (ti - di + 5) % 5; // 0:비겁 1:식상 2:재성 3:관성 4:인성 (오행 상생 순환 기준)
  const same = STEM_YINYANG[dayStem] === STEM_YINYANG[targetStem];
  switch (rel) {
    case 0: return same ? '비견' : '겁재';
    case 1: return same ? '식신' : '상관';
    case 2: return same ? '편재' : '정재';
    case 3: return same ? '편관' : '정관';
    default: return same ? '편인' : '정인';
  }
}

// 지지의 십성 — 지장간 본기(정기, 마지막)로 계산하는 관례.
export function tenGodOfBranch(dayStem: number, branch: number): TenGod {
  const hidden = HIDDEN_STEMS[branch];
  const mainStem = hidden[hidden.length - 1];
  return tenGodOfStem(dayStem, mainStem);
}

export interface ElementCount {
  목: number; 화: number; 토: number; 금: number; 수: number;
}

// 오행 분포 — 8글자(천간4+지지4, 시 없으면 6). 천간은 자신 오행, 지지는 본기 오행으로 1점씩.
export function countElements(fp: FourPillars): ElementCount {
  const c: ElementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const add = (e: Element) => { c[e] += 1; };
  const pillars = [fp.year, fp.month, fp.day, fp.hour].filter(Boolean);
  for (const p of pillars) {
    add(STEM_ELEMENT[p!.stem]);
    add(BRANCH_ELEMENT[p!.branch]);
  }
  return c;
}

// 네 기둥의 십성 라벨(일간 제외 — 일간은 '나' 자신).
export interface TenGodMap {
  yearStem: TenGod; yearBranch: TenGod;
  monthStem: TenGod; monthBranch: TenGod;
  dayBranch: TenGod;
  hourStem: TenGod | null; hourBranch: TenGod | null;
}

export function computeTenGods(fp: FourPillars): TenGodMap {
  const d = fp.day.stem;
  return {
    yearStem: tenGodOfStem(d, fp.year.stem),
    yearBranch: tenGodOfBranch(d, fp.year.branch),
    monthStem: tenGodOfStem(d, fp.month.stem),
    monthBranch: tenGodOfBranch(d, fp.month.branch),
    dayBranch: tenGodOfBranch(d, fp.day.branch),
    hourStem: fp.hour ? tenGodOfStem(d, fp.hour.stem) : null,
    hourBranch: fp.hour ? tenGodOfBranch(d, fp.hour.branch) : null,
  };
}

export { TEN_GODS };
