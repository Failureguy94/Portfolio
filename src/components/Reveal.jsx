import { useInView } from '../hooks/useInView'

/** Rises and sharpens into place the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.15 })
  return (
    <Tag
      ref={ref}
      data-inview={inView}
      className={`rise ${className}`}
      style={{ '--d': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
