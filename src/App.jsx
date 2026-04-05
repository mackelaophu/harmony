import React, { useState, useEffect, useRef } from 'react';
import { Music, Settings, Info, X, Play, Square, Cable } from 'lucide-react';
import ChordGraph from './components/ChordGraph';
import PianoKeyboard from './components/PianoKeyboard';
import RecordingStudio from './components/RecordingStudio';
import { audioEngine } from './utils/AudioEngine';
import { midiEngine } from './utils/MidiEngine';
import { normalizeNote } from './utils/MusicTheory';
import { RHYTHM_STYLES } from './utils/RhythmLibrary';
import './index.css';

function App() {
  const [selectedChord, setSelectedChord] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
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
             setRecordedNotes(prev => [...prev, note]);
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
    const play = async () => {
      try {
        if (isPlayingRhythm && activeRhythm && selectedChord) {
           await audioEngine.init();
           audioEngine.playRhythmStyle(activeRhythm, selectedChord.notes);
        } else {
           audioEngine.stopRhythm();
        }
      } catch (e) {
        console.error('Tone Transport Error:', e);
      }
    };
    play();
  }, [isPlayingRhythm, activeRhythm, selectedChord]);

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
          <button className="icon-btn">
            <Settings size={18} />
          </button>
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
          onChordSelect={(chord) => setSelectedChord(chord)}
        />
        <ChordGraph onChordSelect={(chord) => setSelectedChord(chord)} />
        
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
          </div>
        )}
      </main>

      {/* Footer / Piano */}
      <footer className="piano-footer">
        <div className="footer-panel" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PianoKeyboard activeChordNotes={selectedChord?.notes || []} activeMidiNotes={activeMidiNotes} onNotePlayed={handleNotePlayed} />
        </div>
      </footer>
    </div>
  );
}

export default App;
