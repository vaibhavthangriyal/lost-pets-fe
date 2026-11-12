'use client';
import { useEffect, useState } from 'react';
import { api, User } from '../lib/api';
import { ErrorMessage, Modal } from './shared';

type Account = User & { email?: string };
export function ProfileSettings({ token, user, onClose, onUpdated }: { token: string; user: User; onClose: () => void; onUpdated: (user: User) => void }) {
  const [displayName, setDisplayName] = useState(user.displayName); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  async function save(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(''); setNotice(''); try { const updated = await api<Account>('/auth/me', { method: 'PATCH', token, body: { displayName: displayName.trim() } }); onUpdated({ id: updated.id, displayName: updated.displayName }); setNotice('Profile updated.'); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  return <Modal title="Profile settings" subtitle="Choose how your name appears to the community." onClose={onClose}><form className="form" onSubmit={save}><ErrorMessage message={error}/>{notice && <div className="success">{notice}</div>}<label>Display name<input required maxLength={80} value={displayName} onChange={event => setDisplayName(event.target.value)}/></label><button className="button primary" disabled={busy || !displayName.trim()}>{busy ? 'Saving...' : 'Save changes'}</button></form></Modal>;
}
export function AccountSettings({ token, onClose, onLogout }: { token: string; onClose: () => void; onLogout: () => void }) {
  const [account, setAccount] = useState<Account | null>(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; api<Account>('/auth/me', { token }).then(value => { if (active) setAccount(value); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, [token]);
  return <Modal title="Account settings" subtitle="Your sign-in and account information." onClose={onClose}><div className="form"><ErrorMessage message={error}/><div className="settings-row"><span>Email address</span><strong>{account?.email || 'Loading...'}</strong></div><p className="form-note">Your email address is private and is never shown on public posts. Pawprint uses one-time codes instead of a password.</p><button className="button secondary" type="button" onClick={onLogout}>Log out of this account</button></div></Modal>;
}
