/** The owner's photo inside an arch, or an elegant monogram until a photo is uploaded. */
export default function Portrait({ photo, name, className = '' }) {
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
          <img src={photo} alt={name} className="portrait-img" />
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
