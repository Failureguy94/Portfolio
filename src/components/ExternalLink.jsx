export function ExternalLink({ href, children, className = '', ...props }) {
  const isTodo = !href || String(href).includes('TODO')

  if (isTodo) {
    return (
      <span className={`${className} cursor-not-allowed opacity-70`} title="TODO: add URL in data file">
        {children} <span className="font-mono text-[10px] tracking-wide text-sun">TODO</span>
      </span>
    )
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
