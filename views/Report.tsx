
import React from 'react';
import { FamilyMember, BroadcastMessage } from '../types';
import { audio } from '../services/audio';

interface Props {
  members: FamilyMember[];
  reports: BroadcastMessage[];
  addBroadcast: (type: BroadcastMessage['type']) => void;
  palette: any;
}

const ReportView: React.FC<Props> = ({ members, reports, addBroadcast, palette }) => {
  const handleBroadcast = (type: BroadcastMessage['type']) => {
    audio.playSuccess();
    addBroadcast(type);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto bg-slate-950 pb-24">
      <div className="text-center space-y-1">
        <h2 className="text-xl text-indigo-400 uppercase tracking-widest font-bold">Safe-Sync</h2>
        <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em]">Live Packets & Manual Overrides</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => handleBroadcast('location')}
          className="bg-indigo-900/40 border-l-4 border-indigo-400 p-5 pixel-border-sm pixel-button-press text-left"
        >
          <div className="text-xs font-bold text-white uppercase tracking-widest">SEND LIVE PING</div>
          <div className="text-[7px] text-slate-500 uppercase font-bold mt-1">Broadcast Coordinates to Family</div>
        </button>

        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleBroadcast('on_road')} className="bg-slate-900 border-l-4 border-amber-500 p-4 pixel-border-sm">
                <div className="text-[9px] font-bold text-white uppercase tracking-widest">ON ROAD</div>
            </button>
            <button onClick={() => handleBroadcast('arrived')} className="bg-slate-900 border-l-4 border-emerald-500 p-4 pixel-border-sm">
                <div className="text-[9px] font-bold text-white uppercase tracking-widest">ARRIVED</div>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 mt-4">
        <h3 className="text-[10px] uppercase text-slate-500 border-b-2 border-slate-900 pb-2 font-bold tracking-widest">Activity Feed</h3>
        <div className="space-y-3">
            {reports.length === 0 ? (
                <div className="py-10 text-center opacity-20 text-[10px] uppercase font-bold">No active pings</div>
            ) : (
                reports.map(report => (
                    <div key={report.id} className={`p-4 pixel-border-sm ${report.type === 'automation' ? 'bg-indigo-900/20 border-r-4 border-indigo-600' : 'bg-slate-900/40 border-r-2 border-slate-800'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-bold text-white uppercase">{report.senderName}</span>
                            <span className="text-[8px] text-slate-600 font-mono">{report.timestamp}</span>
                        </div>
                        <div className={`text-[8px] font-bold uppercase tracking-tighter mb-2 ${report.type === 'automation' ? 'text-indigo-400' : 'text-slate-400'}`}>
                           {report.type === 'automation' ? '🤖 BUBBLE TRIGGERED' : `PACKET: ${report.type}`}
                        </div>
                        {(report as any).message && (
                            <div className="text-[9px] text-white font-bold mb-2 uppercase leading-tight">{(report as any).message}</div>
                        )}
                        {report.mapLink && (
                            <a 
                                href={report.mapLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="block w-full bg-slate-950 p-2 pixel-border-sm text-[8px] text-center text-blue-400 font-bold uppercase hover:bg-indigo-900 transition-colors"
                            >
                                View Location →
                            </a>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
