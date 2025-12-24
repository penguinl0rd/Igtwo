
import React, { useState } from 'react';
import { COLOR_PALETTES, PROFILE_ICONS, PIXEL_ICONS } from '../constants';
import { audio } from '../services/audio';
import { FamilyMember } from '../types';

interface Props {
  palette: any;
  setPalette: (p: any) => void;
  me: FamilyMember;
  updateProfile: (name: string, icon: string) => void;
}

const SettingsView: React.FC<Props> = ({ palette, setPalette, me, updateProfile }) => {
  const [tempName, setTempName] = useState(me.name);
  const [selectedIcon, setSelectedIcon] = useState(me.avatarIcon || 'Penguin');

  const handlePaletteChange = (p: any) => {
    audio.playSuccess();
    setPalette(p);
  };

  const handleUpdate = () => {
    updateProfile(tempName, selectedIcon);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 overflow-y-auto bg-slate-950 pb-20">
      <h2 className="text-xl text-indigo-400 font-bold tracking-widest uppercase">Settings</h2>

      {/* Identity Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Your Identity</h3>
        <div className="bg-slate-900/60 p-5 pixel-border-sm space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[8px] text-slate-400 uppercase font-bold">Member Name</label>
            <input 
              type="text" 
              value={tempName}
              onChange={(e) => setTempName(e.target.value.toUpperCase())}
              className="bg-slate-950 border-2 border-slate-800 p-3 text-xs focus:outline-none focus:border-indigo-500 uppercase tracking-widest text-white w-full"
              maxLength={15}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[8px] text-slate-400 uppercase font-bold">Choose Icon</label>
            <div className="grid grid-cols-3 gap-3">
              {PROFILE_ICONS.map(iconKey => (
                <button 
                  key={iconKey}
                  onClick={() => { audio.playSelect(); setSelectedIcon(iconKey); }}
                  className={`p-4 pixel-border-sm flex items-center justify-center transition-all ${selectedIcon === iconKey ? 'bg-indigo-600 scale-105 border-white' : 'bg-slate-950 border-slate-800'}`}
                  style={{ color: selectedIcon === iconKey ? 'white' : 'inherit' }}
                >
                  {PIXEL_ICONS[iconKey] && PIXEL_ICONS[iconKey]()}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 pixel-border-sm text-[10px] font-bold text-white uppercase tracking-widest pixel-button-press"
          >
            Save Profile Update
          </button>
        </div>
      </section>

      {/* Themes Section */}
      <section>
        <h3 className="text-[10px] mb-4 uppercase tracking-widest text-slate-500 font-bold">Atmosphere</h3>
        <div className="grid grid-cols-2 gap-4">
          {COLOR_PALETTES.map(p => (
            <button 
              key={p.name}
              onClick={() => handlePaletteChange(p)}
              className={`p-3 pixel-border-sm flex flex-col gap-2 items-center transition-all ${palette.name === p.name ? 'scale-105 border-white bg-slate-800' : 'bg-slate-950 border-slate-900'}`}
            >
              <div className="flex gap-1">
                <div className="w-4 h-4" style={{ backgroundColor: p.primary }} />
                <div className="w-4 h-4" style={{ backgroundColor: p.secondary }} />
                <div className="w-4 h-4" style={{ backgroundColor: p.accent }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Account Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Configuration</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 pixel-border-sm">
            <span className="text-[10px] font-bold uppercase">Broadcast Pings</span>
            <input type="checkbox" className="w-4 h-4 accent-indigo-500" defaultChecked />
          </div>
          <div className="flex justify-between items-center bg-slate-900/60 p-4 pixel-border-sm">
            <span className="text-[10px] font-bold uppercase">Precise Radar</span>
            <input type="checkbox" className="w-4 h-4 accent-indigo-500" defaultChecked />
          </div>
          <div className="flex justify-between items-center bg-slate-900/60 p-4 pixel-border-sm">
            <span className="text-[10px] font-bold uppercase">Bleeps & Bloops</span>
            <input type="checkbox" className="w-4 h-4 accent-indigo-500" defaultChecked />
          </div>
        </div>
      </section>

      <section className="mt-8 pb-10">
        <button 
          onClick={() => audio.playBeep(220, 0.2, 'sawtooth')}
          className="w-full bg-red-900/40 hover:bg-red-800 p-4 pixel-border-sm text-[10px] text-red-300 font-bold uppercase tracking-widest"
        >
          Exit Current Igloo
        </button>
        <p className="text-center text-[7px] text-slate-700 mt-4 uppercase tracking-[0.2em]">
          Version 1.1.0-STABLE • IG00-ENGINE
        </p>
      </section>
    </div>
  );
};

export default SettingsView;
