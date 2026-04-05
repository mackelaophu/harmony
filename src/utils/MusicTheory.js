// src/utils/MusicTheory.js

export const MAJOR = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const MINOR = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
export const DOM_MAJOR = ['G7', 'D7', 'A7', 'E7', 'B7', 'F#7', 'Db7', 'Ab7', 'Eb7', 'Bb7', 'F7', 'C7'];
export const DOM_MINOR = ['E7', 'B7', 'F#7', 'C#7', 'G#7', 'D#7', 'Bb7', 'F7', 'C7', 'G7', 'D7', 'A7'];
export const DIMINISHED = ['B°', 'F#°', 'C#°', 'G#°', 'D#°', 'A#°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];
export const MAJ7 = ['Cmaj7', 'Gmaj7', 'Dmaj7', 'Amaj7', 'Emaj7', 'Bmaj7', 'Gbmaj7', 'Dbmaj7', 'Abmaj7', 'Ebmaj7', 'Bbmaj7', 'Fmaj7'];
export const MIN7 = ['Am7', 'Em7', 'Bm7', 'F#m7', 'C#m7', 'G#m7', 'Ebm7', 'Bbm7', 'Fm7', 'Cm7', 'Gm7', 'Dm7'];
export const SUS4 = ['Csus4', 'Gsus4', 'Dsus4', 'Asus4', 'Esus4', 'Bsus4', 'Gbsus4', 'Dbsus4', 'Absus4', 'Ebsus4', 'Bbsus4', 'Fsus4'];
export const SUS2 = ['Csus2', 'Gsus2', 'Dsus2', 'Asus2', 'Esus2', 'Bsus2', 'Gbsus2', 'Dbsus2', 'Absus2', 'Ebsus2', 'Bbsus2', 'Fsus2'];
export const ADD9 = ['Cadd9', 'Gadd9', 'Dadd9', 'Aadd9', 'Eadd9', 'Badd9', 'Gbadd9', 'Dbadd9', 'Abadd9', 'Ebadd9', 'Bbadd9', 'Fadd9'];
export const DIM7 = ['B°7', 'F#°7', 'C#°7', 'G#°7', 'D#°7', 'A#°7', 'F°7', 'C°7', 'G°7', 'D°7', 'A°7', 'E°7'];
export const M7B5 = ['Bm7b5', 'F#m7b5', 'C#m7b5', 'G#m7b5', 'D#m7b5', 'A#m7b5', 'Fm7b5', 'Cm7b5', 'Gm7b5', 'Dm7b5', 'Am7b5', 'Em7b5'];

const ENHARMONIC_MAP = {
  'C#': 'Db',
  'D#': 'Eb',
  'E#': 'F',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  'B#': 'C',
  'Cb': 'B',
  'Fb': 'E'
};

const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const normalizeNote = (n) => {
  return ENHARMONIC_MAP[n] || n;
};

const getNoteStringOffset = (root, semis) => {
  const norm = normalizeNote(root);
  let idx = NOTES_FLAT.indexOf(norm);
  if (idx === -1) idx = NOTES_SHARP.indexOf(norm);
  if (idx === -1) return root; 
  
  let targetIdx = (idx + semis) % 12;
  const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  if (sharpKeys.includes(norm)) {
      return NOTES_SHARP[targetIdx];
  }
  return NOTES_FLAT[targetIdx];
};

export const getExactChordNotes = (id, type) => {
  let root = id.replace(/m7b5|maj7|sus4|sus2|add9|m7|°7|°|m|7/g, '');
  
  if (type === 'major') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7)];
  if (type === 'minor') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 7)];
  if (type === 'dom7') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7), getNoteStringOffset(root, 10)];
  if (type === 'dim') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 6)];
  if (type === 'maj7') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7), getNoteStringOffset(root, 11)];
  if (type === 'min7') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 7), getNoteStringOffset(root, 10)];
  if (type === 'sus4') return [root, getNoteStringOffset(root, 5), getNoteStringOffset(root, 7)];
  if (type === 'sus2') return [root, getNoteStringOffset(root, 2), getNoteStringOffset(root, 7)];
  if (type === 'add9') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7), getNoteStringOffset(root, 2)];
  if (type === 'dim7') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 6), getNoteStringOffset(root, 9)];
  if (type === 'm7b5') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 6), getNoteStringOffset(root, 10)];
  
  return [root];
};

export const getFunctionalGroups = (idx, type) => {
  if (type === 'major') {
      return {
          key: MAJOR[idx] + ' Major',
          tonic: [MAJOR[idx], MINOR[idx], MINOR[(idx+1)%12]],
          subdominant: [MINOR[(idx+11)%12], MAJOR[(idx+11)%12]],
          dominant: [MAJOR[(idx+1)%12], DIMINISHED[idx]]
      };
  }
  if (type === 'minor') {
      return {
          key: MINOR[idx] + ' Minor',
          tonic: [MINOR[idx], MAJOR[idx], MAJOR[(idx+11)%12]],
          subdominant: [MINOR[(idx+11)%12], DIMINISHED[idx]],
          dominant: [DOM_MINOR[idx], DIMINISHED[(idx+3)%12]]
      };
  }
  return null;
}

