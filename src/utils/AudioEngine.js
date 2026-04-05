import * as Tone from 'tone';
import { RHYTHM_STYLES } from './RhythmLibrary';
import { normalizeNote, NOTES_FLAT } from './MusicTheory';

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
    if (Array.isArray(notes)) {
        notes.forEach(n => this.sampler.triggerAttackRelease(n, duration, undefined, velocity));
    } else {
        this.sampler.triggerAttackRelease(notes, duration, undefined, velocity);
    }

    if (this.noteVisualCallback && Tone.Draw) {
        Tone.Draw.schedule(() => {
            this.noteVisualCallback(Array.isArray(notes) ? notes : [notes]);
        }, Tone.now());
    }
  }

  setPlaybackVoicing(chordNotes) {
    if (!chordNotes || chordNotes.length < 3) return null;
    
    const rootNorm = normalizeNote(chordNotes[0]);
    const bass = `${rootNorm}2`; 
    
    const altNorm = normalizeNote(chordNotes[chordNotes.length > 2 ? 2 : 0]);
    const altBass = `${altNorm}2`;

    let oct = 4;
    let prevIdx = -1;
    const voiced = chordNotes.map(n => {
        const norm = normalizeNote(n);
        const idx = NOTES_FLAT.indexOf(norm);
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

  setTempo(bpm) {
    if (this.initialized) {
        Tone.Transport.bpm.rampTo(bpm, 0.1);
    }
  }

  setNoteVisualCallback(callback) {
      this.noteVisualCallback = callback;
  }

  playRhythmStyle(styleId, chordNotes, currentTempo) {
    if (!this.initialized) return;
    this.stopRhythm();
    
    const styleDef = RHYTHM_STYLES[styleId];
    if (!styleDef) return;
    
    Tone.Transport.bpm.value = currentTempo || styleDef.defaultBpm;
    Tone.Transport.timeSignature = styleDef.timeSignature;
    
    const voicing = this.setPlaybackVoicing(chordNotes);
    if (!voicing) return;
    
    this.currentPart = new Tone.Part((time, event) => {
        let duration = event.duration || '8n';
        let velocity = event.type.includes('bass') ? 0.9 : 0.6; 
        
        let notesToPlay = voicing[event.type]; 
        if (!notesToPlay) return;
        
        if (Array.isArray(notesToPlay)) {
            notesToPlay.forEach(n => this.sampler.triggerAttackRelease(n, duration, time, velocity));
        } else {
            this.sampler.triggerAttackRelease(notesToPlay, duration, time, velocity);
        }
        
        if (this.noteVisualCallback) {
            Tone.Draw.schedule(() => {
                this.noteVisualCallback(Array.isArray(notesToPlay) ? notesToPlay : [notesToPlay]);
            }, time);
        }
    }, styleDef.seq).start(0);
    
    this.currentPart.loop = true;
    this.currentPart.loopEnd = '1m'; 
    Tone.Transport.start();
  }

  playProgressionSequence(contexts, activeRhythm, onChordUIUpdate, currentTempo) {
    if (!this.initialized) return;
    this.stopRhythm();
    
    const styleDef = activeRhythm ? RHYTHM_STYLES[activeRhythm] : null;
    Tone.Transport.bpm.value = currentTempo || (styleDef ? styleDef.defaultBpm : 100);
    if (styleDef) Tone.Transport.timeSignature = styleDef.timeSignature;
    
    const voicings = contexts.map(ctx => this.setPlaybackVoicing(ctx.notes));

    if (!styleDef) {
        const events = contexts.map((ctx, idx) => ({ time: `${idx}m`, voicing: voicings[idx] }));
        this.currentPart = new Tone.Part((time, event) => {
            if (event.voicing) {
                this.sampler.triggerAttackRelease(event.voicing.bass, '1m', time, 0.85);
                event.voicing.chord.forEach(n => {
                    this.sampler.triggerAttackRelease(n, '1m', time + 0.03, 0.65);
                });
                
                if (this.noteVisualCallback) {
                    Tone.Draw.schedule(() => {
                        this.noteVisualCallback([event.voicing.bass, ...event.voicing.chord]);
                    }, time);
                }
            }
        }, events).start(0);
    } else {
        const allEvents = [];
        voicings.forEach((voicing, measureIdx) => {
             if (!voicing) return;
             styleDef.seq.forEach(seqEvent => {
                 const timeParts = seqEvent.time.split(':');
                 const absTime = `${parseInt(timeParts[0]) + measureIdx}:${timeParts[1]}:${timeParts[2]}`;
                 allEvents.push({
                     time: absTime,
                     type: seqEvent.type,
                     duration: seqEvent.duration,
                     voicing: voicing
                 });
             });
        });
        
        this.currentPart = new Tone.Part((time, event) => {
            let duration = event.duration || '8n';
            let velocity = event.type.includes('bass') ? 0.9 : 0.6; 
            let notesToPlay = event.voicing[event.type]; 
            if (!notesToPlay) return;
            
            if (Array.isArray(notesToPlay)) {
                notesToPlay.forEach(n => this.sampler.triggerAttackRelease(n, duration, time, velocity));
            } else {
                this.sampler.triggerAttackRelease(notesToPlay, duration, time, velocity);
            }
            
            if (this.noteVisualCallback) {
                Tone.Draw.schedule(() => {
                    this.noteVisualCallback(Array.isArray(notesToPlay) ? notesToPlay : [notesToPlay]);
                }, time);
            }
        }, allEvents).start(0);
    }
    
    if (onChordUIUpdate) {
        const uiEvents = contexts.map((ctx, idx) => ({ time: `${idx}m`, notes: ctx.notes }));
        this.uiPart = new Tone.Part((time, event) => {
            Tone.Draw.schedule(() => {
                onChordUIUpdate(event.notes);
            }, time);
        }, uiEvents).start(0);
    }
    
    this.currentPart.loop = false;
    Tone.Transport.start();
  }

  stopRhythm() {
    if (this.currentPart) {
        this.currentPart.stop();
        this.currentPart.dispose();
        this.currentPart = null;
    }
    if (this.uiPart) {
        this.uiPart.stop();
        this.uiPart.dispose();
        this.uiPart = null;
    }
    Tone.Transport.stop();
  }
}

export const audioEngine = new AudioEngine();
