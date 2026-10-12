/* Small decorative pieces used across the editorial design */

export function Sparkle({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  );
}

export function Divider({ className = '' }) {
  return (
    <span className={'divider ' + className} aria-hidden="true">
      <i />
      <Sparkle size={9} />
      <i />
    </span>
  );
}

/** Thin flowering branch, drawn as line art */
export function Sprig({ className = '' }) {
  return (
    <svg className={'sprig ' + className} viewBox="0 0 120 260" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <path d="M60 258C58 200 66 150 52 96 44 64 50 30 70 4" />
      <path d="M57 200c-14-6-24-18-26-34 14 4 24 16 26 34zM59 170c14-8 26-8 36 0-12 8-24 8-36 0zM54 132c-16-2-28-12-32-26 16 0 28 10 32 26zM53 100c12-10 24-14 36-10-8 12-22 14-36 10zM55 64c-12-6-18-18-18-30 12 6 18 16 18 30zM64 28c8-10 18-14 28-12-6 10-16 14-28 12z" />
      <circle cx="70" cy="4" r="3" />
      <circle cx="96" cy="170" r="2" />
      <circle cx="22" cy="106" r="2" />
    </svg>
  );
}

/** Laurel used beside highlights */
export function Laurel({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
      <path d="M15 40C8 34 6 24 9 14M33 40c7-6 9-16 6-26" />
      <path d="M10 18c-4-1-6-4-6-7 4 0 6 3 6 7zM9 25c-4 0-7-2-8-5 4-1 7 1 8 5zM11 32c-4 1-7 0-9-3 4-1 7 0 9 3zM38 18c4-1 6-4 6-7-4 0-6 3-6 7zM39 25c4 0 7-2 8-5-4-1-7 1-8 5zM37 32c4 1 7 0 9-3-4-1-7 0-9 3z" />
    </svg>
  );
}
