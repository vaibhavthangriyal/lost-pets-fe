'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { labels, Location, PetPost } from '../lib/api';

export function PostsMap({ posts, location, onSelect }: { posts: PetPost[]; location: Location | null; onSelect: (post: PetPost) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const mapped = posts.filter(post => (post.type === 'lost' || post.type === 'sighting') && Array.isArray(post.location?.coordinates) && post.location.coordinates.length === 2 && post.location.coordinates.every(Number.isFinite));

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    setError('');
    import('leaflet').then(L => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false }).setView(location ? [location.latitude, location.longitude] : [20, 0], location ? 11 : 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      const points: [number, number][] = [];
      for (const post of mapped) {
        const [longitude, latitude] = post.location.coordinates;
        const point: [number, number] = [latitude, longitude];
        points.push(point);
        const marker = L.circleMarker(point, { radius: 9, color: '#fff', weight: 2, fillColor: post.type === 'lost' ? '#c66e53' : '#4d7eb5', fillOpacity: post.status === 'resolved' ? 0.5 : 1 }).addTo(map);
        const popup = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = post.title;
        const detail = document.createElement('p');
        detail.textContent = `${labels[post.type]} · ${post.status === 'resolved' ? 'Resolved' : 'Active'} · ${new Date(post.occurredAt).toLocaleDateString()}`;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'map-popup-button'; button.textContent = 'View post';
        button.addEventListener('click', () => onSelect(post));
        popup.append(title, detail, button);
        marker.bindPopup(popup);
        marker.bindTooltip(post.title);
      }
      if (points.length && map) map.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 13 });
    }).catch(() => { if (!cancelled) setError('Could not load the map. Please refresh and try again.'); });
    return () => { cancelled = true; map?.remove(); };
  // Post data changes when the user changes filters, loads more, or refreshes.
  }, [posts, location, onSelect]);

  return <section className="posts-map-section" aria-label="Map of lost pets and sightings">
    <div className="map-heading"><div><h3>Lost pets & sightings map</h3><p>Markers show locations from the posts currently loaded below.</p></div><div className="map-legend"><span><i className="map-dot lost-dot"/> Lost pet</span><span><i className="map-dot sighting-dot"/> Sighting</span></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="map-container" ref={container} aria-label="Interactive map of lost pets and sightings" />
    <p className="map-caption">{mapped.length ? `${mapped.length} ${mapped.length === 1 ? 'post' : 'posts'} on the map. Select a marker to see details.` : 'No lost pets or sightings in the loaded posts. Try another filter or area.'} Resolved posts appear faded.</p>
  </section>;
}
