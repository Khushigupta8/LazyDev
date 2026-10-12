import './admin.css';

export const metadata = {
  title: 'Admin · LazyDev',
  robots: { index: false, follow: false },
  icons: { icon: '/brand/icon.png' },
};

export default function AdminLayout({ children }) {
  return children;
}
