
import React, { useState, useEffect, useRef } from 'react';
import { AutomationRule, FamilyMember } from '../types';
import { audio } from '../services/audio';

interface Props {
  members: FamilyMember[];
  automations: AutomationRule[];
  setAutomations: (rules: AutomationRule[]) => void;
  palette: any;
}

const AutomationView: React.FC<Props> = ({ members, automations, setAutomations, palette }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: 'NEW BUBBLE',
    radius: 100,
    triggerMemberIds: ['all'],
    receiverMemberIds: ['all'],
    message: 'REACHED DESTINATION'
  });

  const miniMapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const centerMarker = useRef<any>(null);
  const centerCircle = useRef<any>(null);

  useEffect(() => {
    if (isCreating && miniMapRef.current && !leafletMap.current) {
      const me = members.find(m => m.id === 'me');
      const startLat = me?.lat || 37.7749;
      const startLng = me?.lng || -122.4194;

      leafletMap.current = (window as any).L.map(miniMapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([startLat, startLng], 15);

      (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);

      centerMarker.current = (window as any).L.marker([startLat, startLng], { draggable: true }).addTo(leafletMap.current);
      centerCircle.current = (window as any).L.circle([startLat, startLng], { radius: newRule.radius || 100, color: '#6366f1' }).addTo(leafletMap.current);

      leafletMap.current.on('click', (e: any) => {
        centerMarker.current.setLatLng(e.latlng);
        centerCircle.current.setLatLng(e.latlng);
        setNewRule(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      });

      centerMarker.current.on('dragend', (e: any) => {
        const latlng = e.target.getLatLng();
        centerCircle.current.setLatLng(latlng);
        setNewRule(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
      });

      setNewRule(prev => ({ ...prev, lat: startLat, lng: startLng }));
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isCreating]);

  useEffect(() => {
    if (centerCircle.current) {
      centerCircle.current.setRadius(newRule.radius || 100);
    }
  }, [newRule.radius]);

  const handleCreate = () => {
    if (!newRule.lat || !newRule.lng) return;
    const rule: AutomationRule = {
      id: Date.now().toString(),
      name: newRule.name || 'BUBBLE',
      lat: newRule.lat,
      lng: newRule.lng,
      radius: newRule.radius || 100,
      triggerMemberIds: newRule.triggerMemberIds || ['all'],
      receiverMemberIds: newRule.receiverMemberIds || ['all'],
      message: newRule.message || 'ARRIVED',
      enabled: true
    };
    setAutomations([...automations, rule]);
    setIsCreating(false);
    audio.playSuccess();
  };

  const toggleSelection = (list: string[], id: string) => {
    if (id === 'all') return ['all'];
    const newList = list.filter(x => x !== 'all');
    if (newList.includes(id)) {
        const filtered = newList.filter(x => x !== id);
        return filtered.length === 0 ? ['all'] : filtered;
    }
    return [...newList, id];
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto bg-slate-950 pb-24">
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
        <h2 className="text-xl text-indigo-400 font-bold tracking-widest uppercase">Bubbles</h2>
        <button onClick={() => setIsCreating(true)} className="bg-indigo-600 px-3 py-1 pixel-border-sm text-[8px] font-bold text-white uppercase">+ NEW BUBBLE</button>
      </div>

      {isCreating ? (
        <div className="bg-slate-900/80 p-5 pixel-border-sm space-y-5 animate-in slide-in-from-top-4">
          <div className="space-y-4">
            <div>
                <label className="text-[7px] text-slate-500 font-bold uppercase block mb-1">1. Pick Location on Map</label>
                <div ref={miniMapRef} className="h-40 w-full pixel-border-sm grayscale contrast-125 brightness-75" />
                <p className="text-[6px] text-slate-600 mt-1 uppercase">Tapping map sets bubble center</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Name</label>
                    <input value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value.toUpperCase()})} className="bg-slate-950 border-2 border-slate-800 p-2 text-[10px] uppercase text-white w-full" />
                </div>
                <div>
                    <label className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Radius (m)</label>
                    <input type="number" value={newRule.radius} onChange={e => setNewRule({...newRule, radius: parseInt(e.target.value)})} className="bg-slate-950 border-2 border-slate-800 p-2 text-[10px] uppercase text-white w-full" />
                </div>
            </div>

            <div>
                <label className="text-[7px] text-slate-500 font-bold uppercase block mb-1">2. Who Triggers this Bubble?</label>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setNewRule({...newRule, triggerMemberIds: ['all']})} className={`px-2 py-1 pixel-border-sm text-[8px] font-bold uppercase ${newRule.triggerMemberIds?.includes('all') ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500'}`}>Everyone</button>
                    {members.map(m => (
                        <button key={m.id} onClick={() => setNewRule({...newRule, triggerMemberIds: toggleSelection(newRule.triggerMemberIds || [], m.id)})} className={`px-2 py-1 pixel-border-sm text-[8px] font-bold uppercase ${newRule.triggerMemberIds?.includes(m.id) ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500'}`}>{m.name}</button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[7px] text-slate-500 font-bold uppercase block mb-1">3. Who gets Notified?</label>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setNewRule({...newRule, receiverMemberIds: ['all']})} className={`px-2 py-1 pixel-border-sm text-[8px] font-bold uppercase ${newRule.receiverMemberIds?.includes('all') ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500'}`}>Everyone</button>
                    {members.map(m => (
                        <button key={m.id} onClick={() => setNewRule({...newRule, receiverMemberIds: toggleSelection(newRule.receiverMemberIds || [], m.id)})} className={`px-2 py-1 pixel-border-sm text-[8px] font-bold uppercase ${newRule.receiverMemberIds?.includes(m.id) ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500'}`}>{m.name}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={handleCreate} className="bg-emerald-600 p-3 pixel-border-sm text-[10px] font-bold text-white uppercase">Activate</button>
                <button onClick={() => setIsCreating(false)} className="bg-slate-800 p-3 pixel-border-sm text-[10px] font-bold text-slate-400 uppercase">Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
            {automations.map(rule => (
                <div key={rule.id} className={`p-4 pixel-border-sm relative transition-all ${rule.enabled ? 'bg-slate-900 border-indigo-600' : 'bg-slate-950/40 opacity-50'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-bold text-white uppercase tracking-widest">{rule.name}</div>
                            <div className="text-[7px] text-indigo-400 font-bold uppercase mt-1">RADIUS: {rule.radius}M</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setAutomations(automations.map(a => a.id === rule.id ? {...a, enabled: !a.enabled} : a))} className={`px-2 py-1 pixel-border-sm text-[7px] font-bold uppercase ${rule.enabled ? 'bg-indigo-600' : 'bg-slate-800'}`}>{rule.enabled ? 'ON' : 'OFF'}</button>
                            <button onClick={() => setAutomations(automations.filter(a => a.id !== rule.id))} className="px-2 py-1 pixel-border-sm text-[7px] font-bold uppercase bg-red-900">DEL</button>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2 pixel-border-sm">
                            <div className="text-[6px] text-slate-600 uppercase font-bold">TRIGGERS</div>
                            <div className="text-[7px] text-slate-300 font-bold uppercase">{rule.triggerMemberIds.includes('all') ? 'Everyone' : rule.triggerMemberIds.length + ' Members'}</div>
                        </div>
                        <div className="bg-slate-950 p-2 pixel-border-sm">
                            <div className="text-[6px] text-slate-600 uppercase font-bold">NOTIFIES</div>
                            <div className="text-[7px] text-slate-300 font-bold uppercase">{rule.receiverMemberIds.includes('all') ? 'Everyone' : rule.receiverMemberIds.length + ' Members'}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AutomationView;
