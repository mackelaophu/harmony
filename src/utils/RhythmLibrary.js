export const RHYTHM_STYLES = {
  MARCH: {
    id: 'MARCH', name: 'March (2/4)', meter: '2/4', defaultBpm: 120, timeSignature: 2,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'chord' },
    ]
  },
  DISCO: {
    id: 'DISCO', name: 'Disco (2/4)', meter: '2/4', defaultBpm: 120, timeSignature: 2,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:0:2', type: 'chord', duration: '16n' },
      { time: '0:1:0', type: 'altBass' },
      { time: '0:1:2', type: 'chord', duration: '16n' },
    ]
  },
  VALSE: {
    id: 'VALSE', name: 'Valse (3/4)', meter: '3/4', defaultBpm: 120, timeSignature: 3,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'chord', duration: '8n' },
      { time: '0:2:0', type: 'chord', duration: '8n' },
    ]
  },
  BOSTON: {
    id: 'BOSTON', name: 'Boston (3/4)', meter: '3/4', defaultBpm: 80, timeSignature: 3,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'arp1' },
      { time: '0:2:0', type: 'arp2' },
    ]
  },
  TANGO: {
    id: 'TANGO', name: 'Tango (4/4)', meter: '4/4', defaultBpm: 110, timeSignature: 4,
    seq: [
      { time: '0:0:0', type: 'bass', duration: '8n' },
      { time: '0:1:0', type: 'chord', duration: '8n' },
      { time: '0:1:2', type: 'chord', duration: '8n' },
      { time: '0:2:0', type: 'altBass', duration: '8n' },
      { time: '0:3:0', type: 'chord', duration: '4n' },
    ]
  },
  CHA_CHA_CHA: {
    id: 'CHA_CHA_CHA', name: 'Cha-cha-cha (4/4)', meter: '4/4', defaultBpm: 110, timeSignature: 4,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'chord' },
      { time: '0:2:0', type: 'bass' },
      { time: '0:3:0', type: 'chord', duration: '8n' },
      { time: '0:3:2', type: 'chord', duration: '8n' },
    ]
  },
  BOLERO: {
    id: 'BOLERO', name: 'Bolero (4/4)', meter: '4/4', defaultBpm: 75, timeSignature: 4,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'arp1' },
      { time: '0:1:2', type: 'arp2' }, 
      { time: '0:2:0', type: 'altBass' },
      { time: '0:3:0', type: 'chord' },
      { time: '0:3:2', type: 'arp2' },
    ]
  },
  BOSSA_NOVA: {
    id: 'BOSSA_NOVA', name: 'Bossa Nova (4/4)', meter: '4/4', defaultBpm: 130, timeSignature: 4,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:0:2', type: 'chord', duration: '8n' },
      { time: '0:1:2', type: 'chord', duration: '8n' },
      { time: '0:2:0', type: 'altBass' },
      { time: '0:3:0', type: 'chord', duration: '8n' },
    ]
  },
  SLOW_ROCK: {
    // 6/8 means 2 main beats (dotted quarter). Tone.js timeSignature = [6, 8]
    // 6/8 is natively 6 eighth notes per bar.
    // In Tone.js, if timeSig=6, it's 6 quarter notes per bar.
    // A better way for 6/8 in standard 4/4 BPM context is 2/4 in triplets!
    // But since Tone supports timeSignature: [6, 8] we can just use 8th notes as grid!
    // Actually, setting timeSignature 6/8 makes a 'bar' 6 beats if denominator is ignored by sequence sometimes.
    // Let's use 3/4 with triplet feel or just pure fractions.
    // Or simpler: stick to 6 beats per bar but faster.
    id: 'SLOW_ROCK', name: 'Slow Rock (6/8)', meter: '6/8', defaultBpm: 210, timeSignature: 6,
    seq: [
      { time: '0:0:0', type: 'bass' },
      { time: '0:1:0', type: 'arp1' },
      { time: '0:2:0', type: 'arp2' },
      { time: '0:3:0', type: 'altBass' },
      { time: '0:4:0', type: 'arp2' },
      { time: '0:5:0', type: 'arp1' },
    ]
  }
};
