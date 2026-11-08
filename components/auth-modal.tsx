'use client';
import { useState } from 'react';
import { api, User } from '../lib/api';
import { ErrorMessage, Modal } from './shared';

export function AuthModal({ onClose, onSignIn }: { onClose: () => void; onSignIn: (token: string, user: User) => void }) {
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email'); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (step === 'email') { await api('/auth/otp/request', { method: 'POST', body: { email } }); setStep('code'); }
      else { const result = await api<{ accessToken: string; user: User }>('/auth/otp/verify', { method: 'POST', body: { email, code, displayName: name } }); onSignIn(result.accessToken, result.user); }
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <Modal title={step === 'email' ? 'Welcome to Pawprint' : 'Check your code'} subtitle={step === 'email' ? 'Sign in to help pets find their way home.' : `Enter the six-digit code for ${email}.`} onClose={onClose}>
    <form className="form" onSubmit={submit}><ErrorMessage message={error}/>{step === 'email' ? <label>Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label> : <><label>Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" /></label><label>Display name<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="How should we call you?" /></label><button className="text-button" type="button" onClick={() => { setStep('email'); setError(''); }}>Change email or request another code</button></>}
      <button className="button primary wide" disabled={busy}>{busy ? 'Please wait...' : step === 'email' ? 'Send verification code' : 'Sign in'}</button><p className="form-note">Your email is never shown publicly. For now, verification codes are available in the backend console in development.</p>
    </form>
  </Modal>;
}
