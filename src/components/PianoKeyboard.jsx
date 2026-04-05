import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '../utils/AudioEngine';
import { normalizeNote } from '../utils/MusicTheory';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const PianoKeyboard = ({ activeChordNotes = [] }) => {
  const [playingNotes, setPlayingNotes] = useState([]);

  const activeSpecificNotes = useMemo(() => {
    if (!activeChordNotes || activeChordNotes.length === 0) return [];
    const notes = [];
    const rootNorm = normalizeNote(activeChordNotes[0]);
    let currentOctave = 4; // Default starting octave for voicings
    let prevIndex = NOTES.indexOf(rootNorm);
    
    activeChordNotes.forEach((n) => {
        const norm = normalizeNote(n);
        const idx = NOTES.indexOf(norm);
        if (idx < prevIndex) {
            currentOctave++;
        }
        notes.push(`${norm}${currentOctave}`);
        prevIndex = idx;
    });
    return notes;
  }, [activeChordNotes]);

  const keys = [];
  for (let octave = 3; octave <= 5; octave++) {
    NOTES.forEach((note) => {
      keys.push({ note: `${note}${octave}`, isBlack: note.includes('#') });
    });
  }

  const handleKeyClick = async (note) => {
    await audioEngine.init();
    audioEngine.playNote(note);
    setPlayingNotes([note]);
    setTimeout(() => setPlayingNotes([]), 300);
  };

  return (
    <div className="piano-keyboard-wrapper">
      {/* White Keys */}
      {keys.map((key, i) => {
        const isPlaying = playingNotes.includes(key.note);
        const isChordNote = activeSpecificNotes.includes(key.note);
        const isActive = isPlaying || isChordNote;
        if (key.isBlack) return null;

        return (
          <div
            key={key.note}
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

          const octaveIdx = Math.floor(i / 12);
          const noteIdx = i % 12; 
          const whiteKeyOffsetMap = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 };
          const whiteKeyIdx = whiteKeyOffsetMap[noteIdx];
          
          const left = (octaveIdx * 7 + whiteKeyIdx) * 40 - 13;
          
          const isPlaying = playingNotes.includes(key.note);
          const isChordNote = activeSpecificNotes.includes(key.note);
          const isActive = isPlaying || isChordNote;

          return (
            <div
              key={key.note}
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
  );
};

export default PianoKeyboard;
