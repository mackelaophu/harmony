import * as Tone from 'tone';
import { RHYTHM_STYLES } from './RhythmLibrary';
import { normalizeNote } from './MusicTheory';

class AudioEngine {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    this.initialized = false;
    this.currentPart = null;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    await Tone.loaded();
    this.initialized = true;
    console.log('Audio Engine Initialized (Piano Samples Loaded)');
  }

  playNote(note, duration = '2n', velocity = 0.8) {
    if (!this.initialized) return;
    this.sampler.triggerAttackRelease(note, duration, undefined, velocity);
  }

  playChord(notes, duration = '2n', velocity = 0.7) {
    if (!this.initialized) return;
    this.sampler.triggerAttackRelease(notes, duration, undefined, velocity);
  }

  setPlaybackVoicing(chordNotes) {
    if (!chordNotes || chordNotes.length < 3) return null;
    const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    const rootNorm = normalizeNote(chordNotes[0]);
    const bass = `${rootNorm}2`; 
    
    const altNorm = normalizeNote(chordNotes[chordNotes.length > 2 ? 2 : 0]);
    const altBass = `${altNorm}2`;

    let oct = 4;
    let prevIdx = -1;
    const voiced = chordNotes.map(n => {
        const norm = normalizeNote(n);
        const idx = FLAT_NOTES.indexOf(norm);
        if (idx < prevIdx && prevIdx !== -1) oct++;
        prevIdx = idx;
        return `${norm}${oct}`;
    });

    return {
        bass,
        altBass,
        chord: voiced,
        arp1: voiced[1],
        arp2: voiced[2] || voiced[1]
    };
  }

  playRhythmStyle(styleId, chordNotes) {
    if (!this.initialized) return;
    this.stopRhythm();
    
    const styleDef = RHYTHM_STYLES[styleId];
    if (!styleDef) return;
    
    const voicing = this.setPlaybackVoicing(chordNotes);
    if (!voicing) return;
    
    Tone.Transport.bpm.value = styleDef.defaultBpm;
    Tone.Transport.timeSignature = styleDef.timeSignature;
    
    this.currentPart = new Tone.Part((time, event) => {
        let duration = event.duration || '8n';
        let velocity = event.type.includes('bass') ? 0.9 : 0.6; 
        
        let notesToPlay = voicing[event.type]; 
        if (!notesToPlay) return;
        
        this.sampler.triggerAttackRelease(notesToPlay, duration, time, velocity);
    }, styleDef.seq).start(0);
    
    this.currentPart.loop = true;
    this.currentPart.loopEnd = '1m'; 
    Tone.Transport.start();
  }

  stopRhythm() {
    if (this.currentPart) {
        this.currentPart.stop();
        this.currentPart.dispose();
        this.currentPart = null;
    }
    Tone.Transport.stop();
  }
}

export const audioEngine = new AudioEngine();
