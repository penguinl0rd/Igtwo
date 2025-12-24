
import React, { useEffect, useRef, useState } from 'react';
import { FamilyMember } from '../types';
import { PIXEL_ICONS } from '../constants';
import { audio } from '../services/audio';
import { renderToStaticMarkup } from 'react-dom/server';

interface Props {
  members: FamilyMember[];
  palette: any;
  locationReady: boolean;
  locationError: string | null;
  onRetry: () => void;
}

const TrackerView: React.FC<Props> = ({ members, palette, locationReady, locationError, onRetry }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers = useRef<{ [key: string]: any }>({});
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current || !(window as any).L) return;
    
    leafletMap.current = (window as any).L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true
    }).setView([0, 0], 2);

    (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(leafletMap.current);
    setIsMapReady(true);

    return () => {
        if (leafletMap.current) {
            leafletMap.current.remove();
            leafletMap.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return;

    members.forEach(member => {
      if (member.lat === 0) return;
      const IconComp = PIXEL_ICONS[member.avatarIcon || 'Penguin'] || PIXEL_ICONS.Penguin;
      
      const iconHtml = renderToStaticMarkup(
        <div className="relative flex flex-col items-center">
            <div className="w-10 h-10 pixel-border-sm flex items-center justify-center bg-slate-900 shadow-2xl" style={{ color: member.avatarColor }}>
                <div className="scale-75"><IconComp /></div>
                {member.id === 'me' && <div className="absolute inset-0 border-2 border-indigo-400 animate-ping opacity-40"></div>}
            </div>
            <div className="bg-slate-950 px-2 py-0.5 mt-1 pixel-border-sm text-[8px] uppercase font-bold text-white whitespace-nowrap">{member.name}</div>
        </div>
      );

      const pos = [member.lat, member.lng];
      if (!markers.current[member.id]) {
        const customIcon = (window as any).L.divIcon({ html: iconHtml, className: 'pixel-marker', iconSize: [40, 60], iconAnchor: [20, 50] });
        markers.current[member.id] = (window as any).L.marker(pos, { icon: customIcon }).addTo(leafletMap.current);
        if (member.id === 'me') leafletMap.current.setView(pos, 14);
      } else {
        markers.current[member.id].setLatLng(pos);
        const customIcon = (window as any).L.divIcon({ html: iconHtml, className: 'pixel-marker', iconSize: [40, 60], iconAnchor: [20, 50] });
        markers.current[member.id].setIcon(customIcon);
      }
    });
  }, [members, isMapReady]);

  const goToMember = (member: FamilyMember) => {
    if (member.lat === 0 || !leafletMap.current) return;
    audio.playBlip();
    leafletMap.current.flyTo([member.lat, member.lng], 16, { duration: 1.5 });
  };

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      {!locationReady && (
        <div className="absolute inset-0 z-[600] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-8 text-center">
            {locationError ? (
                <>
                    <div className="w-16 h-16 text-red-500 mb-4 animate-pulse">
                        <PIXEL_ICONS.Snowflake />
                    </div>
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">{locationError}</h3>
                    <p className="text-[8px] text-slate-500 uppercase mt-4 mb-8">Tundra sensors blocked by signal interference.</p>
                    <button 
                        onClick={() => { audio.playSelect(); onRetry(); }}
                        className="bg-indigo-600 px-6 py-3 pixel-border-sm text-[10px] font-bold text-white uppercase pixel-button-press"
                    >
                        Re-Scan Satellite
                    </button>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 text-indigo-500 animate-bounce mb-4"><PIXEL_ICONS.Snowflake /></div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Searching Satellite...</h3>
                    <p className="text-[8px] text-slate-500 uppercase mt-2">Pinging Orbital Relay Station</p>
                </>
            )}
        </div>
      )}

      <div ref={mapRef} className="w-full h-full pixel-map" />
      
      {/* HUD Layer */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="bg-slate-950/80 p-3 pixel-border-sm border-l-4 border-l-blue-400 flex flex-col gap-1 backdrop-blur-md">
            <h2 className="text-[8px] font-bold text-blue-400 tracking-[0.2em] uppercase">IGLOO SCANNER</h2>
            <div className="text-[7px] text-white font-mono opacity-50 uppercase">
                {locationReady ? 'LIVE STREAM: SECURE' : 'Pinging Satellite...'}
            </div>
        </div>
      </div>

      {/* Member Selector Row */}
      <div className="absolute bottom-4 left-4 right-4 z-[500] flex justify-center gap-4">
        {members.map(m => (
          <button 
            key={m.id} 
            onClick={() => goToMember(m)}
            className="w-12 h-12 bg-slate-900 pixel-border-sm pixel-button-press flex items-center justify-center shadow-2xl relative"
            style={{ color: m.avatarColor }}
          >
            <div className="scale-75">{PIXEL_ICONS[m.avatarIcon || 'Penguin']()}</div>
            {m.lat === 0 && <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-[6px] text-white font-bold">?</div>}
          </button>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] border-[16px] border-slate-950/40 z-[400]" />
    </div>
  );
};

export default TrackerView;
