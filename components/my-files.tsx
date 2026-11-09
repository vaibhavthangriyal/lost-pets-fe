'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { ErrorMessage, Modal } from './shared';

type FileRecord = { id: string; filename: string; size: number; mimeType: string; status: 'pending' | 'uploaded' | 'failed' };
type UploadRequest = { file: FileRecord; upload: { url: string; method: string; headers: Record<string, string> } };
type Download = { download: { url: string } };
export function MyFiles({ token, onClose }: { token: string; onClose: () => void }) {
  const [files, setFiles] = useState<FileRecord[]>([]); const [selected, setSelected] = useState<File | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const input = useRef<HTMLInputElement>(null);
  useEffect(() => { let active = true; api<FileRecord[]>('/files', { token }).then(data => { if (active) setFiles(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  function update(file: FileRecord) { setFiles(prev => [file, ...prev.filter(item => item.id !== file.id)]); }
  async function confirm(id: string) { const file = await api<FileRecord>(`/files/${id}/confirm`, { method: 'POST', token }); update(file); return file; }
  async function upload() {
    if (!selected) return; setBusy(true); setError(''); setNotice('');
    try {
      if (!selected.size || selected.size > 104857600) throw new Error('Choose a non-empty file no larger than 100 MiB.');
      const request = await api<UploadRequest>('/files/upload-url', { method: 'POST', token, body: { filename: selected.name, mimeType: selected.type || 'application/octet-stream', size: selected.size } });
      update(request.file);
      const response = await fetch(request.upload.url, { method: request.upload.method, headers: request.upload.headers, body: selected, credentials: 'omit' });
      if (!response.ok) throw new Error(`Upload failed (HTTP ${response.status}).`);
      await confirm(request.file.id); setSelected(null); if (input.current) input.current.value = ''; setNotice('File uploaded and confirmed.');
    } catch (err) { setError((err as Error).message || 'Upload failed.'); } finally { setBusy(false); }
  }
  async function retry(id: string) { setBusy(true); setError(''); setNotice(''); try { await confirm(id); setNotice('Upload confirmed.'); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  async function download(id: string) { setBusy(true); setError(''); try { const result = await api<Download>(`/files/${id}/download-url`, { token }); window.location.assign(result.download.url); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  return <Modal title="My files" subtitle="Upload and access your private files." onClose={onClose}><div className="form"><ErrorMessage message={error}/>{notice && <div className="success" role="status">{notice}</div>}<label>Choose a file<input ref={input} type="file" onChange={event => setSelected(event.target.files?.[0] ?? null)}/></label><p className="form-note">Any file type, up to 100 MiB. Files are private to your account. Duration is not detected automatically.</p><button className="button primary" type="button" onClick={upload} disabled={!selected || busy}>{busy ? 'Working...' : 'Upload file'}</button>{loading ? <p className="small-muted">Loading files...</p> : <><h3>Recent files</h3>{!files.length && <p className="small-muted">No files uploaded yet.</p>}{files.map(file => <div className="file-item" key={file.id}><div><strong>{file.filename}</strong><p className="small-muted">{file.mimeType} · {(file.size / 1048576).toFixed(2)} MiB · {file.status}</p></div>{file.status === 'uploaded' ? <button type="button" className="button secondary" disabled={busy} onClick={() => download(file.id)}>Download</button> : file.status === 'pending' ? <button type="button" className="button secondary" disabled={busy} onClick={() => retry(file.id)}>Retry confirmation</button> : null}</div>)}<p className="form-note">Showing up to 100 recent files. Pending uploads can be confirmed if the upload completed but confirmation failed.</p></>}</div></Modal>;
}
