
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, FamilyMember, BroadcastMessage, FamilyState, SyncEvent, AutomationRule } from './types';
import { PIXEL_ICONS, COLOR_PALETTES } from './constants';
import { audio } from './services/audio';

// Views
import TrackerView from './views/Tracker';
import FamilyView from './views/Family';
import ReportView from './views/Report';
import AutomationView from './views/Automation';
import SettingsView from './views/Settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('tracker');
  const [locationReady, setLocationReady] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [palette, setPalette] = useState(() => {
    const saved = localStorage.getItem('igloo_palette');
    return saved ? JSON.parse(saved) : COLOR_PALETTES[0];
  });

  const [family, setFamily] = useState<FamilyState>(() => {
    const saved = localStorage.getItem('igloo_family');
    if (saved) return JSON.parse(saved);
    
    return {
      familyId: 'POLAR-1337',
      familyName: 'My Igloo',
      members: [
        { id: 'me', name: 'YOU', role: 'Admin', lat: 0, lng: 0, lastSeen: 'Waiting...', status: 'offline', avatarColor: '#38bdf8', avatarIcon: 'Penguin' }
      ],
      automations: []
    };
  });

  const [reports, setReports] = useState<BroadcastMessage[]>(() => {
    const saved = localStorage.getItem('igloo_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const syncChannel = useRef<BroadcastChannel | null>(null);
  const insideBubbles = useRef<Set<string>>(new Set());
  const watchId = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("GPS NOT SUPPORTED");
      return;
    }
    setLocationError(null);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationReady(true);
        setLocationError(null);
        setFamily(prev => ({
          ...prev,
          members: prev.members.map(m => m.id === 'me' ? { ...m, lat: latitude, lng: longitude, status: 'home' } : m)
        }));
        syncChannel.current?.postMessage({
          type: 'LOCATION_UPDATE',
          memberId: 'me',
          lat: latitude,
          lng: longitude
        });
      },
      (err) => {
        let msg = "SIGNAL LOST";
        if (err.code === 1) msg = "PERMISSION DENIED";
        else if (err.code === 3) msg = "GPS TIMEOUT (RETRY)";
        setLocationError(msg);
        setLocationReady(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    syncChannel.current = new BroadcastChannel('igloo_live_sync');
    syncChannel.current.onmessage = (event: MessageEvent<SyncEvent>) => {
      const data = event.data;
      if (data.type === 'LOCATION_UPDATE') {
        setFamily(prev => ({
          ...prev,
          members: prev.members.map(m => 
            m.id === data.memberId ? { ...m, lat: data.lat, lng: data.lng, lastSeen: 'Just now', status: 'home' } : m
          )
        }));
      } else if (data.type === 'STATUS_UPDATE') {
        setReports(prev => [data.report, ...prev].slice(0, 15));
        audio.playSuccess();
      }
    };
    startTracking();
    return () => {
        syncChannel.current?.close();
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [startTracking]);

  const handleNav = (view: ViewType) => {
    audio.playSelect();
    setActiveView(view);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: palette.secondary }}>
      <header className="h-14 px-4 flex items-center justify-between border-b-4 border-slate-800 bg-slate-950/90 backdrop-blur-md z-[1000]">
        <button onClick={() => handleNav('family')} className={`p-2 pixel-border-sm pixel-button-press transition-all ${activeView === 'family' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
          <PIXEL_ICONS.Family />
        </button>
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-indigo-400"><PIXEL_ICONS.Igloo /></div>
                <span className="text-md font-bold tracking-widest text-white">IGLOO</span>
            </div>
            <span className="text-[8px] text-indigo-400 font-bold tracking-[0.2em]">{family.familyId}</span>
        </div>
        <button onClick={() => handleNav('settings')} className={`p-2 pixel-border-sm pixel-button-press transition-all ${activeView === 'settings' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
          <PIXEL_ICONS.Cog />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeView === 'tracker' && (
            <TrackerView 
                members={family.members} 
                palette={palette} 
                locationReady={locationReady} 
                locationError={locationError} 
                onRetry={startTracking} 
            />
        )}
        {activeView === 'family' && <FamilyView family={family} onJoin={(id) => setFamily(f => ({...f, familyId: id}))} onCreate={(id) => setFamily(f => ({...f, familyId: id}))} palette={palette} />}
        {activeView === 'report' && <ReportView members={family.members} reports={reports} addBroadcast={(type) => {}} palette={palette} />}
        {activeView === 'automation' && <AutomationView members={family.members} automations={family.automations} setAutomations={(rules) => setFamily(f => ({...f, automations: rules}))} palette={palette} />}
        {activeView === 'settings' && <SettingsView palette={palette} setPalette={setPalette} me={family.members.find(m => m.id === 'me')!} updateProfile={(n, i) => {}} />}
      </main>

      {/* Added safe area padding to ensure system bar doesn't block icons */}
      <nav className="border-t-4 border-slate-800 flex justify-around items-center bg-slate-950/90 px-4 z-[1000]" style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <NavButton active={activeView === 'tracker'} onClick={() => handleNav('tracker')} label="Map" icon={<PIXEL_ICONS.Map />} />
        <NavButton active={activeView === 'report'} onClick={() => handleNav('report')} label="Sync" icon={<PIXEL_ICONS.Report />} />
        <NavButton active={activeView === 'automation'} onClick={() => handleNav('automation')} label="Auto" icon={<PIXEL_ICONS.Automation />} />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-20 py-2 pixel-button-press transition-all ${active ? 'text-indigo-400 -translate-y-1' : 'text-slate-500'}`}>
    <div className={`${active ? 'scale-110 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]' : 'scale-100'}`}>{icon}</div>
    <span className="text-[10px] uppercase font-bold tracking-tighter">{label}</span>
  </button>
);

export default App;
