'use client';
import { useEffect, useState } from 'react';
import { api, AppNotification, PetPost } from '../lib/api';
import { ErrorMessage, Modal } from './shared';

export function NotificationsModal({ token, onClose, onOpenPost }: { token: string; onClose: () => void; onOpenPost: (post: PetPost) => void }) {
  const [items, setItems] = useState<AppNotification[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; api<AppNotification[]>('/me/notifications', { token }).then(data => { if (active) setItems(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  async function open(item: AppNotification) { setError(''); try { await api(`/me/notifications/${item._id}/open`, { method: 'POST', token }); const post = await api<PetPost>(`/posts/${item.post}`); onOpenPost(post); } catch (err) { setError((err as Error).message); } }
  async function readAll() { setError(''); try { await api('/me/notifications/read-all', { method: 'PATCH', token }); setItems(previous => previous.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); } catch (err) { setError((err as Error).message); } }
  return <Modal title="Notifications" subtitle="Nearby posts matching your saved locations." onClose={onClose}><div className="form"><ErrorMessage message={error}/>{loading ? <p className="small-muted">Loading notifications...</p> : !items.length ? <p className="small-muted">No notifications yet.</p> : <>{<button className="text-button" onClick={readAll}>Mark all as read</button>}<div className="location-list">{items.map(item => <button className={`notification-item ${item.readAt ? '' : 'unread'}`} key={item._id} onClick={() => open(item)}><strong>{item.title}</strong><span>{item.body}</span><small>{new Date(item.createdAt).toLocaleString()}</small></button>)}</div></>}</div></Modal>;
}
