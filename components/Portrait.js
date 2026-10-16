/**
 * The owner's photo inside an arch, or an elegant monogram until a photo is uploaded.
 * `priority` for the above-the-fold hero copy; every other copy lazy-loads.
 */
export default function Portrait({ photo, name, role, className = '', priority = false }) {
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <div className={'portrait ' + className}>
      <div className="portrait-arch" />
      {photo ? (
        <div className="portrait-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={[name, role].filter(Boolean).join(', ')}
            className="portrait-img"
            width={760}
            height={988}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        </div>
      ) : (
        <div className="portrait-empty">
          <span>{initials || 'LD'}</span>
          <small>Your photo here</small>
        </div>
      )}
    </div>
  );
}
