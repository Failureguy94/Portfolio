import { ExtLink } from '../components/ExtLink'
import { RatingChart } from '../components/RatingChart'
import { Reel } from '../components/Reel'
import { Reveal } from '../components/Reveal'
import { SplitText } from '../components/SplitText'
import { RollingNumber } from '../components/RollingNumber'
import cp from '../data/cp.json'
import { copy } from '../data/copy'
import { useCodeChef } from '../hooks/useCodeChef'
import { useCodeforces } from '../hooks/useCodeforces'
import { useLeetCode } from '../hooks/useLeetCode'

const t = copy.numbers

const capitalise = (s) => (s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : null)

export default function BoxOffice() {
  const cf = useCodeforces()
  const cc = useCodeChef()
  const lc = useLeetCode()

  const lcFloor = lc.source !== 'live' && cp.leetcode.solvedIsFloor

  const rows = [
    {
      name: 'Codeforces',
      note: cf.source === 'live' ? capitalise(cf.data.rank) : null,
      rating: cf.data.rating,
      peak: cf.data.maxRating,
      solved: null,
      url: cp.codeforces.profileUrl,
    },
    {
      name: 'CodeChef',
      note: cc.data.stars ? `${cc.data.stars}-star` : null,
      rating: cc.data.rating,
      peak: cc.data.maxRating,
      solved: cc.data.solved,
      url: cp.codechef.profileUrl,
    },
    {
      name: 'LeetCode',
      note: null,
      rating: null,
      peak: null,
      solved: lc.data.solved,
      solvedSuffix: lcFloor ? '+' : '',
      url: cp.leetcode.profileUrl,
    },
  ]

  const big = 'font-title text-[clamp(1.9rem,3.6vw,3rem)] tabular-nums'

  return (
    <Reel id="numbers" tone="ink" label="numbers-title" className="overflow-hidden px-4 py-16 md:px-8 md:py-24">
      {/* colour fields for the glass to catch */}
      <div className="blob left-[-8%] top-[18%] h-[38vw] w-[38vw] bg-bass opacity-[0.28]" aria-hidden="true" />
      <div
        className="blob bottom-[-10%] right-[-6%] h-[34vw] w-[34vw] bg-mustard opacity-[0.22]"
        style={{ animationDelay: '-7s' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px]">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <SplitText id="numbers-title" text={t.heading} className="font-title text-[clamp(3.25rem,8vw,7rem)]" />
          <Reveal as="p" delay={250} className="max-w-[30ch] font-serif text-lg italic text-dim md:pb-2 md:text-xl">
            {t.intro}
          </Reveal>
        </header>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="glass rounded-2xl px-5 py-4 md:px-8 md:py-6 lg:col-span-7">
            {/* Wide screens: a ledger table */}
            <table className="hidden w-full border-collapse md:table">
              <caption className="sr-only">{t.heading}</caption>
              <thead>
                <tr className="border-b border-paper/40 text-left font-sans text-sm font-medium text-dim">
                  {t.columns.map((c, i) => (
                    <th key={c} scope="col" className={`pb-3 font-medium ${i > 0 && i < 4 ? 'text-right' : ''} ${i === 4 ? 'text-right' : ''}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-paper/10 align-middle last:border-b-0">
                    <th scope="row" className="py-5 pr-4 text-left font-normal">
                      <span className="block font-sans text-lg font-semibold">{r.name}</span>
                      {r.note ? <span className="block font-serif text-base italic text-mustard">{r.note}</span> : null}
                    </th>
                    <td className={`py-5 text-right ${big}`}>
                      <RollingNumber value={r.rating} />
                    </td>
                    <td className={`py-5 text-right ${big} text-dim`}>
                      <RollingNumber value={r.peak} />
                    </td>
                    <td className={`py-5 text-right ${big}`}>
                      <RollingNumber value={r.solved} suffix={r.solvedSuffix} />
                    </td>
                    <td className="py-5 pl-4 text-right font-sans text-[0.95rem] font-semibold">
                      <ExtLink href={r.url}>
                        {t.viewProfile}
                        <span className="sr-only"> on {r.name} (opens in a new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </ExtLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phones: one ledger entry per platform */}
            <ul className="md:hidden">
              {rows.map((r) => (
                <li key={r.name} className="border-b border-paper/10 py-5 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-lg font-semibold">
                      {r.name}
                      {r.note ? <span className="ml-2 font-serif text-base font-normal italic text-mustard">{r.note}</span> : null}
                    </span>
                    <ExtLink href={r.url} className="link font-sans text-sm font-semibold">
                      {t.viewProfile}
                      <span className="sr-only"> on {r.name} (opens in a new tab)</span>
                      <span aria-hidden="true"> ↗</span>
                    </ExtLink>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      [t.columns[1], r.rating, ''],
                      [t.columns[2], r.peak, ''],
                      [t.columns[3], r.solved, r.solvedSuffix],
                    ].map(([label, v, sfx]) => (
                      <div key={label}>
                        <dt className="font-sans text-xs text-dim">{label}</dt>
                        <dd className="font-title text-[2rem]">
                          <RollingNumber value={v} suffix={sfx} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className="glass rounded-2xl p-5 md:p-8 lg:col-span-5">
            <RatingChart history={cf.data.history} title={t.chartTitle} />
          </Reveal>
        </div>
      </div>
    </Reel>
  )
}
