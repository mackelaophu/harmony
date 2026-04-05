import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '../utils/AudioEngine';
import { normalizeNote } from '../utils/MusicTheory';

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const PianoKeyboard = ({ activeChordNotes = [], onNotePlayed, activeMidiNotes = [] }) => {
  const [playingNotes, setPlayingNotes] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (activeMidiNotes.length > 0 && scrollContainerRef.current) {
        const firstNote = activeMidiNotes[0];
        const keyElement = scrollContainerRef.current.querySelector(`[data-note="${firstNote}"]`);
        if (keyElement) {
            const containerWidth = scrollContainerRef.current.clientWidth;
            const scrollLeft = keyElement.offsetLeft - (containerWidth / 2) + 20;
            scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
  }, [activeMidiNotes]);

  // Initial scroll to C2 on load
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        const c2Element = scrollContainerRef.current.querySelector('[data-note="C2"]');
        if (c2Element) {
            scrollContainerRef.current.scrollTo({ left: c2Element.offsetLeft, behavior: 'auto' });
        }
      }, 100); // small delay to ensure DOM is fully rendered
    }
  }, []);

  const activeSpecificNotes = useMemo(() => {
    if (!activeChordNotes || activeChordNotes.length === 0) return [];
    const notes = [];
    const rootNorm = normalizeNote(activeChordNotes[0]);
    let currentOctave = 4; // Default starting octave for voicings
    let prevIndex = PITCH_CLASSES.indexOf(rootNorm);
    
    activeChordNotes.forEach((n) => {
        const norm = normalizeNote(n);
        const idx = PITCH_CLASSES.indexOf(norm);
        if (idx < prevIndex) {
            currentOctave++;
        }
        notes.push(`${norm}${currentOctave}`);
        prevIndex = idx;
    });
    return notes;
  }, [activeChordNotes]);

  const keys = useMemo(() => {
      const arr = [];
      let whiteCount = 0;
      for (let midi = 21; midi <= 108; midi++) {
          const pitch = PITCH_CLASSES[midi % 12];
          const octave = Math.floor(midi / 12) - 1;
          const isBlack = pitch.includes('#');
          const noteStr = `${pitch}${octave}`;
          
          let whiteIdx = isBlack ? whiteCount - 1 : whiteCount;
          if (!isBlack) whiteCount++;
          
          arr.push({ midi, note: noteStr, pitch, octave, isBlack, whiteIdx });
      }
      return arr;
  }, []);

  const handleKeyClick = async (note) => {
    await audioEngine.init();
    audioEngine.playNote(note);
    setPlayingNotes([note]);
    if (onNotePlayed) onNotePlayed(note);
    setTimeout(() => setPlayingNotes([]), 300);
  };

  return (
    <div className="piano-keyboard-wrapper" ref={scrollContainerRef}>
      <div style={{ position: 'relative', display: 'flex' }}>
        {/* White Keys */}
        {keys.map((key, i) => {
          const isPlaying = playingNotes.includes(key.note) || activeMidiNotes.includes(key.note);
          const isChordNote = activeSpecificNotes.includes(key.note);
          const isActive = isPlaying || isChordNote;
          if (key.isBlack) return null;

          return (
            <div
              key={key.note}
              data-note={key.note}
              className={`white-key ${isActive ? 'active' : ''}`}
              onMouseDown={() => handleKeyClick(key.note)}
            >
              {key.note.startsWith('C') && (
                <span className="key-label">
                  {key.note}
                </span>
              )}
            </div>
          );
        })}

        {/* Black keys overlay */}
        <div className="black-keys-overlay">
          <div style={{ position: 'relative', width: '100%', height: '0' }}>
          {keys.map((key, i) => {
            if (!key.isBlack) return null;

            const left = key.whiteIdx * 40 + 27; // 40px width white key, shifted right
            
            const isPlaying = playingNotes.includes(key.note) || activeMidiNotes.includes(key.note);
            const isChordNote = activeSpecificNotes.includes(key.note);
            const isActive = isPlaying || isChordNote;

            return (
              <div
                key={key.note}
                data-note={key.note}
                className={`black-key ${isActive ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKeyClick(key.note);
                }}
                style={{ left: `${left}px` }}
              />
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoKeyboard;
