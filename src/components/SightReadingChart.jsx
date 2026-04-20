import React from 'react';

const SightReadingChart = () => {
    const ww = 20; // white key width
    const wh = 80; // white key height
    const bw = 12; // black key width
    const bh = 50; // black key height
    
    const numWhiteKeys = 36;
    const startOctave = 2; // Roughly from A1/B1 up to D6
    
    // Pattern of white keys
    const notes = ['A','B','C','D','E','F','G'];
    const whiteKeys = [];
    let noteIdx = 0; // A
    let octave = 1;
    let cx = []; // Center X for each white key
    
    for(let i=0; i<numWhiteKeys; i++) {
        const noteName = notes[noteIdx];
        if (noteName === 'C') octave++;
        const isC = noteName === 'C';
        whiteKeys.push({
            i, noteName, octave, isC,
            label: isC ? `C${octave}` : noteName,
            x: i * ww
        });
        cx.push(i * ww + ww/2);
        noteIdx = (noteIdx + 1) % 7;
    }

    // Black keys
    const hasBlackAfter = { 'A': true, 'B': false, 'C': true, 'D': true, 'E': false, 'F': true, 'G': true };
    const blackKeys = [];
    for(let i=0; i<numWhiteKeys-1; i++) {
        if(hasBlackAfter[whiteKeys[i].noteName]) {
            blackKeys.push(i * ww + ww - bw/2);
        }
    }

    // Treble Clef mapping E4(bottom line) to F5(top line)
    // E4 is index 18 (if A1 is 0... let's count: A1=0, B1=1, C2=2... C3=9, C4=16. D4=17, E4=18.
    // 5 lines of treble: E4, G4, B4, D5, F5
    const trebleLines = [
        { y: 150, idx: 32, note: 'F', color: '#f472b6', mnemonic: 'Fruit' }, // top line: F5
        { y: 170, idx: 30, note: 'D', color: '#60a5fa', mnemonic: 'Deserves' }, // 4th line: D5
        { y: 190, idx: 28, note: 'B', color: '#f472b6', mnemonic: 'Boy' }, // 3rd line: B5
        { y: 210, idx: 26, note: 'G', color: '#f472b6', mnemonic: 'Good' }, // 2nd line: G4
        { y: 230, idx: 24, note: 'E', color: '#a78bfa', mnemonic: 'Every' }  // bottom line: E4
    ];

    // Bass Clef mapping G2(bottom line) to A3(top line)
    // C2=2, C3=9, C4=16.
    // G2=6, B2=8, D3=10, F3=12, A3=14.
    const bassLines = [
        { y: 470, idx: 14, note: 'A', color: '#f472b6', mnemonic: 'Always' }, // top line: A3
        { y: 490, idx: 12, note: 'F', color: '#a78bfa', mnemonic: 'Fruit' }, // 4th line: F3
        { y: 510, idx: 10, note: 'D', color: '#60a5fa', mnemonic: 'Deserve' }, // 3rd line: D3
        { y: 530, idx: 8,  note: 'B', color: '#f472b6', mnemonic: 'Boys' }, // 2nd line: B2
        { y: 550, idx: 6,  note: 'G', color: '#f472b6', mnemonic: 'Good' }  // bottom line: G2
    ];

    // Generate node circles for ALL notes from C2 to D6
    // mapped logically to visual levels.
    // Base lines: Treble E4(y=230). Space step = 10px.
    // Each step up/down in diatonic scale = 10px in Y axis.
    const getTrebleY = (idx) => {
        const E4_idx = 24;
        const E4_y = 230;
        return E4_y - (idx - E4_idx) * 10;
    };
    const getBassY = (idx) => {
        const G2_idx = 6;
        const G2_y = 550;
        return G2_y - (idx - G2_idx) * 10;
    };

    const topNotes = [];
    // E3(24) to D6(37) -> mapped to treble
    for(let i=21; i<=35; i++) {
        topNotes.push({ idx: i, x: cx[i], y: getTrebleY(i), note: whiteKeys[i].noteName });
    }
    const bottomNotes = [];
    // C2(2) to C4(16) -> mapped to bass
    for(let i=2; i<=16; i++) {
        bottomNotes.push({ idx: i, x: cx[i], y: getBassY(i), note: whiteKeys[i].noteName });
    }

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', paddingBottom: '100px' }}>
            <h2 style={{ alignSelf: 'flex-start', color: '#38bdf8', paddingLeft: '50px', letterSpacing: '0.05em' }}>SIGHT READING CHART</h2>
            
            <div style={{ width: '100%', background: '#05070a', overflow: 'hidden', padding: '20px 0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <svg width="100%" viewBox="-50 50 850 600" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
                    {/* Treble Lines */}
                    {trebleLines.map((line) => (
                        <g key={`tline-${line.y}`}>
                            <line x1="0" y1={line.y} x2="800" y2={line.y} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                            <text x="180" y={line.y} fill="white" fontSize="12" fontWeight="bold" dominantBaseline="middle" textAnchor="end">{line.mnemonic}</text>
                            <line x1="185" y1={line.y} x2={cx[line.idx] - 15} y2={line.y} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                        </g>
                    ))}
                    
                    {/* Treble Clef Symbol Mock */}
                    <text x="20" y="210" fill="white" fontSize="80" fontFamily="serif">𝄞</text>
                    
                    {/* Treble Note Traces */}
                    {topNotes.map(n => (
                        <g key={`tni-${n.idx}`}>
                            {n.note === 'C' && <line x1={n.x - 12} y1={n.y} x2={n.x + 12} y2={n.y} stroke="white" strokeWidth="2" />} {/* Ledger lines */}
                            {n.idx > 32 && n.note === 'A' && <line x1={n.x - 12} y1={n.y} x2={n.x + 12} y2={n.y} stroke="white" strokeWidth="2" />}
                            {n.idx > 32 && n.note === 'C' && <line x1={n.x - 12} y1={n.y} x2={n.x + 12} y2={n.y} stroke="white" strokeWidth="2" />}
                            
                            <line x1={n.x} y1={n.y+8} x2={n.x} y2="300" stroke="white" strokeWidth="1" opacity="0.6"/>
                            <circle cx={n.x} cy={n.y} r="8" fill={n.note === 'C' || n.note === 'D' ? '#0ea5e9' : (n.note === 'E' || n.note === 'F') ? '#a78bfa' : '#f472b6'} />
                            <text x={n.x} y={n.y+1} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{n.note}</text>
                        </g>
                    ))}

                    {/* Piano Keyboard */}
                    <g transform="translate(0, 300)">
                        {whiteKeys.map(k => (
                            <g key={`wk-${k.i}`}>
                                <rect x={k.x} y="0" width={ww} height={wh} fill={k.isC ? '#0ea5e9' : 'white'} stroke="#1f2937" strokeWidth="1" />
                                <text x={k.x + ww/2} y={wh - 10} fill={k.isC ? 'white' : '#1f2937'} fontSize={k.isC ? 11 : 9} fontWeight="bold" textAnchor="middle">{k.label}</text>
                            </g>
                        ))}
                        {blackKeys.map(bx => (
                            <rect key={`bk-${bx}`} x={bx} y="0" width={bw} height={bh} fill="#111827" stroke="black" />
                        ))}
                    </g>
                    
                    {/* Bass Lines */}
                    {bassLines.map((line) => (
                        <g key={`bline-${line.y}`}>
                            <line x1="0" y1={line.y} x2="800" y2={line.y} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                            <text x="750" y={line.y} fill="white" fontSize="12" fontWeight="bold" dominantBaseline="middle" textAnchor="start">{line.mnemonic}</text>
                            <line x1={cx[line.idx] + 15} y1={line.y} x2="745" y2={line.y} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                        </g>
                    ))}

                    {/* Bass Clef Symbol Mock */}
                    <text x="20" y="520" fill="white" fontSize="70" fontFamily="serif">𝄢</text>

                    {/* Bass Note Traces */}
                    {bottomNotes.map(n => (
                        <g key={`bni-${n.idx}`}>
                            {n.note === 'C' && <line x1={n.x - 12} y1={n.y} x2={n.x + 12} y2={n.y} stroke="white" strokeWidth="2" />} {/* Ledger lines */}
                            {n.idx < 6 && n.note === 'E' && <line x1={n.x - 12} y1={n.y} x2={n.x + 12} y2={n.y} stroke="white" strokeWidth="2" />}
                            
                            <line x1={n.x} y1="380" x2={n.x} y2={n.y-8} stroke="white" strokeWidth="1" opacity="0.6"/>
                            <circle cx={n.x} cy={n.y} r="8" fill={n.note === 'C' || n.note === 'D' ? '#0ea5e9' : (n.note === 'E' || n.note === 'F') ? '#a78bfa' : '#f472b6'} />
                            <text x={n.x} y={n.y+1} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{n.note}</text>
                        </g>
                    ))}
                    
                </svg>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center', maxWidth: '750px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6' }}>
                <p><b>Sơ đồ Tập đọc nốt (Sight Reading Chart)</b> giúp người mới bắt đầu dễ dàng liên kết các nốt trên bản nhạc viết (Khuông nhạc Khoá Sol và Khoá Pha) với vị trí nhấn chính xác trên bàn phím Piano.</p>
            </div>
        </div>
    );
};

export default SightReadingChart;
