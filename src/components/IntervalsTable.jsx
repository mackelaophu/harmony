import React from 'react';

const intervalsData = [
  { name: 'Minor 2nd', type: 'Dissonance', color: '#fcaa7b', step: 1 },
  { name: 'Major 2nd', type: 'Dissonance', color: '#f07d6a', step: 2 },
  { name: 'Minor 3rd', type: 'Consonance', color: '#c82f3a', step: 3 },
  { name: 'Major 3rd', type: 'Consonance', color: '#d92589', step: 4 },
  { name: 'Perfect 4th', type: 'Consonance', color: '#43a047', step: 5 },
  { name: 'Tritone', type: 'Dissonance', color: '#3ba796', step: 6 },
  { name: 'Perfect 5th', type: 'Consonance', color: '#5ba6f5', step: 7 },
  { name: 'Minor 6th', type: 'Consonance', color: '#0ea5e9', step: 8 },
  { name: 'Major 6th', type: 'Consonance', color: '#cdb125', step: 9 },
  { name: 'Minor 7th', type: 'Dissonance', color: '#c4a478', step: 10 },
  { name: 'Major 7th', type: 'Dissonance', color: '#eca9c7', step: 11 },
  { name: 'Octave', type: 'Consonance', color: '#88738e', step: 12 },
];

const IntervalPiano = ({ targetStep, color }) => {
  const whiteKeyWidth = 24;
  const whiteKeyHeight = 70;
  const blackKeyWidth = 14;
  const blackKeyHeight = 45;
  
  // Mapping of 8 white keys (C to C) to their chromatic indexes relative to root C
  const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11, 12];
  
  // Mapping of 5 black keys
  const blackKeyDefs = [
    { chr: 1,  afterW: 0 }, // C#
    { chr: 3,  afterW: 1 }, // D#
    { chr: 6,  afterW: 3 }, // F#
    { chr: 8,  afterW: 4 }, // G#
    { chr: 10, afterW: 5 }  // A#
  ];

  const whiteKeys = whiteKeyIndices.map((chr, i) => {
    const isHighlighted = chr === 0 || chr === targetStep;
    return (
      <rect 
        key={`w-${i}`} 
        x={i * whiteKeyWidth} 
        y={0} 
        width={whiteKeyWidth} 
        height={whiteKeyHeight} 
        fill={isHighlighted ? color : '#ffffff'} 
        stroke="#475569" 
        strokeWidth="1"
      />
    );
  });

  const blackKeys = blackKeyDefs.map((def, i) => {
    const isHighlighted = def.chr === targetStep;
    return (
      <rect 
        key={`b-${i}`} 
        x={def.afterW * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2} 
        y={0} 
        width={blackKeyWidth} 
        height={blackKeyHeight} 
        fill={isHighlighted ? color : '#1e293b'}
        stroke="#111827"
        strokeWidth="1"
      />
    );
  });

  return (
    <svg width={8 * whiteKeyWidth} height={whiteKeyHeight + 2} viewBox={`0 0 ${8 * whiteKeyWidth} ${whiteKeyHeight + 2}`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))', borderRadius: '4px' }}>
      {whiteKeys}
      {blackKeys}
    </svg>
  );
};

const IntervalsTable = () => {
    // Generate left and right column data exactly matching the image
    const leftColumn = [0, 2, 4, 6, 8, 10].map(i => intervalsData[i]);
    const rightColumn = [1, 3, 5, 7, 9, 11].map(i => intervalsData[i]);

    const renderColumn = (colData) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: '300px' }}>
            {colData.map((interval) => (
                <div key={interval.name} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '120px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: interval.color, fontWeight: 'bold', fontSize: '18px', letterSpacing: '-0.02em' }}>{interval.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '4px' }}>{interval.type}</span>
                    </div>
                    <div>
                        <IntervalPiano targetStep={interval.step} color={interval.color} />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', paddingBottom: '100px' }}>
            
            <div style={{ background: 'rgba(5, 7, 10, 0.7)', borderRadius: '24px', padding: '40px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', fontSize: '28px', color: '#f8fafc', fontWeight: '800' }}>Music Intervals Reference</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
                    {renderColumn(leftColumn)}
                    {renderColumn(rightColumn)}
                </div>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center', maxWidth: '700px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
                <p><b>Quãng (Interval)</b> là khoảng cách về cao độ giữa hai nốt nhạc. Việc nắm vững cấu tạo của từng Quãng (có tính chất Thuận/Nghịch tai khác nhau) là cốt lõi để thấu hiểu sự hình thành của mọi Hợp âm phức tạp trên khuôn nhạc!</p>
            </div>
        </div>
    );
};

export default IntervalsTable;
