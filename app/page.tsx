'use client';

import { useState } from 'react';
import { computeSaju, ganzhiName, stemName, branchName, STEM_ELEMENT, BRANCH_ELEMENT, type SajuResult } from '@/lib/saju';
import { CITIES } from '@/lib/saju/cities';
import type { Element, TenGod } from '@/lib/saju/constants';
import type { Pillar } from '@/lib/saju';
import ThemeToggle from './ThemeToggle';

// 오방색 — 한지(라이트) 카드용 / 밤하늘(다크) 카드용 두 벌.
const ELEM: Record<Element, { light: string; night: string; bar: string }> = {
  목: { light: 'text-[var(--mok)]', night: 'text-emerald-300', bar: 'bg-[var(--mok)]' },
  화: { light: 'text-[var(--hwa)]', night: 'text-rose-300', bar: 'bg-[var(--hwa)]' },
  토: { light: 'text-[var(--to)]', night: 'text-amber-300', bar: 'bg-[var(--to)]' },
  금: { light: 'text-[var(--geum)]', night: 'text-slate-200', bar: 'bg-[var(--geum)]' },
  수: { light: 'text-[var(--su)]', night: 'text-sky-300', bar: 'bg-[var(--su)]' },
};

function PillarCard({ title, pillar, topGod, botGod, highlight, i }: {
  title: string; pillar: Pillar | null; topGod: TenGod | null; botGod: TenGod | null; highlight?: boolean; i: number;
}) {
  return (
    <div className="rise flex flex-col items-center gap-3" style={{ animationDelay: `${i * 90}ms` }}>
      <div className={`font-serif text-sm tracking-widest ${highlight ? 'text-gold-bright' : 'text-white/50'}`}>{title}</div>
      {!pillar ? (
        <div className="flex h-full min-h-56 w-full items-center justify-center rounded-2xl border border-dashed border-white/15 text-white/25">—</div>
      ) : (
        <div className={`w-full rounded-2xl border ${highlight ? 'border-gold/60 shadow-[0_0_30px_-6px_rgba(201,166,63,0.4)]' : 'border-white/10'} bg-white/[0.03] px-2 py-4 backdrop-blur-sm`}>
          <div className="mb-3 text-center font-serif text-xs text-gold/70">{topGod ?? ' '}</div>
          <div className="flex flex-col items-center">
            <span className={`font-serif text-6xl font-extrabold leading-none sm:text-7xl ${ELEM[STEM_ELEMENT[pillar.stem]].night}`}>{stemName(pillar.stem, true)}</span>
            <span className="mt-1 text-[11px] text-white/45">{stemName(pillar.stem)} · {STEM_ELEMENT[pillar.stem]}</span>
          </div>
          <div className="my-3 flex items-center justify-center gap-2 opacity-40">
            <span className="h-px w-5 bg-gradient-to-r from-transparent to-gold/50" />
            <span className="text-[8px] text-gold">✦</span>
            <span className="h-px w-5 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <div className="flex flex-col items-center">
            <span className={`font-serif text-6xl font-extrabold leading-none sm:text-7xl ${ELEM[BRANCH_ELEMENT[pillar.branch]].night}`}>{branchName(pillar.branch, true)}</span>
            <span className="mt-1 text-[11px] text-white/45">{branchName(pillar.branch)} · {BRANCH_ELEMENT[pillar.branch]}</span>
          </div>
          <div className="mt-3 text-center font-serif text-xs text-gold/70">{botGod ?? ' '}</div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [date, setDate] = useState('1990-01-01');
  const [time, setTime] = useState('12:00');
  const [noTime, setNoTime] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState('서울');
  const [result, setResult] = useState<SajuResult | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [y, mo, d] = date.split('-').map(Number);
    const [h, mi] = noTime ? [12, 0] : time.split(':').map(Number);
    const lon = CITIES.find((c) => c.name === city)?.lon ?? 126.978;
    setResult(computeSaju({ year: y, month: mo, day: d, hour: h, minute: mi, longitude: lon, hasTime: !noTime, gender }));
  }

  const el = result?.elements;
  const maxEl = el ? Math.max(el.목, el.화, el.토, el.금, el.수) : 1;
  const totalEl = el ? el.목 + el.화 + el.토 + el.금 + el.수 : 1;

  return (
    <main className="w-full px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
      <ThemeToggle />
      {/* 헤더 */}
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-2 flex items-center justify-center gap-3 text-gold/40">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-xs tracking-[0.4em]">天地人</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
        </div>
        <h1 className="gold-text font-serif text-5xl font-extrabold tracking-tight sm:text-6xl">四柱八字</h1>
        <p className="mt-3 font-serif text-lg text-ink">사주팔자</p>
        <p className="mt-1 text-sm text-ink-faint">생년월일시로 읽는 나의 운명 · 24절기와 진태양시로 정밀하게</p>
      </header>

      {/* 입력 — PC에서 한 줄로 꽉 차게 */}
      <form onSubmit={onSubmit} className="mx-auto max-w-6xl rounded-3xl border border-line bg-[var(--card)] p-5 shadow-[0_2px_20px_-8px_rgba(28,26,23,0.15)] backdrop-blur-sm sm:p-7">
        <div className="flex flex-wrap items-end gap-4 lg:gap-6">
          <label className="flex min-w-[150px] flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft">생년월일 (양력)</span>
            <input type="date" value={date} min="1900-01-01" max="2100-12-31" onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-line bg-hanji px-3 py-2.5 font-serif text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40" required />
          </label>
          <label className="flex min-w-[120px] flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft">태어난 시각</span>
            <input type="time" value={time} disabled={noTime} onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-line bg-hanji px-3 py-2.5 font-serif text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 disabled:opacity-40" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft">성별</span>
            <div className="flex overflow-hidden rounded-xl border border-line">
              {(['male', 'female'] as const).map((g) => (
                <button type="button" key={g} onClick={() => setGender(g)}
                  className={`px-5 py-2.5 font-serif text-sm transition ${gender === g ? 'bg-ink text-hanji' : 'bg-hanji text-ink-soft hover:bg-hanji-deep'}`}>
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft">출생지</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-line bg-hanji px-3 py-2.5 font-serif text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40">
              {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <button type="submit"
            className="ml-auto rounded-xl bg-gradient-to-br from-gold-bright to-gold px-8 py-3 font-serif text-base font-bold text-white shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-[0.98]">
            사주 보기
          </button>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
          <input type="checkbox" checked={noTime} onChange={(e) => setNoTime(e.target.checked)} className="h-3.5 w-3.5 accent-gold" />
          태어난 시각을 몰라요 (시주 제외)
        </label>
      </form>

      {result && el && (
        <section className="mx-auto mt-10 w-full max-w-[1600px] space-y-6">
          {/* 원국 — 밤하늘 풀폭 카드 */}
          <div className="night rise overflow-hidden rounded-[28px] border border-white/10 p-6 sm:p-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gold-bright sm:text-2xl">사주 원국 <span className="text-sm font-normal text-white/40">四柱原局</span></h2>
              <span className="hidden text-xs text-white/35 sm:block">
                {result.pillars.sajuYear}년생 · 진태양시 {String(result.pillars.trueSolarTime.hour).padStart(2, '0')}:{String(result.pillars.trueSolarTime.minute).padStart(2, '0')}
                {' '}(보정 {result.pillars.correctionMinutes > 0 ? '+' : ''}{result.pillars.correctionMinutes}분)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-6">
              <PillarCard i={0} title="時 시주" pillar={result.pillars.hour} topGod={result.tenGods.hourStem} botGod={result.tenGods.hourBranch} />
              <PillarCard i={1} title="日 일주 · 나" pillar={result.pillars.day} topGod={null} botGod={result.tenGods.dayBranch} highlight />
              <PillarCard i={2} title="月 월주" pillar={result.pillars.month} topGod={result.tenGods.monthStem} botGod={result.tenGods.monthBranch} />
              <PillarCard i={3} title="年 년주" pillar={result.pillars.year} topGod={result.tenGods.yearStem} botGod={result.tenGods.yearBranch} />
            </div>
            <p className="mt-6 text-center font-serif text-sm text-white/55">
              <span className="text-gold-bright">{stemName(result.pillars.day.stem, true)}</span>
              {' '}일간 · {ganzhiName(result.pillars.day.gz, true)}({ganzhiName(result.pillars.day.gz)})일생
            </p>
          </div>

          {/* 오행 + 대운 — PC에서 나란히 꽉 차게 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 오행 */}
            <div className="rise rounded-3xl border border-line bg-[var(--card)] p-6 backdrop-blur-sm sm:p-8">
              <h2 className="mb-5 font-serif text-xl font-bold text-ink">오행 분포 <span className="text-sm font-normal text-ink-faint">五行</span></h2>
              <div className="space-y-3">
                {(['목', '화', '토', '금', '수'] as Element[]).map((e) => (
                  <div key={e} className="flex items-center gap-3">
                    <span className={`w-7 text-center font-serif text-lg font-bold ${ELEM[e].light}`}>{e}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded-full bg-hanji-deep ring-1 ring-line/60">
                      <div className={`h-full rounded-full ${ELEM[e].bar} transition-all duration-700`} style={{ width: `${Math.max((el[e] / maxEl) * 100, 3)}%` }} />
                    </div>
                    <span className="w-20 shrink-0 whitespace-nowrap text-right text-sm text-ink-soft">{el[e]}개 · {Math.round((el[e] / totalEl) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 대운 */}
            {result.luck && (
              <div className="rise rounded-3xl border border-line bg-[var(--card)] p-6 backdrop-blur-sm sm:p-8">
                <div className="mb-5 flex items-baseline justify-between">
                  <h2 className="font-serif text-xl font-bold text-ink">대운 <span className="text-sm font-normal text-ink-faint">大運</span></h2>
                  <span className="text-xs text-ink-faint">{result.luck.forward ? '순행' : '역행'} · {result.luck.startAge}세 시작</span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {result.luck.pillars.map((lp) => {
                    const stem = lp.gz % 10, branch = lp.gz % 12;
                    return (
                      <div key={lp.age} className="flex min-w-[58px] flex-col items-center gap-1.5 rounded-2xl border border-line bg-hanji px-2 py-3">
                        <span className="text-[11px] font-semibold text-ink-faint">{lp.age}세</span>
                        <span className={`font-serif text-2xl font-extrabold leading-none ${ELEM[STEM_ELEMENT[stem]].light}`}>{stemName(stem, true)}</span>
                        <span className={`font-serif text-2xl font-extrabold leading-none ${ELEM[BRANCH_ELEMENT[branch]].light}`}>{branchName(branch, true)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="mx-auto mt-16 max-w-3xl text-center text-xs text-ink-faint/70">
        절기(태양황경)·진태양시·입춘 기준으로 계산합니다 · 재미로 보는 사주
      </footer>
    </main>
  );
}
