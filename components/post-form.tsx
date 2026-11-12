'use client';
import { useEffect, useState } from 'react';
import { api, currentLocation, Metadata, PostType } from '../lib/api';
import { ErrorMessage, LocationFields, Modal } from './shared';

export function PostForm({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<PostType>('lost'); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [species, setSpecies] = useState(''); const [breed, setBreed] = useState(''); const [photos, setPhotos] = useState<File[]>([]); const [relatedPostId, setRelatedPostId] = useState('');
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [occurredAt, setOccurredAt] = useState(''); const [busy, setBusy] = useState(false); const [locating, setLocating] = useState(false); const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<Metadata>({ petTypes: [], postTypes: [], breeds: [], currencies: [] });
  useEffect(() => { let active = true; api<Metadata>('/meta').then(data => { if (active) setMetadata(data); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, []);
  async function locate() { setLocating(true); setError(''); try { const p = await currentLocation(); setLatitude(String(p.latitude)); setLongitude(String(p.longitude)); } catch (err) { setError((err as Error).message); } finally { setLocating(false); } }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (photos.length > 10) throw new Error('You can add up to 10 photos.');
      if (photos.some(photo => !photo.type.startsWith('image/'))) throw new Error('Please choose image files only.');
      if (photos.some(photo => !photo.size || photo.size > 104857600)) throw new Error('Each photo must be non-empty and no larger than 100 MiB.');
      const photoFileIds: string[] = [];
      for (const photo of photos) {
        const request = await api<{ file: { id: string }; upload: { url: string; method: string; headers: Record<string, string> } }>('/files/upload-url', { method: 'POST', token, body: { filename: photo.name, mimeType: photo.type, size: photo.size } });
        const response = await fetch(request.upload.url, { method: request.upload.method, headers: request.upload.headers, body: photo, credentials: 'omit' });
        if (!response.ok) throw new Error(`Could not upload ${photo.name} (HTTP ${response.status}).`);
        await api(`/files/${request.file.id}/confirm`, { method: 'POST', token });
        photoFileIds.push(request.file.id);
      }
      await api('/posts', { method: 'POST', token, body: { type, title: title.trim(), description: description.trim(), ...(species ? { species } : {}), ...(breed ? { breed } : {}), photoFileIds, location: { latitude: Number(latitude), longitude: Number(longitude) }, occurredAt: new Date(occurredAt).toISOString(), ...(type === 'sighting' && relatedPostId.trim() ? { relatedPostId: relatedPostId.trim() } : {}) } });
      onCreated();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <Modal title="Create a post" subtitle="A little detail can make a big difference." onClose={onClose}><form className="form" onSubmit={submit}>
    <ErrorMessage message={error}/><label>Post type<select required value={type} onChange={e => setType(e.target.value as PostType)}>{metadata.postTypes.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label>Title<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your post a clear title" /></label>
    <label>Description<textarea required maxLength={5000} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Share identifying details, where they were last seen, and anything else that could help." /></label>
    <div className="form-row"><label>Animal type <span className="optional">(optional)</span><select value={species} onChange={e => { setSpecies(e.target.value); setBreed(''); }}><option value="">Select animal type</option>{metadata.petTypes.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Breed <span className="optional">(optional)</span><select value={breed} disabled={!species || !metadata.breeds.some(option => option.petType === species)} onChange={e => setBreed(e.target.value)}><option value="">{species ? 'Select breed' : 'Select animal type first'}</option>{metadata.breeds.filter(option => option.petType === species).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
    <label>When did it happen?<input required type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)} /></label>
    <LocationFields {...{ latitude, longitude, setLatitude, setLongitude, onLocate: locate, locating }}/><p className="form-note">This location will be visible to everyone.</p>
    <label>Photos <span className="optional">(optional)</span><input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files ?? []))}/><span className="form-note">Choose up to 10 images. They will be uploaded when you publish the post.</span></label>
    {type === 'sighting' && <label>Related lost post ID <span className="optional">(optional)</span><input value={relatedPostId} onChange={e => setRelatedPostId(e.target.value)} placeholder="Paste the ID from a lost pet post" /></label>}
    <button className="button primary wide" disabled={busy}>{busy ? 'Publishing...' : 'Publish post'}</button>
  </form></Modal>;
}
