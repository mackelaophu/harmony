import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { MAJOR, MINOR, getExactChordNotes, getChordContext } from '../utils/MusicTheory';

const CustomProgression = ({ onPlay, onStop, isPlaying, currentTempo, audioEngine, setActiveProgressionNotes }) => {
    const [inputStr, setInputStr] = useState('C G Am F');
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('major');
    const [parseError, setParseError] = useState('');

    const handlePlay = () => {
        setParseError('');
        const rawTokens = inputStr.split(/[\s,-]+/).filter(t => t.trim() !== '');
        
        if (rawTokens.length === 0) {
            setParseError('Vui lòng nhập vòng hoà thanh.');
            return;
        }

        // Extremely simple parser: If they input valid absolute chords, play them.
        // If they input Roman Numerals (like I, vi, IV), we translate based on selectedRoot + selectedType
        const parsedChords = rawTokens.map(token => {
            // Check if it's already an absolute chord (starts with C,D,E,F,G,A,B)
            if (/^[A-G](b|#)?(m|maj7|m7|7|dim|sus4|sus2|add9|m7b5|°|°7)?$/i.test(token)) {
                // Ensure capitalization is standardized
                return token.charAt(0).toUpperCase() + token.slice(1);
            }
            
            // It's likely a Roman Numeral
            const numMapMajor = {
                'I': selectedRoot, 'i': `${selectedRoot}m`,
                'ii': getNoteOffset(selectedRoot, 2) + 'm', 'II': getNoteOffset(selectedRoot, 2),
                'iii': getNoteOffset(selectedRoot, 4) + 'm', 'III': getNoteOffset(selectedRoot, 4),
                'IV': getNoteOffset(selectedRoot, 5), 'iv': getNoteOffset(selectedRoot, 5) + 'm',
                'V': getNoteOffset(selectedRoot, 7), 'v': getNoteOffset(selectedRoot, 7) + 'm',
                'vi': getNoteOffset(selectedRoot, 9) + 'm', 'VI': getNoteOffset(selectedRoot, 9),
                'vii°': getNoteOffset(selectedRoot, 11) + 'dim', 'vii': getNoteOffset(selectedRoot, 11) + 'dim'
            };
            const numMapMinor = {
                'i': `${selectedRoot}m`, 'I': selectedRoot,
                'ii°': getNoteOffset(selectedRoot, 2) + 'dim', 'ii': getNoteOffset(selectedRoot, 2) + 'm',
                'III': getNoteOffset(selectedRoot, 3), 'iii': getNoteOffset(selectedRoot, 3) + 'm',
                'iv': getNoteOffset(selectedRoot, 5) + 'm', 'IV': getNoteOffset(selectedRoot, 5),
                'v': getNoteOffset(selectedRoot, 7) + 'm', 'V': getNoteOffset(selectedRoot, 7),
                'VI': getNoteOffset(selectedRoot, 8), 'vi': getNoteOffset(selectedRoot, 8) + 'm',
                'VII': getNoteOffset(selectedRoot, 10), 'vii': getNoteOffset(selectedRoot, 10) + 'dim'
            };

            const mapToUse = selectedType === 'major' ? numMapMajor : numMapMinor;
            
            if (mapToUse[token]) return mapToUse[token];
            
            // Fallback
            return token.charAt(0).toUpperCase() + token.slice(1);
        });

        // Validate that parsed chords are somewhat valid
        let valid = true;
        const getTypeByString = (idString) => {
            if (idString.includes('m7b5')) return 'm7b5';
            if (idString.includes('min7')) return 'min7';
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

        const resolvedContexts = parsedChords.map(c => getChordContext(c, getTypeByString(c)));
        
        onPlay({ name: 'Custom Progression', chords: parsedChords }, resolvedContexts);
    };

    const getNoteOffset = (root, semis) => {
        const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        let isSharp = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'].includes(root);
        let idx = FLAT.indexOf(root);
        if (idx === -1) idx = SHARP.indexOf(root);
        if (idx === -1) return root; 
        
        let targetIdx = (idx + semis) % 12;
        return isSharp ? SHARP[targetIdx] : FLAT[targetIdx];
    };

    return (
        <div className="recording-studio-panel" style={{ marginTop: '16px' }}>
            <div className="panel-header">
                <span className="panel-title">Tự Định Nghĩa Vòng Hoà Thanh</span>
            </div>

            <div style={{ padding: '0px 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <select 
                       value={selectedRoot} 
                       onChange={(e) => setSelectedRoot(e.target.value)}
                       style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                   >
                       {MAJOR.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>

                   <select 
                       value={selectedType} 
                       onChange={(e) => setSelectedType(e.target.value)}
                       style={{ flex: 1.5, padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none', fontSize: '13px' }}
                   >
                       <option value="major">Scale Trưởng</option>
                       <option value="minor">Scale Thứ</option>
                   </select>
                </div>

                <div>
                    <input 
                        type="text" 
                        value={inputStr}
                        onChange={(e) => setInputStr(e.target.value)}
                        placeholder="VD: C G Am F hoặc I V vi IV"
                        style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: '#38bdf8', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', outline: 'none' }}
                    />
                    {parseError && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{parseError}</div>}
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '6px', lineHeight: '1.4' }}>
                        Hỗ trợ nhập trực tiếp Tên Hợp âm (F G Em Am) hoặc Điểm Bậc La Mã (IV V iii vi).
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {isPlaying ? (
                        <button onClick={onStop} style={{ flex: 1, padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            <Square size={14} fill="currentColor" /> Dừng Chơi
                        </button>
                    ) : (
                        <button onClick={handlePlay} style={{ flex: 1, padding: '8px 16px', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            <Play size={14} fill="currentColor" /> Phát Tuỳ Chọn
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomProgression;
