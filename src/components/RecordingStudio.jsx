import React, { useState, useEffect } from 'react';
import { Mic, Pause, Play, Square } from 'lucide-react';
import { inferChordsFromNotes } from '../utils/MusicTheory';

const TYPE_COLORS = {
  major: 'var(--color-major)',
  minor: 'var(--color-minor)',
  dom7: 'var(--color-dom7)',
  dim: 'var(--color-dim)',
  maj7: 'var(--color-maj7)',
  min7: 'var(--color-min7)',
  sus4: 'var(--color-sus4)',
  sus2: 'var(--color-sus2)',
  add9: 'var(--color-add9)',
  dim7: 'var(--color-dim7)',
  m7b5: 'var(--color-m7b5)'
};

const RecordingStudio = ({ recordedNotes, isRecording, isPaused, onStart, onPause, onResume, onStop, onChordSelect }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (recordedNotes.length > 0) {
       setSuggestions(inferChordsFromNotes(recordedNotes));
    } else {
       setSuggestions([]);
    }
  }, [recordedNotes]);

  return (
    <div className="recording-studio-panel">
       <div className="panel-header">
           <span className="panel-title">Phòng Thu (Studio)</span>
           {isRecording && !isPaused && <div className="recording-indicator" />}
       </div>

       <div className="controls-row">
           {!isRecording ? (
             <button className="control-btn record-btn" onClick={onStart}>
               <Mic size={16} /> Record
             </button>
           ) : (
             <>
               {isPaused ? (
                 <button className="control-btn resume-btn" onClick={onResume}>
                   <Play size={16} /> Resume
                 </button>
               ) : (
                 <button className="control-btn pause-btn" onClick={onPause}>
                   <Pause size={16} /> Pause
                 </button>
               )}
               <button className="control-btn stop-btn" onClick={onStop}>
                 <Square size={16} /> Stop / Clear
               </button>
             </>
           )}
       </div>

       <div className="notes-display">
           <div className="notes-label">Các nốt đã đánh:</div>
           <div className="notes-list">
              {recordedNotes.length > 0 ? recordedNotes.join(' - ') : <span className="empty-text">Chưa có nốt nào...</span>}
           </div>
       </div>

       <div className="suggestions-area">
           <div className="suggestions-label">Gợi ý Hợp âm Phù hợp:</div>
           {suggestions.length > 0 ? (
               <div className="suggestions-list">
                   {suggestions.map((s, idx) => {
                       // Normalize score relative to perfect match (score=2.5) for display, capped at 100%
                       let pct = Math.round((s.score / 2.5) * 100);
                       if (pct > 100) pct = 100;
                       
                       if (!s || !s.chord) return null;
                       return (
                           <div key={idx} className="suggestion-item" onClick={() => onChordSelect(s.chord)} style={{ borderLeftColor: TYPE_COLORS[s.chord.type] }}>
                               <div className="chord-name" style={{ color: TYPE_COLORS[s.chord.type] }}>{s.chord.id}</div>
                               <div className="chord-meta">
                                  <span className="match-score">Trùng khớp: {pct}%</span>
                                  <span className="chord-type">{s.chord.type}</span>
                               </div>
                           </div>
                       );
                   })}
               </div>
           ) : (
               <div className="empty-suggestions">
                   ▶ Ấn Record & đánh vài nốt trên Piano để máy AI tự phân tích.
               </div>
           )}
       </div>
    </div>
  );
};

export default RecordingStudio;
