import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Music, Settings, Info, X, Play, Square, Cable } from 'lucide-react';
import ChordGraph from './components/ChordGraph';
import PianoKeyboard from './components/PianoKeyboard';
import RecordingStudio from './components/RecordingStudio';
import { audioEngine } from './utils/AudioEngine';
import { midiEngine } from './utils/MidiEngine';
import { normalizeNote, getPopularProgressions, getChordContext } from './utils/MusicTheory';
import { RHYTHM_STYLES } from './utils/RhythmLibrary';
import './index.css';

function App() {
  const [selectedChord, setSelectedChord] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExtendedChords, setShowExtendedChords] = useState(true);
  const [activeRhythm, setActiveRhythm] = useState('');
  const [isPlayingRhythm, setIsPlayingRhythm] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState([]);

  // MIDI STATES
  const [activeMidiNotes, setActiveMidiNotes] = useState([]);
  const [midiStatus, setMidiStatus] = useState("Đang chờ MIDI...");

  const isRecordingRef = useRef(isRecording);
  const isPausedRef = useRef(isPaused);
  
  // Progressions
  const [playingProgressionIdx, setPlayingProgressionIdx] = useState(null);
  const [activeProgressionNotes, setActiveProgressionNotes] = useState(null);
  const progressionTimeoutRef = useRef(null);

  const progressions = useMemo(() => {
     if (!selectedChord) return [];
     return getPopularProgressions(selectedChord.id, selectedChord.type);
  }, [selectedChord]);

  const handlePlayProgression = async (progression, idx) => {
      if (playingProgressionIdx === idx) {
          audioEngine.stopRhythm();
          setPlayingProgressionIdx(null);
          setActiveProgressionNotes(null);
          if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
          return;
      }
      setPlayingProgressionIdx(idx);
      if (progressionTimeoutRef.current) clearTimeout(progressionTimeoutRef.current);
      
      try {
         await audioEngine.init();
         const getTypeByString = (idString) => {
            if (idString.includes('m7b5')) return 'm7b5';
            if (idString.includes('m7')) return 'min7';
            if (idString.includes('maj7')) return 'maj7';
            if (idString.includes('sus4')) return 'sus4';
            if (idString.includes('sus2')) return 'sus2';
            if (idString.includes('add9')) return 'add9';
            if (idString.includes('°7')) return 'dim7';
            if (idString.includes('°')) return 'dim';
            if (idString.includes('7')) return 'dom7';
            if (idString.includes('m')) return 'minor';
            return 'major';
         };
         const contexts = progression.chords.map(c => getChordContext(c, getTypeByString(c)));
         setIsPlayingRhythm(false);
         audioEngine.playProgressionSequence(contexts, activeRhythm, setActiveProgressionNotes);
         
         const styleDef = activeRhythm ? RHYTHM_STYLES[activeRhythm] : null;
         const bpm = styleDef ? styleDef.defaultBpm : 100;
         const beatsPerBar = styleDef ? styleDef.timeSignature : 4;
         const msPerMeasure = (60 / bpm) * beatsPerBar * 1000;
         const totalMs = progression.chords.length * msPerMeasure;

         progressionTimeoutRef.current = setTimeout(() => {
             setPlayingProgressionIdx(null);
             setActiveProgressionNotes(null);
         }, totalMs + 500); // 500ms safety tail
      } catch (e) {
         console.error(e);
         setPlayingProgressionIdx(null);
         setActiveProgressionNotes(null);
      }
  };

  useEffect(() => {
    isRecordingRef.current = isRecording;
    isPausedRef.current = isPaused;
  }, [isRecording, isPaused]);

  // Handle Note from Mouse (Virtual Piano)
  const handleNotePlayed = (note) => {
    if (isRecording && !isPaused) {
      setRecordedNotes(prev => [...prev, note]);
    }
  };

  // MIDI Initialization
  useEffect(() => {
    const handleMidiOn = (note, velocity) => {
        setActiveMidiNotes(prev => {
            if (!prev.includes(note)) return [...prev, note];
            return prev;
        });
        
        audioEngine.init().then(() => {
             audioEngine.playNote(note, '2n', velocity);
        }).catch(console.error);

        if (isRecordingRef.current && !isPausedRef.current) {
             setRecordedNotes(prev => prev.concat(note));
        }
    };
    
    const handleMidiOff = (note) => {
        setActiveMidiNotes(prev => prev.filter(n => n !== note));
    };

    midiEngine.init(
        (device, status) => setMidiStatus(status),
        handleMidiOn,
        handleMidiOff
    );
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordedNotes([]);
  };

  useEffect(() => {
    let isActive = true;
    const play = async () => {
      try {
        if (isPlayingRhythm && activeRhythm && selectedChord) {
           await audioEngine.init();
           if (isActive) {
               audioEngine.playRhythmStyle(activeRhythm, selectedChord.notes);
           }
        } else {
           if (playingProgressionIdx === null) {
               audioEngine.stopRhythm();
           }
        }
      } catch (e) {
        console.error('Tone Transport Error:', e);
      }
    };
    play();
    return () => { isActive = false; };
  }, [isPlayingRhythm, activeRhythm, selectedChord, playingProgressionIdx]);

  return (
    <div className="app-container">
      {/* Background Glows */}
      <div className="bg-blur" style={{ top: '10%', left: '10%', backgroundColor: 'var(--color-major)' }} />
      <div className="bg-blur" style={{ bottom: '20%', right: '10%', backgroundColor: 'var(--color-minor)' }} />

      {/* Header */}
      <header className="glass-header">
        <div className="logo-area">
          <div className="logo-icon">
            <Music size={24} />
          </div>
          <div className="logo-text">
            <h1>Harmony <span style={{ color: '#38bdf8', fontWeight: 300 }}>Network</span></h1>
            <p className="logo-subtitle">Mạng lưới hoà âm cao cấp</p>
          </div>
        </div>

        <div className="nav-actions">
          <div className="midi-status" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.1)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
             <Cable size={14} />
             {midiStatus}
          </div>
          <button className="icon-btn" onClick={() => setShowInfo(!showInfo)}>
            <Info size={18} />
          </button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={18} />
            </button>
            {showSettings && (
              <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: 'rgba(17, 24, 39, 0.95)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', zIndex: 200, width: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', color: '#f3f4f6' }}>
                      <input type="checkbox" checked={showExtendedChords} onChange={(e) => setShowExtendedChords(e.target.checked)} style={{ accentColor: '#38bdf8', transform: 'scale(1.2)' }} />
                      Hiển thị Hợp âm Nâng cao
                  </label>
              </div>
            )}
          </div>
          <button className="premium-badge">
            Premium
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <RecordingStudio 
          recordedNotes={recordedNotes}
          isRecording={isRecording}
          isPaused={isPaused}
          onStart={handleStartRecording}
          onPause={() => setIsPaused(true)}
          onResume={() => setIsPaused(false)}
          onStop={() => { setIsRecording(false); setIsPaused(false); setRecordedNotes([]); }}
          onChordSelect={(chord) => {
             setSelectedChord(chord);
             if (chord && chord.notes) {
                 audioEngine.init().then(() => {
                     const voicing = audioEngine.setPlaybackVoicing(chord.notes);
                     if (voicing && !isPlayingRhythm && playingProgressionIdx === null) {
                         audioEngine.playChord([voicing.bass, ...voicing.chord], '1m', 0.85);
                     }
                 });
             }
          }}
        />
        <ChordGraph 
          onChordSelect={(chord) => {
             setSelectedChord(chord);
             if (chord && chord.notes) {
                 audioEngine.init().then(() => {
                     const voicing = audioEngine.setPlaybackVoicing(chord.notes);
                     if (voicing && !isPlayingRhythm && playingProgressionIdx === null) {
                         audioEngine.playChord([voicing.bass, ...voicing.chord], '1m', 0.85);
                     }
                 });
             }
          }} 
          showExtended={showExtendedChords} 
        />
        
        {/* Chord Info Panel */}
        {selectedChord && (
          <div className="chord-info-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chord Detail</span>
              <button onClick={() => setSelectedChord(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px' }}>
                <X size={14} />
              </button>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>{selectedChord.id}</h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize', marginBottom: '1.5rem' }}>{selectedChord.type}</p>
            
            <div className="chord-details">
              <div className="detail-item">
                <span className="detail-label">Cấu tạo nốt:</span>
                <span className="detail-value highlight">{selectedChord.notes.join(' - ')}</span>
              </div>

              {selectedChord.details?.key && (
                <div className="func-group">
                  <h4>Chức năng trong giọng {selectedChord.details.key}:</h4>
                  <div className="func-row">
                    <span className="func-label">Tonic (Ổn định):</span>
                    <span className="func-chords">{selectedChord.details.tonic.join(', ')}</span>
                  </div>
                  <div className="func-row">
                    <span className="func-label">Subdominant:</span>
                    <span className="func-chords">{selectedChord.details.subdominant.join(', ')}</span>
                  </div>
                  <div className="func-row">
                    <span className="func-label">Dominant (Căng thẳng):</span>
                    <span className="func-chords">{selectedChord.details.dominant.join(', ')}</span>
                  </div>
                </div>
              )}

              {selectedChord.details?.role && (
                <div className="func-group">
                  <h4>{selectedChord.details.role}</h4>
                  <div className="func-guidance">{selectedChord.details.guidance}</div>
                </div>
              )}
            </div>
              
            <div className="rhythm-player" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>Demo Điệu Nhạc Đệm (Rhythms)</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={activeRhythm} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveRhythm(val);
                    if (val) {
                      audioEngine.init().then(() => setIsPlayingRhythm(true)).catch(console.error);
                    } else {
                      setIsPlayingRhythm(false);
                    }
                  }}
                  style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="">Chọn điệu / Chọn nhịp...</option>
                  {Object.values(RHYTHM_STYLES).map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
                
                {isPlayingRhythm ? (
                   <button onClick={() => setIsPlayingRhythm(false)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                     <Square size={14} fill="currentColor" />
                   </button>
                ) : (
                   <button onClick={() => { 
                      if(activeRhythm) {
                         audioEngine.init().then(() => setIsPlayingRhythm(true)).catch(console.error);
                      } 
                   }} style={{ padding: '8px 16px', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: activeRhythm ? 1 : 0.5 }}>
                     <Play size={14} fill="currentColor" />
                   </button>
                )}
              </div>
            </div>
            
            {progressions.length > 0 && (
              <div className="progressions-panel" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Gợi ý Vòng hoà thanh</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {progressions.map((p, idx) => (
                     <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>{p.name.split(' (')[0]}</span>
                            <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>{p.chords.join(' → ')}</span>
                         </div>
                         <button 
                            onClick={() => handlePlayProgression(p, idx)}
                            style={{ padding: '6px 12px', backgroundColor: playingProgressionIdx === idx ? '#ef4444' : '#38bdf8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {playingProgressionIdx === idx ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                            {playingProgressionIdx === idx ? 'Dừng' : 'Chơi'}
                         </button>
                     </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer / Piano */}
      <footer className="piano-footer">
        <div className="footer-panel" style={{ width: '100%', maxWidth: '100vw', minWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
          <PianoKeyboard activeChordNotes={activeProgressionNotes || selectedChord?.notes || []} activeMidiNotes={activeMidiNotes} onNotePlayed={handleNotePlayed} />
        </div>
      </footer>
    </div>
  );
}

export default App;
