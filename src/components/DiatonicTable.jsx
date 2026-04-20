import React, { useState } from 'react';

const majorChordsData = [
  { key: 'C', chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'] },
  { key: 'Db', chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'C°'] },
  { key: 'D', chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#°'] },
  { key: 'Eb', chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'D°'] },
  { key: 'E', chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#°'] },
  { key: 'F', chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'E°'] },
  { key: 'Gb', chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'F°'] },
  { key: 'G', chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°'] },
  { key: 'Ab', chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'G°'] },
  { key: 'A', chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#°'] },
  { key: 'Bb', chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'A°'] },
  { key: 'B', chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#°'] }
];

const minorChordsData = [
  { key: 'Am', chords: ['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G'] },
  { key: 'Bbm', chords: ['Bbm', 'C°', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'] },
  { key: 'Bm', chords: ['Bm', 'C#°', 'D', 'Em', 'F#m', 'G', 'A'] },
  { key: 'Cm', chords: ['Cm', 'D°', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'] },
  { key: 'C#m', chords: ['C#m', 'D#°', 'E', 'F#m', 'G#m', 'A', 'B'] },
  { key: 'Dm', chords: ['Dm', 'E°', 'F', 'Gm', 'Am', 'Bb', 'C'] },
  { key: 'Ebm', chords: ['Ebm', 'F°', 'Gb', 'Abm', 'Bbm', 'Cb', 'Db'] },
  { key: 'Em', chords: ['Em', 'F#°', 'G', 'Am', 'Bm', 'C', 'D'] },
  { key: 'Fm', chords: ['Fm', 'G°', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'] },
  { key: 'F#m', chords: ['F#m', 'G#°', 'A', 'Bm', 'C#m', 'D', 'E'] },
  { key: 'Gm', chords: ['Gm', 'A°', 'Bb', 'Cm', 'Dm', 'Eb', 'F'] },
  { key: 'G#m', chords: ['G#m', 'A#°', 'B', 'C#m', 'D#m', 'E', 'F#'] }
];

const DiatonicTable = () => {
    const [tab, setTab] = useState('major');

    const renderTable = (isMajor) => {
        const headers = isMajor 
          ? [
              { numeral: 'I', label: 'Major', color: '#22c55e' },
              { numeral: 'ii', label: 'Minor', color: '#dc2626' },
              { numeral: 'iii', label: 'Minor', color: '#dc2626' },
              { numeral: 'IV', label: 'Major', color: '#22c55e' },
              { numeral: 'V', label: 'Major', color: '#22c55e' },
              { numeral: 'vi', label: 'Minor', color: '#dc2626' },
              { numeral: 'vii°', label: 'Diminished', color: '#0ea5e9' }
            ]
          : [
              { numeral: 'i', label: 'Minor', color: '#dc2626' },
              { numeral: 'ii°', label: 'Diminished', color: '#0ea5e9' },
              { numeral: 'III', label: 'Major', color: '#22c55e' },
              { numeral: 'iv', label: 'Minor', color: '#dc2626' },
              { numeral: 'v', label: 'Minor', color: '#dc2626' },
              { numeral: 'VI', label: 'Major', color: '#22c55e' },
              { numeral: 'VII', label: 'Major', color: '#22c55e' }
            ];

        const data = isMajor ? majorChordsData : minorChordsData;

        return (
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
                    {headers.map(h => (
                        <div key={h.numeral} style={{ background: h.color, color: 'white', padding: '12px 4px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                            <span style={{ fontWeight: '900', fontSize: '18px' }}>{h.numeral}</span>
                            <span style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>{h.label}</span>
                        </div>
                    ))}
                </div>
                
                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.85)' }}>
                    {data.map((row, rowIndex) => (
                        <div key={row.key} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', background: rowIndex % 2 === 0 ? '#f3f4f6' : '#e5e7eb', borderBottom: rowIndex < 11 ? '1px solid #d1d5db' : 'none' }}>
                            {row.chords.map((chord, colIndex) => (
                                <div key={colIndex} style={{ padding: '12px 4px', color: '#1f2937', fontWeight: '600', fontSize: '15px', borderRight: '1px solid #d1d5db' }}>
                                    {chord}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', paddingBottom: '100px' }}>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                  onClick={() => setTab('major')}
                  style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: tab === 'major' ? '#22c55e' : 'rgba(255,255,255,0.1)', color: tab === 'major' ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  Giọng Trưởng (Major Keys)
                </button>
                <button 
                  onClick={() => setTab('minor')}
                  style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: tab === 'minor' ? '#dc2626' : 'rgba(255,255,255,0.1)', color: tab === 'minor' ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                >
                  Giọng Thứ (Minor Keys)
                </button>
            </div>

            {renderTable(tab === 'major')}

            <div style={{ marginTop: '30px', textAlign: 'center', maxWidth: '750px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
                <p>Bảng <b>Hợp âm Diatonic</b> trình bày hệ thống các hợp âm có thể được xây dựng một cách tự nhiên bằng cách xếp chồng các quãng 3 nội trong một âm giai (Scale). Chúng tạo thành xương sống của mọi vòng hòa âm trong bất kỳ bản nhạc nào.</p>
            </div>
        </div>
    );
};

export default DiatonicTable;
