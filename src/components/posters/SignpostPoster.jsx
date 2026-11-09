import { Poster } from './Poster'

function Board({ y, dir, fill, text, textFill, rotate }) {
  const w = 168
  const x = dir === 'right' ? 200 : 200 - w
  const tip = dir === 'right' ? `M${x + w} ${y} l26 22 l-26 22 z` : `M${x} ${y} l-26 22 l26 22 z`
  return (
    <g transform={`rotate(${rotate} 200 ${y + 22})`} filter="url(#rough)">
      <rect x={x} y={y} width={w} height="44" fill={fill} />
      <path d={tip} fill={fill} />
      <text
        x={dir === 'right' ? x + 18 : x + w - 18}
        y={y + 32}
        textAnchor={dir === 'right' ? 'start' : 'end'}
        fontFamily="Anton, Impact, sans-serif"
        fontSize="28"
        fill={textFill}
      >
        {text}
      </text>
    </g>
  )
}

export function SignpostPoster({ id, alt }) {
  return (
    <Poster id={id} alt={alt} bg="var(--color-paper-2)">
      <g filter="url(#rough)">
        <circle cx="356" cy="64" r="58" fill="var(--color-mustard)" />
        <path d="M0 430 C90 400 170 412 250 424 C320 434 360 420 400 410 V500 H0 Z" fill="var(--color-ink)" />
      </g>
      <rect x="191" y="112" width="18" height="330" fill="var(--color-ink)" transform="rotate(3 200 440)" />
      <Board y={132} dir="right" fill="var(--color-bass)" text="WEB" textFill="var(--color-paper)" rotate={-7} />
      <Board y={206} dir="left" fill="var(--color-ink)" text="ML" textFill="var(--color-paper)" rotate={5} />
      <Board y={280} dir="right" fill="var(--color-mustard)" text="WEB3" textFill="var(--color-ink)" rotate={-16} />
    </Poster>
  )
}
