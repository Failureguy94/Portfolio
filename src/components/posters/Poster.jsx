/** Frame shared by every poster: fixed 4:5 ratio (no layout shift), title + desc for screen readers. */
export function Poster({ id, alt, bg, children, className = '' }) {
  return (
    <svg
      viewBox="0 0 400 500"
      role="img"
      aria-labelledby={`${id}-t`}
      className={`block w-full ${className || 'h-auto'}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id={`${id}-t`}>{alt}</title>
      <rect width="400" height="500" fill={bg} />
      {children}
    </svg>
  )
}
