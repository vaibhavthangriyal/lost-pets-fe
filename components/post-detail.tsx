'use client';
import { CalendarDays, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, Comment, labels, PetPost, User } from '../lib/api';
import { ErrorMessage, Modal } from './shared';

export function PostDetail({ post, token, user, onClose, onChanged, onSignIn }: { post: PetPost; token: string; user: User | null; onClose: () => void; onChanged: () => void; onSignIn: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]); const [text, setText] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [status, setStatus] = useState(post.status);
  useEffect(() => { let active = true; api<Comment[]>(`/posts/${post._id}/comments`).then(data => { if (active) setComments(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [post._id]);
  async function addComment(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { const comment = await api<Comment>(`/posts/${post._id}/comments`, { method: 'POST', token, body: { text: text.trim() } }); setComments(prev => [...prev, comment]); setText(''); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  async function changeStatus() { setBusy(true); setError(''); try { const next = status === 'active' ? 'resolved' : 'active'; await api(`/posts/${post._id}/status`, { method: 'PATCH', token, body: { status: next } }); setStatus(next); onChanged(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  const [lng, lat] = post.location.coordinates;
  return <Modal title={post.title} subtitle={`Posted by ${post.author?.displayName || 'Community member'}`} onClose={onClose}>
    {post.photos.length > 0 && <div className="detail-photos">{post.photos.map((photo, i) => <img key={`${photo}-${i}`} src={photo} alt={`${post.title}, photo ${i + 1}`} />)}</div>}
    <div className="detail-content"><div className="badges"><span className={`badge ${post.type}`}>{labels[post.type]}</span><span className={`badge ${status === 'resolved' ? 'resolved' : 'active'}`}>{status === 'resolved' ? 'Resolved' : 'Active'}</span></div>
      <p className="detail-description">{post.description}</p><div className="detail-meta"><span><CalendarDays size={16}/> {new Date(post.occurredAt).toLocaleString()}</span><a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`} target="_blank" rel="noreferrer"><MapPin size={16}/> {lat.toFixed(4)}, {lng.toFixed(4)} · View map</a></div>
      {post.species && <p className="small-muted">Animal: {post.species}</p>}<p className="small-muted">Post ID: {post._id}</p>
      {user && user.id === post.author?._id && <button type="button" className="button secondary" disabled={busy} onClick={changeStatus}>{status === 'active' ? 'Mark as resolved' : 'Reopen post'}</button>}
      <div className="comments-heading"><h3><MessageCircle size={18}/> Community updates</h3><span>{comments.length}</span></div><ErrorMessage message={error}/>
      {loading ? <p className="small-muted">Loading comments...</p> : comments.length === 0 ? <p className="small-muted">No comments yet. Share an update if you can help.</p> : <div className="comments">{comments.map(comment => <div className="comment" key={comment._id}><div className="avatar small">{(comment.author?.displayName || 'C').charAt(0).toUpperCase()}</div><div><strong>{comment.author?.displayName || 'Community member'}</strong><span className="comment-date"> · {new Date(comment.createdAt).toLocaleDateString()}</span><p>{comment.text}</p></div></div>)}</div>}
      {token ? <form onSubmit={addComment} className="comment-form"><label htmlFor="comment">Add a public comment</label><textarea id="comment" required maxLength={2000} rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Share a helpful update..."/><button className="button primary" disabled={busy || !text.trim()}>{busy ? 'Posting...' : 'Post comment'}</button></form> : <button className="button secondary" onClick={onSignIn}>Sign in to comment</button>}
    </div>
  </Modal>;
}
