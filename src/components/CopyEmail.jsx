import { useState } from 'react'

export function CopyEmail({ email, labels, className = '' }) {
  const [state, setState] = useState('idle')

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 2400)
  }

  const text = state === 'copied' ? labels.copied : state === 'failed' ? labels.copyFailed : labels.copy
  return (
    <button type="button" onClick={onCopy} className={className}>
      <span aria-live="polite">{text}</span>
    </button>
  )
}
