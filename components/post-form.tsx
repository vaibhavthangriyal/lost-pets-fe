'use client';
import { useState } from 'react';
import { api, currentLocation, labels, PostType } from '../lib/api';
import { ErrorMessage, LocationFields, Modal } from './shared';

export function PostForm({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<PostType>('lost'); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [species, setSpecies] = useState(''); const [photos, setPhotos] = useState(''); const [relatedPostId, setRelatedPostId] = useState('');
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [occurredAt, setOccurredAt] = useState(''); const [busy, setBusy] = useState(false); const [locating, setLocating] = useState(false); const [error, setError] = useState('');
  async function locate() { setLocating(true); setError(''); try { const p = await currentLocation(); setLatitude(String(p.latitude)); setLongitude(String(p.longitude)); } catch (err) { setError((err as Error).message); } finally { setLocating(false); } }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await api('/posts', { method: 'POST', token, body: { type, title: title.trim(), description: description.trim(), ...(species.trim() ? { species: species.trim() } : {}), photos: photos.split('\n').map(s => s.trim()).filter(Boolean), location: { latitude: Number(latitude), longitude: Number(longitude) }, occurredAt: new Date(occurredAt).toISOString(), ...(type === 'sighting' && relatedPostId.trim() ? { relatedPostId: relatedPostId.trim() } : {}) } });
      onCreated();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <Modal title="Create a post" subtitle="A little detail can make a big difference." onClose={onClose}><form className="form" onSubmit={submit}>
    <ErrorMessage message={error}/><label>Post type<select value={type} onChange={e => setType(e.target.value as PostType)}>{(Object.keys(labels) as PostType[]).map(key => <option key={key} value={key}>{labels[key]}</option>)}</select></label>
    <label>Title<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your post a clear title" /></label>
    <label>Description<textarea required maxLength={5000} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Share identifying details, where they were last seen, and anything else that could help." /></label>
    <div className="form-row"><label>Animal type <span className="optional">(optional)</span><input maxLength={80} value={species} onChange={e => setSpecies(e.target.value)} placeholder="e.g. Dog" /></label><label>When did it happen?<input required type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)} /></label></div>
    <LocationFields {...{ latitude, longitude, setLatitude, setLongitude, onLocate: locate, locating }}/><p className="form-note">This location will be visible to everyone.</p>
    <label>Photo URLs <span className="optional">(optional)</span><textarea rows={2} value={photos} onChange={e => setPhotos(e.target.value)} placeholder="https://example.com/photo.jpg" /><span className="form-note">One public image URL per line, up to 10. Direct photo uploads are not available yet.</span></label>
    {type === 'sighting' && <label>Related lost post ID <span className="optional">(optional)</span><input value={relatedPostId} onChange={e => setRelatedPostId(e.target.value)} placeholder="Paste the ID from a lost pet post" /></label>}
    <button className="button primary wide" disabled={busy}>{busy ? 'Publishing...' : 'Publish post'}</button>
  </form></Modal>;
}