export const getChordContext = (id, type) => {
  const notes = getExactChordNotes(id, type);
  let details = null;
  
  if (type === 'major') {
      const idx = MAJOR.indexOf(id);
      if (idx !== -1) details = getFunctionalGroups(idx, type);
  } else if (type === 'minor') {
      const idx = MINOR.indexOf(id);
      if (idx !== -1) details = getFunctionalGroups(idx, type);
  } else if (type === 'dom7') {
      const majIdx = DOM_MAJOR.indexOf(id);
      const minIdx = DOM_MINOR.indexOf(id);
      let targets = [];
      if (majIdx !== -1) targets.push(MAJOR[majIdx]);
      if (minIdx !== -1 && !targets.includes(MINOR[minIdx])) targets.push(MINOR[minIdx]);
      details = {
          role: 'Hợp âm Át (Dominant)',
          guidance: targets.length > 0 ? `Dẫn về chủ âm: ${targets.join(' hoặc ')}` : ''
      };
  } else if (type === 'dim') {
      const idx = DIMINISHED.indexOf(id);
      const targets = idx !== -1 ? [MAJOR[idx], MINOR[idx]] : [];
      details = {
          role: 'Hợp âm Dẫn (Diminished)',
          guidance: targets.length > 0 ? `Dẫn về chủ âm: ${targets.join(' hoặc ')}` : ''
      };
  } else if (type === 'maj7') {
      details = { role: 'Hợp âm Major 7th (Jazz/Pop)', guidance: 'Mang sắc thái bay bổng, mộng mơ.' };
  } else if (type === 'min7') {
      details = { role: 'Hợp âm Minor 7th', guidance: 'Dịu và buồn hơn hợp âm thứ thông thường.' };
  } else if (type === 'sus4' || type === 'sus2') {
      details = { role: 'Hợp âm Treo (Suspended)', guidance: 'Tạo cảm giác lơ lửng, thường bắt buộc phải giải quyết về hợp âm trưởng/thứ.' };
  } else if (type === 'add9') {
      details = { role: 'Hợp âm Add 9', guidance: 'Mang màu sắc rực rỡ, rộng mở.' };
  } else if (type === 'dim7') {
      details = { role: 'Hợp âm Fully Diminished 7th', guidance: 'Cực kỳ căng thẳng, sử dụng làm cầu nối (Passing chord).' };
  } else if (type === 'm7b5') {
      details = { role: 'Hợp âm Half-Diminished', guidance: 'Đặc trưng trong progression ii-V-I của nhạc Jazz.' };
  }
  
  return { id, type, notes, details };
};

export const inferChordsFromNotes = (playedNotes) => {
  if (!playedNotes || playedNotes.length === 0) return [];
  
  const uniquePitches = [...new Set(playedNotes.map(n => normalizeNote(n.replace(/[0-9]/g, ''))))];
  if (uniquePitches.length === 0) return [];

  const results = [];
  const checkChord = (id, type) => {
      const chordContext = getChordContext(id, type);
      const chordNotes = chordContext.notes.map(normalizeNote);
      
      let matchCount = 0;
      uniquePitches.forEach(p => {
           if (chordNotes.includes(p)) matchCount++;
      });
      
      const coverage = matchCount / chordNotes.length;
      const fit = matchCount / uniquePitches.length;
      
      if (matchCount > 0) {
          results.push({
              chord: chordContext,
              score: coverage * 1.5 + fit * 1.0,
              matches: matchCount
          });
      }
  };

  for (let i = 0; i < 12; i++) {
      checkChord(MAJOR[i], 'major');
      checkChord(MINOR[i], 'minor');
      checkChord(DOM_MAJOR[i], 'dom7');
      checkChord(DIMINISHED[i], 'dim');
      checkChord(MAJ7[i], 'maj7');
      checkChord(MIN7[i], 'min7');
      checkChord(SUS4[i], 'sus4');
      checkChord(SUS2[i], 'sus2');
      checkChord(ADD9[i], 'add9');
      checkChord(DIM7[i], 'dim7');
      checkChord(M7B5[i], 'm7b5');
  }

  const uniqueResults = [];
  const seen = new Set();
  results.forEach(r => {
       const key = `${r.chord.id}-${r.chord.type}`;
       if (!seen.has(key)) {
           seen.add(key);
           uniqueResults.push(r);
       }
  });

  uniqueResults.sort((a, b) => b.score - a.score);

  return uniqueResults.slice(0, 5); 
};

