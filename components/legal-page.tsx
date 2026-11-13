import { Heart, PawPrint } from 'lucide-react';
import Link from 'next/link';

export const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@lostpetfinder.app';

export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div className="legal-shell">
    <header className="legal-header"><div className="legal-nav"><Link className="brand" href="/" aria-label="LostPetFinder home"><span className="brand-icon"><PawPrint size={20} fill="currentColor"/></span><span>LostPetFinder</span></Link><nav aria-label="Legal and support navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link></nav></div></header>
    <main className="legal-main"><div className="legal-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><small>Last updated: November 13, 2026</small></div><article className="legal-content">{children}</article></main>
    <footer className="legal-footer"><div><Link className="brand footer-brand" href="/"><span className="brand-icon"><PawPrint size={17} fill="currentColor"/></span>LostPetFinder</Link><p>Helping pets find their way home. <Heart size={13} fill="currentColor"/></p><nav><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link><Link href="/support">Support</Link></nav></div></footer>
  </div>;
}

export function ContactLink({ subject, children }: { subject: string; children?: React.ReactNode }) {
  return <a href={`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`}>{children || supportEmail}</a>;
}
