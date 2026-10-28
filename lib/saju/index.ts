// 사주 계산 통합 진입점.
import { computeFourPillars, type BirthInput, type FourPillars, type Pillar } from './pillars';
import { countElements, computeTenGods, type ElementCount, type TenGodMap } from './elements';
import { computeLuck } from './luck';
import type { LuckResult, Gender } from './luck';
import { ganzhiName, stemName, branchName } from './constants';

export interface SajuResult {
  pillars: FourPillars;
  elements: ElementCount;
  tenGods: TenGodMap;
  luck: LuckResult | null;
  display: {
    year: string; month: string; day: string; hour: string | null;
  };
}

export function computeSaju(input: BirthInput): SajuResult {
  const pillars = computeFourPillars(input);
  const label = (p: Pillar | null) =>
    p ? `${ganzhiName(p.gz)}(${ganzhiName(p.gz, true)})` : null;
  return {
    pillars,
    elements: countElements(pillars),
    tenGods: computeTenGods(pillars),
    luck: input.gender ? computeLuck(input, pillars, input.gender) : null,
    display: {
      year: label(pillars.year)!,
      month: label(pillars.month)!,
      day: label(pillars.day)!,
      hour: label(pillars.hour),
    },
  };
}

export { stemName, branchName, ganzhiName };
export { STEMS, BRANCHES, STEM_ELEMENT, BRANCH_ELEMENT, ELEMENTS } from './constants';
export type { BirthInput, FourPillars, Pillar, ElementCount, TenGodMap };
export type { LuckResult, Gender };
