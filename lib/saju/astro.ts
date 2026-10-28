// 천문 계산 — 태양 겉보기 황경(절기 판정), 절입 시각, 균시차(진태양시 보정).
// 알고리즘: Jean Meeus, "Astronomical Algorithms" 2nd ed. 간이판(분 단위 정확도 충분).
// 모든 시각은 UTC 기준의 Date로 주고받는다.

const RAD = Math.PI / 180;

// 그레고리력 → 율리우스일(JD). date는 UTC 기준.
export function toJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
export function fromJD(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

// 세기수 T (J2000.0 기준).
function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

// 태양 겉보기 황경(deg, 0~360). 장동·광행차 보정 포함.
export function sunApparentLongitude(jd: number): number {
  const T = julianCenturies(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T; // 기하평균황경
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;  // 평균근점이각
  const Mr = M * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr); // 중심차
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD); // 장동+광행차
  return ((apparent % 360) + 360) % 360;
}

// 균시차(Equation of Time, 분). 진태양시 = 평균태양시 + 균시차.
// 양수면 해시계가 시계보다 빠름.
export function equationOfTime(jd: number): number {
  const T = julianCenturies(jd);
  const L0 = ((280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360 + 360) % 360;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T; // 궤도 이심률
  // 황도 경사
  const eps = 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const Mr = M * RAD;
  const L0r = L0 * RAD;
  const Etime =
    y * Math.sin(2 * L0r) -
    2 * e * Math.sin(Mr) +
    4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r) -
    0.5 * y * y * Math.sin(4 * L0r) -
    1.25 * e * e * Math.sin(2 * Mr); // 라디안
  return (Etime / RAD) * 4; // deg→분(1deg=4min)
}

// 목표 황경(targetLong, deg)에 태양이 도달하는 UTC 시각을, guess 근처에서 이분법으로 찾는다.
// 24절기 절입 시각 계산에 사용. targetLong은 0~360.
export function solveSunLongitude(targetLong: number, guessJD: number): Date {
  // 황경 차이를 -180~180으로 정규화한 함수의 근을 찾는다.
  const diff = (jd: number) => {
    let d = sunApparentLongitude(jd) - targetLong;
    d = ((d % 360) + 540) % 360 - 180;
    return d;
  };
  let lo = guessJD - 20;
  let hi = guessJD + 20;
  // lo/hi가 근을 사이에 두도록 보장(태양황경은 ~1deg/day로 단조증가).
  let flo = diff(lo);
  let fhi = diff(hi);
  // 경계에서 부호가 같으면 범위를 넓힌다(최대 ±40일).
  if (flo * fhi > 0) {
    lo = guessJD - 40;
    hi = guessJD + 40;
    flo = diff(lo);
    fhi = diff(hi);
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const fmid = diff(mid);
    if (flo * fmid <= 0) {
      hi = mid;
      fhi = fmid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return fromJD((lo + hi) / 2);
}

// 24절기 중 '절'(節, 월 경계 12개) 황경: 입춘=315 부터 30도 간격.
// 월지 순서: 인 묘 진 사 오 미 신 유 술 해 자 축.
export const MONTH_TERM_LONGITUDES = [
  315, // 입춘 → 인월
  345, // 경칩 → 묘월
  15,  // 청명 → 진월
  45,  // 입하 → 사월
  75,  // 망종 → 오월
  105, // 소서 → 미월
  135, // 입추 → 신월
  165, // 백로 → 유월
  195, // 한로 → 술월
  225, // 입동 → 해월
  255, // 대설 → 자월
  285, // 소한 → 축월
];
