
import React, { useState, useMemo } from 'react';
import { FamilyState, FamilyMember } from '../types';
import { audio } from '../services/audio';
import { PIXEL_ICONS } from '../constants';

interface Props {
  family: FamilyState;
  onJoin: (id: string) => void;
  onCreate: (id: string) => void;
  palette: any;
}

const SNOW_WORDS = ['SNOWY', 'ARCTIC', 'PENGUIN', 'FROSTY', 'GLACIAL', 'BLIZZARD', 'CHILLY', 'TUNDRA', 'ICE', 'POLAR'];

const FamilyView: React.FC<Props> = ({ family, onJoin, onCreate, palette }) => {
  const [joinCode, setJoinCode] = useState('');
  const [showQR, setShowQR] = useState(false);

  const generateCode = () => {
    const word = SNOW_WORDS[Math.floor(Math.random() * SNOW_WORDS.length)];
    const num = Math.floor(1000 + Math.random() * 8999);
    return `${word}-${num}`;
  };

  const handleCreate = () => {
    const newId = generateCode();
    onCreate(newId);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length >= 4) {
      onJoin(joinCode.toUpperCase());
      setJoinCode('');
    }
  };

  const qrPixels = useMemo(() => {
    const seed = family.familyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 64 }).map((_, i) => (Math.sin(seed + i) > 0));
  }, [family.familyId]);

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto bg-slate-950">
      <section>
        <div className="flex justify-between items-end mb-4 border-b-2 border-slate-900 pb-2">
            <h2 className="text-xl text-indigo-400 uppercase tracking-widest font-bold">Igloo Members</h2>
            <span className="text-[9px] text-slate-500 font-bold">{family.members.length} SYNCED</span>
        </div>
        
        <div className="grid gap-3">
          {family.members.map(member => {
            const Icon = PIXEL_ICONS[member.avatarIcon || 'Penguin'] || PIXEL_ICONS.Penguin;
            return (
              <div key={member.id} className="bg-slate-900/40 p-4 pixel-border-sm flex items-center justify-between border-l-4" style={{ borderLeftColor: member.avatarColor }}>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 pixel-border-sm flex items-center justify-center bg-slate-950 shadow-inner"
                    style={{ color: member.avatarColor }}
                  >
                    <Icon />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white">{member.name}</div>
                    <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">{member.role} • {member.status}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-2 space-y-4">
          <div className="bg-slate-900/60 p-5 pixel-border-sm border-t-4 border-indigo-600">
            <h3 className="text-[10px] mb-4 font-bold uppercase text-slate-400 tracking-[0.2em] text-center">Connection Hub</h3>
            
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => { audio.playSelect(); setShowQR(!showQR); }}
                        className="w-full bg-slate-800 hover:bg-slate-700 p-3 pixel-border-sm text-[10px] text-white font-bold uppercase tracking-widest transition-all"
                    >
                        {showQR ? 'Hide Invite QR' : 'Show Invite QR'}
                    </button>
                    
                    {showQR && (
                        <div className="flex flex-col items-center gap-4 p-5 bg-white pixel-border-sm mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="w-32 h-32 bg-slate-950 grid grid-cols-8 p-1">
                                {qrPixels.map((on, i) => (
                                    <div key={i} className={`w-4 h-4 ${on ? 'bg-white' : 'bg-transparent'}`} />
                                ))}
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-tighter">SCAN TO JOIN IGLOO</span>
                                <span className="text-lg text-indigo-600 font-bold tracking-widest bg-indigo-50 px-3 py-1 pixel-border-sm">{family.familyId}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 py-2 opacity-50">
                    <div className="h-[1px] bg-slate-700 flex-1" />
                    <span className="text-[8px] font-bold text-slate-500">OR</span>
                    <div className="h-[1px] bg-slate-700 flex-1" />
                </div>

                <form onSubmit={handleJoin} className="flex flex-col gap-3">
                    <input 
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="ENTER CODE (WORD-1234)"
                        className="w-full bg-slate-950 border-2 border-slate-800 p-3 text-xs focus:outline-none focus:border-indigo-500 uppercase tracking-widest text-white placeholder:text-slate-800"
                        maxLength={15}
                    />
                    <div className="grid grid-cols-2 gap-3">
                         <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 p-3 pixel-border-sm text-[10px] font-bold pixel-button-press uppercase tracking-widest text-white shadow-lg"
                        >
                            Join
                        </button>
                        <button 
                            type="button"
                            onClick={handleCreate}
                            className="bg-slate-800 hover:bg-slate-700 p-3 pixel-border-sm text-[10px] font-bold pixel-button-press uppercase tracking-widest text-indigo-300"
                        >
                            New Igloo
                        </button>
                    </div>
                </form>
            </div>
          </div>
      </section>
      
      <div className="text-center mt-auto py-4 opacity-20">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Secure Tundra-Tunnel Established</p>
      </div>
    </div>
  );
};

export default FamilyView;
