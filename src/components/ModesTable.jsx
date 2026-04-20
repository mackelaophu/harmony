import React from 'react';

const modesData = [
  { name: 'Ionian', interval: 'W-W-H-W-W-W-H', formula: '1-2-3-4-5-6-7', steps: [0, 2, 4, 5, 7, 9, 11, 12], offset: 0 },
  { name: 'Dorian', interval: 'W-H-W-W-W-H-W', formula: '1-2-b3-4-5-6-b7', steps: [0, 2, 3, 5, 7, 9, 10, 12], offset: 1 },
  { name: 'Phrygian', interval: 'H-W-W-W-H-W-W', formula: '1-b2-b3-4-5-b6-b7', steps: [0, 1, 3, 5, 7, 8, 10, 12], offset: 2 },
  { name: 'Lydian', interval: 'W-W-W-H-W-W-H', formula: '1-2-3-#4-5-6-7', steps: [0, 2, 4, 6, 7, 9, 11, 12], offset: 3 },
  { name: 'Mixolydian', interval: 'W-W-H-W-W-H-W', formula: '1-2-3-4-5-6-b7', steps: [0, 2, 4, 5, 7, 9, 10, 12], offset: 4 },
  { name: 'Aeolian', interval: 'W-H-W-W-H-W-W', formula: '1-2-b3-4-5-b6-b7', steps: [0, 2, 3, 5, 7, 8, 10, 12], offset: 5 },
  { name: 'Locrian', interval: 'H-W-W-H-W-W-W', formula: '1-b2-b3-4-b5-b6-b7', steps: [0, 1, 3, 5, 6, 8, 10, 12], offset: 6 }
];

const whiteKeyWidth = 14;
const whiteKeyHeight = 50;
const blackKeyWidth = 8;
const blackKeyHeight = 30;

// Mapping of 14 white keys to their chromatic indexes relative to C
const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];

// Mapping of 10 black keys to their chromatic indices and physical left-offsets (which white key they follow)
const blackKeyDefs = [
  { chr: 1,  afterW: 0 }, { chr: 3,  afterW: 1 }, { chr: 6,  afterW: 3 }, { chr: 8,  afterW: 4 },
  { chr: 10, afterW: 5 }, { chr: 13, afterW: 7 }, { chr: 15, afterW: 8 }, { chr: 18, afterW: 10 },
  { chr: 20, afterW: 11 }, { chr: 22, afterW: 12 }
];

// 1. Parallel Piano (All rooted on C, applying sharps/flats)
const ParallelPiano = ({ steps }) => {
  const whiteKeys = whiteKeyIndices.map((chr, i) => {
    const isHighlighted = steps.includes(chr);
    return (
      <rect key={`w-${i}`} x={i * whiteKeyWidth} y={0} width={whiteKeyWidth} height={whiteKeyHeight} 
            fill={isHighlighted ? '#0ea5e9' : '#ffffff'} stroke="#475569" strokeWidth="1" />
    );
  });
  const blackKeys = blackKeyDefs.map((def, i) => {
    const isHighlighted = steps.includes(def.chr);
    return (
      <rect key={`b-${i}`} x={def.afterW * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2} y={0} width={blackKeyWidth} height={blackKeyHeight} 
            fill={isHighlighted ? '#0ea5e9' : '#1e293b'} stroke="#111827" strokeWidth="1" />
    );
  });
  return (
    <svg width={14 * whiteKeyWidth} height={whiteKeyHeight + 2} viewBox={`0 0 ${14 * whiteKeyWidth} ${whiteKeyHeight + 2}`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
      {whiteKeys} {blackKeys}
    </svg>
  );
};

// 2. Relative Piano (All using C Major notes, starting on different offsets)
const RelativePiano = ({ offset }) => {
  const whiteKeys = Array.from({ length: 14 }).map((_, i) => {
    // Highlight exactly 8 white keys to resolve the octave (e.g. C to C)
    const isHighlighted = i >= offset && i < offset + 8;
    return (
      <rect key={`w-${i}`} x={i * whiteKeyWidth} y={0} width={whiteKeyWidth} height={whiteKeyHeight} 
            fill={isHighlighted ? '#0ea5e9' : '#ffffff'} stroke="#475569" strokeWidth="1" />
    );
  });
  const hasBlackKeyAfter = [true, true, false, true, true, true, false, true, true, false, true, true, true, false];
  const blackKeys = Array.from({ length: 13 }).map((_, i) => {
    if (!hasBlackKeyAfter[i]) return null;
    return (
      <rect key={`b-${i}`} x={i * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2} y={0} width={blackKeyWidth} height={blackKeyHeight} 
            fill="#1e293b" stroke="#111827" strokeWidth="1" />
    );
  });
  return (
    <svg width={14 * whiteKeyWidth} height={whiteKeyHeight + 2} viewBox={`0 0 ${14 * whiteKeyWidth} ${whiteKeyHeight + 2}`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
      {whiteKeys} {blackKeys}
    </svg>
  );
};

// Common Table Renderer
const RenderModeTable = ({ title, subtitle, isParallel }) => (
    <div style={{ flex: 1, minWidth: '550px', background: 'rgba(5, 7, 10, 0.7)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '20px' }}>{title}</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{subtitle}</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1.2fr) minmax(130px, 1.5fr) minmax(140px, 1.5fr) minmax(200px, 2fr)', background: '#0ea5e9', padding: '16px', fontWeight: 'bold', fontSize: '16px', color: 'white' }}>
            <div style={{ paddingLeft: '8px' }}>Mode name</div>
            <div>Interval sequence</div>
            <div>Formula</div>
            <div>Example</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {modesData.map((mode, index) => (
                <div key={mode.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1.2fr) minmax(130px, 1.5fr) minmax(140px, 1.5fr) minmax(200px, 2fr)', background: index % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', padding: '16px', alignItems: 'center', borderBottom: index < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', paddingLeft: '8px' }}>{mode.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>{mode.interval}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>{mode.formula}</div>
                    <div>
                        {isParallel ? <ParallelPiano steps={mode.steps} /> : <RelativePiano offset={mode.offset} />}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ModesTable = () => {
    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1400px', paddingBottom: '100px' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', width: '100%' }}>
                <RenderModeTable 
                    title="Parallel Modes (Các Mode Song Song)"
                    subtitle="Tất cả các Mode đều được ép mượn chung một nốt Root là C. Thể hiện sự biến hình của các nốt Thăng/Giáng so với âm giai trưởng gốc."
                    isParallel={true}
                />
                
                <RenderModeTable 
                    title="Relative Modes (Các Mode Tương Đối)"
                    subtitle="Dùng chung 1 bộ nốt (C Major Scale - Chỉ dùng Phím Trắng). Thể hiện sự thay đổi sắc thái chỉ bằng cách dời điểm bắt đầu (Root Note) lên cao dần."
                    isParallel={false}
                />
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center', maxWidth: '800px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
                <p>Nền tảng của các <b>Điệu thức (Modes)</b> là các biến thể phát sinh từ âm giai nguyên bản. Ta có thể tiếp cận theo hướng <b>Song Song (Parallel)</b> để mổ xẻ thay đổi theo công thức bậc, hoặc tiếp cận theo hướng <b>Tương Đối (Relative)</b> để thấy sự luân chuyển mượt mà của cùng một bộ nốt không thêm bớt bất kỳ dấu hoá nào!</p>
            </div>
        </div>
    );
};

export default ModesTable;
