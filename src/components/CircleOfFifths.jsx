import React, { useState } from 'react';
import { audioEngine } from '../utils/AudioEngine';
import { getChordContext } from '../utils/MusicTheory';

const COLORS = {
  blue: '#0ea5e9',
  pink: '#f472b6',
  darkGrey: '#1f2937',
  midGrey: '#374151',
  bg: '#0f172a',
  text: '#ffffff',
  textMuted: '#9ca3af',
  stroke: '#111827'
};

const FLATS = 'flats';
const SHARPS = 'sharps';
const NEUTRAL = 'neutral';

const KEYS = [
  { i: 0, maj: 'C', min: 'a', type: NEUTRAL, count: 0 },
  { i: 1, maj: 'G', min: 'e', type: SHARPS, count: 1 },
  { i: 2, maj: 'D', min: 'b', type: SHARPS, count: 2 },
  { i: 3, maj: 'A', min: 'f#', type: SHARPS, count: 3 },
  { i: 4, maj: 'E', min: 'c#', type: SHARPS, count: 4 },
  { i: 5, maj: 'B/Cb', min: 'g#', type: 'SPLIT', p1: { type: SHARPS, count: 5 }, p2: { type: FLATS, count: 7 } },
  { i: 6, maj: 'F#/Gb', min: 'd#/eb', type: 'SPLIT', p1: { type: SHARPS, count: 6 }, p2: { type: FLATS, count: 6 } },
  { i: 7, maj: 'Db/C#', min: 'bb', type: 'SPLIT', p1: { type: FLATS, count: 5 }, p2: { type: SHARPS, count: 7 } },
  { i: 8, maj: 'Ab', min: 'f', type: FLATS, count: 4 },
  { i: 9, maj: 'Eb', min: 'c', type: FLATS, count: 3 },
  { i: 10, maj: 'Bb', min: 'g', type: FLATS, count: 2 },
  { i: 11, maj: 'F', min: 'd', type: FLATS, count: 1 }
];

const CX = 500;
const CY = 500;
const INNER_R = 140;
const MINOR_R = 240;
const MAJOR_R = 340;
const SIG_R = 500;

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const angleRad = (angleDeg - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleRad)),
    y: cy + (r * Math.sin(angleRad))
  };
};

const describeArc = (cx, cy, innerR, outerR, startAngle, endAngle) => {
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", startOuter.x, startOuter.y,
    "A", outerR, outerR, 0, largeArc, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerR, innerR, 0, largeArc, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
};

const getArcPath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  let diff = ((endAngle - startAngle) % 360 + 360) % 360; 
  const largeArc = diff > 180 ? 1 : 0;
  return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArc, 1, end.x, end.y
  ].join(" ");
};

const getArcPathCCW = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  let diff = ((startAngle - endAngle) % 360 + 360) % 360; 
  const largeArc = diff > 180 ? 1 : 0;
  return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArc, 0, end.x, end.y
  ].join(" ");
};

const getPianoHighlights = (count, type) => {
  const sharpsWhite = [3, 0];
  const sharpsBlack = [2, 0, 3, 1, 4];
  const flatsWhite = [6, 2]; 
  const flatsBlack = [4, 1, 3, 0, 2];
  
  const w = [];
  const b = [];
  
  if (type === SHARPS) {
    for (let i = 0; i < count; i++) {
       if (i < 5) b.push(sharpsBlack[i]);
       else w.push(sharpsWhite[i - 5]);
    }
  } else if (type === FLATS) {
    for (let i = 0; i < count; i++) {
       if (i < 5) b.push(flatsBlack[i]);
       else w.push(flatsWhite[i - 5]);
    }
  }
  return { white: w, black: b };
};

