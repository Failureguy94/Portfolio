import { useInView } from '../hooks/useInView'

/**
 * Heading whose words slide up out of their own masks, one after another.
 * Screen readers read the plain text.
 */
export function SplitText({ as: Tag = 'h2', text, delay = 0, className = '', ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.2 })
  const words = text.split(' ')
  return (
    <Tag ref={ref} data-inview={inView} className={className} style={{ '--d': `${delay}ms` }} {...rest}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          <span className="split-word">
            <span style={{ '--i': i }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
