import Link from 'next/link';
import JsonLd from './JsonLd';
import { absoluteUrl } from '@/lib/site';

/** Visible breadcrumb trail plus BreadcrumbList structured data. `items`: [{ name, path }], last item = current page. */
export default function Breadcrumbs({ items }) {
  const trail = [{ name: 'Home', path: '/' }, ...items];
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {trail.map((c, i) => (
          <li key={c.path}>
            {i < trail.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
        }}
      />
    </nav>
  );
}
