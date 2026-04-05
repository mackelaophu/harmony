// src/utils/MusicTheory.js

export const MAJOR = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const MINOR = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
export const DOM_MAJOR = ['G7', 'D7', 'A7', 'E7', 'B7', 'F#7', 'Db7', 'Ab7', 'Eb7', 'Bb7', 'F7', 'C7'];
export const DOM_MINOR = ['E7', 'B7', 'F#7', 'C#7', 'G#7', 'D#7', 'Bb7', 'F7', 'C7', 'G7', 'D7', 'A7'];
export const DIMINISHED = ['B°', 'F#°', 'C#°', 'G#°', 'D#°', 'A#°', 'F°', 'C°', 'G°', 'D°', 'A°', 'E°'];

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
  let root = id.replace(/[m7°#]/g, '');
  if (id.includes('#')) root += '#';
  if (id.includes('b') && id !== 'Bb') root = id;
  
  if (type === 'major') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7)];
  if (type === 'minor') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 7)];
  if (type === 'dom7') return [root, getNoteStringOffset(root, 4), getNoteStringOffset(root, 7), getNoteStringOffset(root, 10)];
  if (type === 'dim') return [root, getNoteStringOffset(root, 3), getNoteStringOffset(root, 6)];
  
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
  }
  
  return { id, type, notes, details };
};