const renderMiniPiano = (cx, cy, scale, count, type) => {
  const highlights = getPianoHighlights(count, type);
  const color = type === SHARPS ? COLORS.pink : (type === FLATS ? COLORS.blue : '#111827');
  
  const W_W = 6;
  const W_H = 20;
  const B_W = 4;
  const B_H = 11;
  
  const startX = cx - 21;
  const startY = cy - 10;
  
  return (
    <g transform={`scale(${scale})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
       {[0,1,2,3,4,5,6].map(i => {
         const isHighlighted = highlights.white.includes(i);
         return (
           <rect key={`w-${i}`} x={startX + i*W_W} y={startY} width={W_W} height={W_H} fill={isHighlighted ? color : "white"} stroke="#111827" strokeWidth="1" />
         );
       })}
       {[0,1,3,4,5].map((i, idx) => {
         const isHighlighted = highlights.black.includes(idx);
         // Render black keys at the bottom of the piano
         return (
           <rect key={`b-${i}`} x={startX + (i+1)*W_W - B_W/2} y={startY + W_H - B_H} width={B_W} height={B_H} fill={isHighlighted ? color : "#111827"} />
         );
       })}
    </g>
  );
};

const CircleOfFifths = ({ onChordSelect }) => {
  const [hoveredChord, setHoveredChord] = useState(null);
  const [activeChord, setActiveChord] = useState(null);

  const handleSelect = (id, type) => {
    setActiveChord(`${id}-${type}`);
    const primaryId = id.includes('/') ? id.split('/')[0] : id;
    const context = getChordContext(primaryId, type);
    if (onChordSelect && context) onChordSelect(context);
    
    audioEngine.init().then(() => {
      if (context && context.notes) {
          audioEngine.playChord(context.notes);
      }
    }).catch(console.error);
  };

  const renderWedge = (keyObj, isMajor) => {
    const baseAngle = keyObj.i * 30 - 15;
    const startAngle = baseAngle - 15;
    const endAngle = baseAngle + 15;
    const textAngle = baseAngle;
    
    const inner = isMajor ? MINOR_R : INNER_R;
    const outer = isMajor ? MAJOR_R : MINOR_R;
    
    const d = describeArc(CX, CY, inner, outer, startAngle, endAngle);
    
    let fill = isMajor ? COLORS.darkGrey : COLORS.midGrey;
    const chordId = isMajor ? keyObj.maj : keyObj.min;
    const chordType = isMajor ? 'major' : 'minor';
    const key = `${chordId}-${chordType}`;
    
    if (activeChord === key) {
        fill = isMajor ? '#374151' : '#4b5563';
    } else if (hoveredChord === key) {
        fill = isMajor ? '#1f2937' : '#374151'; 
    }

    const textRadius = isMajor ? 290 : 185;
    const textPos = polarToCartesian(CX, CY, textRadius, textAngle);

    return (
      <g 
        key={`wedge-${key}`} 
        onClick={() => handleSelect(chordId, chordType)}
        onMouseEnter={() => setHoveredChord(key)}
        onMouseLeave={() => setHoveredChord(null)}
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <path 
           d={d} 
           fill={fill} 
           stroke="white" 
           strokeWidth="2"
           style={{ filter: activeChord === key ? 'brightness(1.5)' : hoveredChord === key ? 'brightness(1.2)' : 'none' }}
        />
        <text 
          x={textPos.x} 
          y={textPos.y} 
          textAnchor="middle" 
          dominantBaseline="middle"
          fill={COLORS.text}
          fontSize={isMajor ? "17" : "15"}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {chordId.toLowerCase()}
        </text>
      </g>
    );
  };

  const renderSignatureWedge = (keyObj) => {
    const baseAngle = keyObj.i * 30 - 15;
    const startAngle = baseAngle - 15;
    const endAngle = baseAngle + 15;
    const textAngle = baseAngle;
    
    const inner = MAJOR_R;
    const outer = SIG_R;
    
    const d = describeArc(CX, CY, inner, outer, startAngle, endAngle);
    
    // Move text closer to inside to have clearance from pianos, but safe from the white ring
    const textRadius = keyObj.type === 'SPLIT' ? 365 : 370;
    const textPos = polarToCartesian(CX, CY, textRadius, textAngle);

    return (
      <g key={`sig-${keyObj.i}`}>
        <path d={d} fill={COLORS.bg} stroke="white" strokeWidth="2" />
        {keyObj.type === 'SPLIT' ? (
           <g>
              <text x={textPos.x} y={textPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold">
                 <tspan fill={keyObj.p1.type === SHARPS ? COLORS.pink : COLORS.blue}>{keyObj.p1.count}</tspan>
                 <tspan fill={COLORS.textMuted}>/</tspan>
                 <tspan fill={keyObj.p2.type === SHARPS ? COLORS.pink : COLORS.blue}>{keyObj.p2.count}</tspan>
              </text>
              {(() => {
                  const p1Pos = polarToCartesian(CX, CY, 410, textAngle); 
                  const p2Pos = polarToCartesian(CX, CY, 450, textAngle); 
                  return (
                      <g>
                          {renderMiniPiano(p1Pos.x, p1Pos.y, 1.3, keyObj.p1.count, keyObj.p1.type)}
                          {renderMiniPiano(p2Pos.x, p2Pos.y, 1.3, keyObj.p2.count, keyObj.p2.type)}
                      </g>
                  );
              })()}
           </g>
        ) : (
           <g>
              <text x={textPos.x} y={textPos.y} dominantBaseline="middle" fill={keyObj.type === SHARPS ? COLORS.pink : (keyObj.type === FLATS ? COLORS.blue : COLORS.textMuted)} textAnchor="middle" fontSize="16" fontWeight="bold">
                 {keyObj.count === 0 ? "0" : keyObj.count}
              </text>
              {(() => {
                  const pianoPos = polarToCartesian(CX, CY, 435, textAngle); 
                  return renderMiniPiano(pianoPos.x, pianoPos.y, 1.8, keyObj.count, keyObj.type);
              })()}
           </g>
        )}
      </g>
    );
  };

  const renderCenter = () => {
    const leftD = describeArc(CX, CY, 0, INNER_R, 180, 360);
    const rightD = describeArc(CX, CY, 0, INNER_R, 0, 180);
    return (
      <g>
        <path d={leftD} fill={COLORS.blue} stroke={COLORS.stroke} strokeWidth="2" />
        <path d={rightD} fill={COLORS.pink} stroke={COLORS.stroke} strokeWidth="2" />
        <text x={CX - 40} y={CY + 15} fontSize="60" fill="white" fontWeight="bold">♭</text>
        <text x={CX + 15} y={CY + 20} fontSize="60" fill="white" fontWeight="bold">♯</text>
      </g>
    );
  };

  const renderCurvedTextLabels = () => {
    const sigPath = getArcPath(CX, CY, 500, -30, 30);
    const majPath = getArcPath(CX, CY, MAJOR_R, -25, 25);
    const minPath = getArcPath(CX, CY, MINOR_R, -25, 25);

    return (
      <g>
        <path id="path-sig" d={sigPath} fill="none" stroke="none" />
        <path id="path-maj" d={majPath} fill="none" stroke="none" />
        <path id="path-min" d={minPath} fill="none" stroke="none" />

        <text fill="white" fontWeight="800" fontSize="16" letterSpacing="1" dominantBaseline="middle">
          <textPath href="#path-sig" startOffset="50%" textAnchor="middle">KEY SIGNATURES</textPath>
        </text>
        <text fill="#0f172a" fontWeight="900" fontSize="14" letterSpacing="1" dominantBaseline="middle">
          <textPath href="#path-maj" startOffset="50%" textAnchor="middle">MAJOR KEYS</textPath>
        </text>
        <text fill="#0f172a" fontWeight="900" fontSize="13" letterSpacing="1" dominantBaseline="middle">
          <textPath href="#path-min" startOffset="50%" textAnchor="middle">MINOR KEYS</textPath>
        </text>
      </g>
    );
  };

  const renderKeysTitleAndArrows = () => {
      // Due to the expanded grey ring at 500, arrows must be bumped
      const arrowR = 500 + 40; // 540
      const textR = arrowR; // The text sits natively ON the line to mask it just like the provided images!
      
      // Right Arrow (Fifths): Spans perfectly from 12 o'clock (0) to 3 o'clock (90).
      const dFifthsLine = getArcPath(CX, CY, arrowR, 0, 90);
      const dFifthsText = getArcPath(CX, CY, textR, 0, 90);
      
      // Left Arrow (Fourths): Spans perfectly from 9 o'clock (270) down to 6 o'clock (180).
      const dFourthsLine = getArcPathCCW(CX, CY, arrowR, 270, 180);
      const dFourthsText = getArcPathCCW(CX, CY, textR, 270, 180);

      return (
          <g>
               {/* --- RIGHT ARROW (FIFTHS) --- */}
               <path d={dFifthsLine} fill="none" stroke="white" strokeWidth="3" markerEnd="url(#arrow-fifths)"/>
               <path id="path-fifths-text" d={dFifthsText} fill="none" stroke="none" />
               
               {/* Mask layer to break the line */}
               <text letterSpacing="3" fontWeight="bold" fontSize="15" dominantBaseline="middle" stroke={COLORS.bg} strokeWidth="16" strokeLinejoin="round" textAnchor="middle">
                  <textPath href="#path-fifths-text" startOffset="50%">
                      <tspan>CIRCLE OF </tspan>
                      <tspan>FIFTHS</tspan>
                  </textPath>
               </text>
               {/* Foreground text */}
               <text letterSpacing="3" fontWeight="bold" fontSize="15" dominantBaseline="middle" textAnchor="middle">
                  <textPath href="#path-fifths-text" startOffset="50%">
                      <tspan fill="white">CIRCLE OF </tspan>
                      <tspan fill={COLORS.pink}>FIFTHS</tspan>
                  </textPath>
               </text>
               
               {/* --- LEFT ARROW (FOURTHS) --- */}
               <path d={dFourthsLine} fill="none" stroke="white" strokeWidth="3" markerEnd="url(#arrow-fourths)"/>
               <path id="path-fourths-text" d={dFourthsText} fill="none" stroke="none" />
               
               {/* Mask layer to break the line */}
               <text letterSpacing="3" fontWeight="bold" fontSize="15" dominantBaseline="middle" stroke={COLORS.bg} strokeWidth="16" strokeLinejoin="round" textAnchor="middle">
                  <textPath href="#path-fourths-text" startOffset="50%">
                      <tspan>CIRCLE OF </tspan>
                      <tspan>FOURTHS</tspan>
                  </textPath>
               </text>
               {/* Foreground text */}
               <text letterSpacing="3" fontWeight="bold" fontSize="15" dominantBaseline="middle" textAnchor="middle">
                  <textPath href="#path-fourths-text" startOffset="50%">
                      <tspan fill="white">CIRCLE OF </tspan>
                      <tspan fill={COLORS.blue}>FOURTHS</tspan>
                  </textPath>
               </text>
          </g>
      )
  };

  return (
    <div className="circle-of-fifths-container" style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="-100 -100 1200 1200" style={{ width: '100%', height: '100%', maxHeight: '800px' }}>
        <defs>
            <marker id="arrow-fifths" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="white"/>
            </marker>
            <marker id="arrow-fourths" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="white"/>
            </marker>
        </defs>

        {KEYS.map(k => renderSignatureWedge(k))}
        {KEYS.map(k => renderWedge(k, true))}
        {KEYS.map(k => renderWedge(k, false))}
        {renderCenter()}

        <circle cx={CX} cy={CY} r={MINOR_R} fill="none" stroke="white" strokeWidth="26" />
        <circle cx={CX} cy={CY} r={MAJOR_R} fill="none" stroke="white" strokeWidth="26" />
        <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="white" strokeWidth="4" />
        
        {/* The 4th FAT dark grey outer ring carrying the KEY SIGNATURES label */}
        <circle cx={CX} cy={CY} r={500} fill="none" stroke="#374151" strokeWidth="26" />

        {renderCurvedTextLabels()}
        {renderKeysTitleAndArrows()}
      </svg>
    </div>
  );
};

export default CircleOfFifths;
