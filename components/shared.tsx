'use client';
import { LocateFixed, X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [onClose]);
  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>{children}
  </section></div>;
}
export function ErrorMessage({ message }: { message: string }) { return message ? <div className="error" role="alert">{message}</div> : null; }
export function LocationFields({ latitude, longitude, setLatitude, setLongitude, onLocate, locating }: { latitude: string; longitude: string; setLatitude: (value: string) => void; setLongitude: (value: string) => void; onLocate: () => void; locating: boolean }) {
  return <div className="location-fields"><div className="row-label"><label>Location coordinates</label><button className="text-button" type="button" onClick={onLocate} disabled={locating}><LocateFixed size={15}/>{locating ? 'Locating...' : 'Use my location'}</button></div><div className="form-row"><label><span>Latitude</span><input required type="number" step="any" min="-90" max="90" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g. 40.7128" /></label><label><span>Longitude</span><input required type="number" step="any" min="-180" max="180" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="e.g. -74.0060" /></label></div></div>;
}
