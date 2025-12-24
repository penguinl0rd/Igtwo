
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

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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

        checkAutomations(latitude, longitude);
      },
      (err) => {
        console.error("GPS Error:", err);
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

  useEffect(() => {
    localStorage.setItem('igloo_palette', JSON.stringify(palette));
    localStorage.setItem('igloo_family', JSON.stringify(family));
    localStorage.setItem('igloo_reports', JSON.stringify(reports));
  }, [palette, family, reports]);

  const checkAutomations = useCallback((lat: number, lng: number) => {
    family.automations.forEach(rule => {
      if (!rule.enabled) return;
      const isTrigger = rule.triggerMemberIds.includes('all') || rule.triggerMemberIds.includes('me');
      if (!isTrigger) return;

      const dist = getDistance(lat, lng, rule.lat, rule.lng);
      const isInside = dist <= rule.radius;

      if (isInside && !insideBubbles.current.has(rule.id)) {
        insideBubbles.current.add(rule.id);
        const me = family.members.find(m => m.id === 'me')!;
        const autoReport: BroadcastMessage = {
          id: `auto-${Date.now()}`,
          senderId: 'me',
          senderName: me.name,
          type: 'automation',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: `${me.name} ENTERED ${rule.name}`,
          targetMemberIds: rule.receiverMemberIds,
          mapLink: `https://www.google.com/maps?q=${rule.lat},${rule.lng}`
        } as any;
        syncChannel.current?.postMessage({ type: 'STATUS_UPDATE', report: autoReport });
        setReports(prev => [autoReport, ...prev].slice(0, 15));
      } else if (!isInside && insideBubbles.current.has(rule.id)) {
        insideBubbles.current.delete(rule.id);
      }
    });
  }, [family.automations, family.members]);

  const handleNav = (view: ViewType) => {
    audio.playSelect();
    setActiveView(view);
  };

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: palette.secondary }}>
      <header className="h-16 px-4 flex items-center justify-between border-b-4 border-slate-800 bg-slate-950/90 backdrop-blur-md z-[1000]">
        <button onClick={() => handleNav('family')} className={`p-2 pixel-border-sm pixel-button-press transition-all ${activeView === 'family' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
          <PIXEL_ICONS.Family />
        </button>
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 text-indigo-400"><PIXEL_ICONS.Igloo /></div>
                <span className="text-lg font-bold tracking-widest text-white">IGLOO</span>
            </div>
            <span className="text-[9px] text-indigo-400 font-bold tracking-[0.2em]">{family.familyId}</span>
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

      <nav className="h-20 border-t-4 border-slate-800 flex justify-around items-center bg-slate-950/90 px-4 z-[1000]">
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
