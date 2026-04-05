export class MidiEngine {
  constructor() {
    this.midiAccess = null;
    this.onNoteOnCallback = null;
    this.onNoteOffCallback = null;
    this.onStatusChangeCallback = null;
    this.activeDevice = null;
  }

  init(onStatusChange, onNoteOn, onNoteOff) {
    this.onStatusChangeCallback = onStatusChange;
    this.onNoteOnCallback = onNoteOn;
    this.onNoteOffCallback = onNoteOff;

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(
        (access) => this.onMIDISuccess(access),
        (msg) => this.onMIDIFailure(msg)
      );
    } else {
      console.warn("Web MIDI API not supported in this browser.");
      if (this.onStatusChangeCallback) this.onStatusChangeCallback(null, "Không hỗ trợ MIDI");
    }
  }

  onMIDISuccess(midiAccess) {
    this.midiAccess = midiAccess;
    this.midiAccess.onstatechange = (e) => this.updateDevices();
    this.updateDevices();
  }

  onMIDIFailure(msg) {
    console.error("Failed to get MIDI access", msg);
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(null, "Không thể truy cập MIDI API");
  }

  updateDevices() {
    let deviceName = null;
    // Iterate over all available inputs
    for (let input of this.midiAccess.inputs.values()) {
      input.onmidimessage = (message) => this.getMIDIMessage(message);
      if (!deviceName) deviceName = input.name; 
    }
    
    this.activeDevice = deviceName;
    if (this.onStatusChangeCallback) {
       this.onStatusChangeCallback(this.activeDevice, this.activeDevice ? `${this.activeDevice}` : "Đang chờ MIDI...");
    }
  }

  getMIDIMessage(message) {
    const command = message.data[0] >> 4; // Top 4 bits are the command (e.g., 9 for note on)
    const channel = message.data[0] & 0xf; // Bottom 4 bits are channel
    const note = message.data[1];
    const velocity = message.data[2] || 0;

    // Command 9 is Note On, Command 8 is Note Off
    if (command === 9 && velocity > 0) {
       const noteName = this.midiToNoteName(note);
       const normalizedVelocity = velocity / 127; // Normalize to 0.0 - 1.0 (Tone.js uses 0-1)
       if (this.onNoteOnCallback) this.onNoteOnCallback(noteName, normalizedVelocity);
    } else if (command === 8 || (command === 9 && velocity === 0)) {
       const noteName = this.midiToNoteName(note);
       if (this.onNoteOffCallback) this.onNoteOffCallback(noteName);
    }
  }

  midiToNoteName(midiNum) {
    const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNum / 12) - 1;
    const pitch = PITCH_CLASSES[midiNum % 12];
    return `${pitch}${octave}`;
  }
}

export const midiEngine = new MidiEngine();
