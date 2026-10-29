import { skillGroups } from '../data/skills'
import { SectionHeader } from '../components/SectionHeader'
import { FadeUp, StaggerContainer, StaggerItem } from '../components/MotionReveal'

export function PitWall() {
  return (
    <section id="pit-wall" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <SectionHeader
            kicker="Sector 3 · Compounds"
            title="Pit Wall"
            subtitle="Hover a chip to see where it actually ran — not a generic laundry list."
          />
        </FadeUp>
        <StaggerContainer className="grid gap-8 md:grid-cols-2" stagger={0.07}>
          {skillGroups.map((group) => (
            <StaggerItem key={group.name} distance={16}>
              <h3 className="mb-3 font-mono text-[11px] tracking-[0.24em] text-racing uppercase">{group.name}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item.name} className="group relative">
                    <button
                      type="button"
                      className="border border-white/15 px-3 py-1.5 font-mono text-xs text-silver hover:border-racing hover:text-white transition-colors"
                    >
                      {item.name}
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-56 border border-white/10 bg-surface p-3 text-xs text-silver group-hover:block group-focus-within:block shadow-lg">
                      <p className="font-mono text-[10px] tracking-widest text-sun uppercase">Used in</p>
                      <ul className="mt-1 list-disc pl-4">
                        {item.usedIn.map((u) => (
                          <li key={u}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
