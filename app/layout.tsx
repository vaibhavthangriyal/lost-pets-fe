import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Pawprint | Bring them home', description: 'Help lost pets find their way home, together.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
