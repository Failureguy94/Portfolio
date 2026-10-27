import { shortcuts } from '../data/profile'

export function ShortcutHelp({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end bg-black/40 p-4 md:items-start md:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="shortcut-title"
        className="w-full max-w-sm rounded-sm border border-white/10 bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="shortcut-title" className="font-display italic text-white">
            Steering
          </h2>
          <button type="button" onClick={onClose} className="font-mono text-xs text-silver">
            Close
          </button>
        </div>
        <ul className="mt-4 space-y-2 font-mono text-sm text-silver">
          {shortcuts.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-4">
              <span>{s.action}</span>
              <kbd className="rounded-sm border border-racing/50 bg-navy px-2 py-0.5 text-white">{s.key}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
