/** Renders text where *words in asterisks* become highlighted (bold) spans. */
export default function RichText({ text = '', as: Tag = 'span', className }) {
  const parts = String(text).split(/\*(.+?)\*/g);
  return (
    <Tag className={className}>
      {parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}
    </Tag>
  );
}
