/** Decorative glowing flow lines (like silk ribbons) used behind sections. */
export default function FlowLines({ className = '' }) {
  const paths = [
    'M-50 260 C 250 120, 450 380, 720 220 S 1150 60, 1500 200',
    'M-50 290 C 260 160, 470 400, 730 250 S 1160 100, 1500 240',
    'M-50 320 C 270 200, 490 420, 740 280 S 1170 140, 1500 280',
    'M-50 350 C 280 240, 510 440, 750 310 S 1180 180, 1500 320',
    'M-50 380 C 290 280, 530 460, 760 340 S 1190 220, 1500 360',
  ];
  return (
    <svg className={'flow-lines ' + className} viewBox="0 0 1440 500" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="flowGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#ff4fa3" stopOpacity="0" />
          <stop offset="0.35" stopColor="#ff4fa3" />
          <stop offset="0.7" stopColor="#b892ff" />
          <stop offset="1" stopColor="#b892ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="url(#flowGrad)" strokeWidth={i === 2 ? 2 : 1} fill="none" opacity={0.25 + i * 0.1} />
      ))}
    </svg>
  );
}
