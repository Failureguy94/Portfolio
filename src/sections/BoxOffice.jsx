import { ExtLink } from '../components/ExtLink'
import { RatingChart } from '../components/RatingChart'
import { Reel } from '../components/Reel'
import { RollingNumber } from '../components/RollingNumber'
import cp from '../data/cp.json'
import { copy } from '../data/copy'
import { useCodeChef } from '../hooks/useCodeChef'
import { useCodeforces } from '../hooks/useCodeforces'
import { useLeetCode } from '../hooks/useLeetCode'

const t = copy.numbers

const capitalise = (s) => (s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : null)

function sourceNote(name, state) {
  if (state.source === 'live') {
    const time = new Date(state.syncedAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${name}: ${t.live}, ${t.checkedAt} ${time}`
  }
  const date = new Date(`${cp.lastUpdated}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${name}: ${t.snapshot} ${t.asOf} ${date}`
}

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

  const big = 'font-title text-[clamp(2rem,4.4vw,3.6rem)] tabular-nums'

  return (
    <Reel id="numbers" tone="ink" label="numbers-title" className="px-4 pb-28 pt-28 md:px-8 md:pb-40 md:pt-36">
      <div className="mx-auto max-w-[1360px]">
        <header className="grid gap-6 md:grid-cols-12">
          <h2 id="numbers-title" className="font-title text-[clamp(4rem,12vw,11rem)] md:col-span-8">
            {t.heading}
          </h2>
          <p className="max-w-[28ch] self-end font-serif text-xl italic text-dim md:col-span-4 md:pb-3">{t.intro}</p>
        </header>

        <div className="mt-16 grid gap-y-20 lg:mt-24 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-7">
            {/* Wide screens: a ledger table */}
            <table className="hidden w-full border-collapse md:table">
              <caption className="sr-only">{t.heading}</caption>
              <thead>
                <tr className="border-b-2 border-paper text-left font-sans text-sm font-medium text-dim">
                  {t.columns.map((c, i) => (
                    <th key={c} scope="col" className={`pb-3 font-medium ${i > 0 && i < 4 ? 'text-right' : ''} ${i === 4 ? 'text-right' : ''}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-ink-2 align-middle">
                    <th scope="row" className="py-6 pr-4 text-left font-normal">
                      <span className="block font-sans text-lg font-semibold">{r.name}</span>
                      {r.note ? <span className="block font-serif text-base italic text-mustard">{r.note}</span> : null}
                    </th>
                    <td className={`py-6 text-right ${big}`}>
                      <RollingNumber value={r.rating} />
                    </td>
                    <td className={`py-6 text-right ${big} text-dim`}>
                      <RollingNumber value={r.peak} />
                    </td>
                    <td className={`py-6 text-right ${big}`}>
                      <RollingNumber value={r.solved} suffix={r.solvedSuffix} />
                    </td>
                    <td className="py-6 pl-4 text-right font-sans text-[0.95rem] font-semibold">
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
            <ul className="border-t-2 border-paper md:hidden">
              {rows.map((r) => (
                <li key={r.name} className="border-b border-ink-2 py-6">
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

            <p className="mt-6 font-sans text-sm leading-relaxed text-dim">
              {[sourceNote('Codeforces', cf), sourceNote('CodeChef', cc), sourceNote('LeetCode', lc)].join(' · ')}
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <RatingChart history={cf.data.history} title={t.chartTitle} />
          </div>
        </div>
      </div>
    </Reel>
  )
}
