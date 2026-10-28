export function ExternalLink({ href, children, className = '', ...props }) {
  const isTodo = !href || String(href).includes('TODO')

  if (isTodo) {
    return null
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
