import React, { useMemo, useState, useRef, useEffect } from 'react';
import { audioEngine } from '../utils/AudioEngine';
import { MAJOR, MINOR, DOM_MAJOR, DOM_MINOR, DIMINISHED, MAJ7, MIN7, SUS4, SUS2, ADD9, DIM7, M7B5, getChordContext } from '../utils/MusicTheory';

const TYPE_COLORS = {
  major: 'var(--color-major)',
  minor: 'var(--color-minor)',
  dom7: 'var(--color-dom7)',
  dim: 'var(--color-dim)',
  maj7: 'var(--color-maj7)',
  min7: 'var(--color-min7)',
  sus4: 'var(--color-sus4)',
  sus2: 'var(--color-sus2)',
  add9: 'var(--color-add9)',
  dim7: 'var(--color-dim7)',
  m7b5: 'var(--color-m7b5)'
};

const RINGS = [
  { type: 'dim', items: DIMINISHED, r: 120 },
  { type: 'm7b5', items: M7B5, r: 200 },
  { type: 'dim7', items: DIM7, r: 280 },
  { type: 'minor', items: MINOR, r: 360 },
  { type: 'major', items: MAJOR, r: 440 },
  { type: 'sus2', items: SUS2, r: 520 },
  { type: 'sus4', items: SUS4, r: 600 },
  { type: 'dom7', items: DOM_MAJOR, r: 680 },
  { type: 'min7', items: MIN7, r: 760 },
  { type: 'maj7', items: MAJ7, r: 840 },
  { type: 'add9', items: ADD9, r: 920 }
];

const ChordGraph = ({ onChordSelect, showExtended = true }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const scrollRef = useRef(null);

  // Center the scroll automatically on mount
  useEffect(() => {
     if (scrollRef.current) {
        const el = scrollRef.current;
        el.scrollTo({ left: 1000 - el.clientWidth / 2, top: 1000 - el.clientHeight / 2 });
     }
  }, []);

  const cx = 1000;
  const cy = 1000;
  const NODE_RADIUS = 32;

  const visibleRings = useMemo(() => {
     let filtered = RINGS;
     if (!showExtended) {
         filtered = RINGS.filter(r => ['dim', 'minor', 'major', 'dom7'].includes(r.type));
     }
     return filtered.map((r, idx) => ({
         ...r,
         dynamicRadius: showExtended ? r.r : 160 + idx * 100
     }));
  }, [showExtended]);

  const nodes = useMemo(() => {
    const all = [];
    visibleRings.forEach((ring, ringIdx) => {
        for (let i = 0; i < 12; i++) {
            // Alternate rotation for adjacent rings to create a spider web aesthetic
            const angleOffset = (ringIdx % 2 === 0 ? 0 : 15) * (Math.PI / 180); 
            const baseAngle = (i / 12) * Math.PI * 2 - Math.PI / 2 + angleOffset;
            
            const context = getChordContext(ring.items[i], ring.type);
            all.push({
               key: `${ring.type}_${i}`,
               id: ring.items[i],
               type: ring.type,
               x: cx + ring.dynamicRadius * Math.cos(baseAngle),
               y: cy + ring.dynamicRadius * Math.sin(baseAngle),
               notes: context.notes,
               context: context
            });
        }
    });

    return all;
  }, [visibleRings]);

  const links = useMemo(() => {
    const all = [];
    for (let i = 0; i < 12; i++) {
        const nextI = (i + 1) % 12; // Direction of fifths resolving G -> C
        
        // Connect consecutive rings
        for (let r = 0; r < visibleRings.length - 1; r++) {
            // Because odd rings are offset by 15deg, the path isn't perfectly straight, 
            // It makes a zig-zag radial outward pattern.
            all.push({ source: `${visibleRings[r].type}_${i}`, target: `${visibleRings[r+1].type}_${i}`, type: 'uni' });
        }
        
        // Circle of fifths across the major ring
        all.push({ source: `major_${nextI}`, target: `major_${i}`, type: 'uni' });
        // Circle of fifths across the minor ring
        all.push({ source: `minor_${nextI}`, target: `minor_${i}`, type: 'uni' });
        
        // Major to Minor relative (cross link, but since they are adjacent rings, maybe not needed, 
        // but let's connect them directly because they share identical angle due to my alternating trick?
        // Wait: major is ring 4 (even, 0 offset). minor is ring 3 (odd, 15 offset). 
        // We already connect them in the consecutive ring loop!
        
        // Diminished to center
        all.push({ source: `dim_${i}`, target: 'center', type: 'uni' });
    }
    return all;
  }, [visibleRings]);

  const handleNodeClick = (node) => {
    setActiveNode(node.key);
    if (onChordSelect) onChordSelect(node.context);
    
    // Call Audio Engine safely
    audioEngine.init().then(() => {
        audioEngine.playChord(node.notes);
    }).catch(console.error);
  };

  return (
    <div 
       className="chord-graph-container" 
       ref={scrollRef}
       style={{ 
           width: '100%', height: '100%', 
           overflow: 'auto', 
           display: 'flex', 
           alignItems: 'flex-start', 
           justifyContent: 'flex-start',
           cursor: 'grab' // Indicate draggable (though we just use scroll bars for now)
       }}
    >
      <svg viewBox="0 0 2000 2000" style={{ width: '2000px', height: '2000px', flexShrink: 0, minWidth: '2000px' }}>
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.2)"/>
          </marker>
          <marker id="arrowhead-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
          </marker>
        </defs>

        {/* Draw Center Point */}
        <circle cx={cx} cy={cy} r={NODE_RADIUS / 2} fill="#fbbf24" opacity="0.3" />

        {/* Links */}
        <g opacity="0.5">
          {links.map((link, i) => {
            const s = nodes.find(n => n.key === link.source);
            let targetX, targetY;
            
            if (link.target === 'center') {
                targetX = cx; targetY = cy;
            } else {
                const t = nodes.find(n => n.key === link.target);
                if (!s || !t) return null;
                targetX = t.x; targetY = t.y;
            }
            if (!s) return null;

            const dx = targetX - s.x;
            const dy = targetY - s.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const isCenter = link.target === 'center';
            const sOffset = NODE_RADIUS + 4;
            const tOffset = isCenter ? 15 : NODE_RADIUS + 4;
            
            const startX = s.x + (dx/dist)*sOffset;
            const startY = s.y + (dy/dist)*sOffset;
            const endX = targetX - (dx/dist)*tOffset;
            const endY = targetY - (dy/dist)*tOffset;

            const isHoveredLink = hoveredNode === link.source || hoveredNode === link.target;
            const isActiveLink = activeNode === link.source || activeNode === link.target;
            
            let strokeColor = "rgba(255,255,255,0.15)";
            let opacity = 0.5;
            let strokeWidth = "1.5";
            let arrowEnd = "url(#arrowhead)";

            if (isActiveLink) {
              strokeColor = "#38bdf8"; 
              opacity = 1;
              strokeWidth = "3.5";
              arrowEnd = "url(#arrowhead-active)";
            } else if (isHoveredLink) {
              strokeColor = "#ffffff";
              opacity = 1;
              strokeWidth = "3";
            }
            
            return (
              <line 
                key={i} 
                x1={startX} y1={startY} x2={endX} y2={endY} 
                stroke={strokeColor}
                strokeWidth={strokeWidth} 
                style={{ transition: 'all 0.3s ease', opacity: opacity }}
                markerEnd={!isCenter ? arrowEnd : ""}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const isTarget = activeNode === node.key || hoveredNode === node.key;
            return (
              <g 
                key={node.key} 
                className="chord-node"
                onClick={() => handleNodeClick(node)} 
                onMouseEnter={() => setHoveredNode(node.key)} 
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={isTarget ? NODE_RADIUS + 6 : NODE_RADIUS} 
                  fill="#05070a" 
                  stroke={TYPE_COLORS[node.type]} 
                  strokeWidth={isTarget ? "4" : "3"} 
                  style={{ transition: 'all 0.2s ease', filter: isTarget ? `drop-shadow(0 0 20px ${TYPE_COLORS[node.type]})` : 'drop-shadow(0 0 6px #000)' }} 
                />
                <text 
                  x={node.x} 
                  y={node.y} 
                  textAnchor="middle" 
                  dy=".3em" 
                  fill={TYPE_COLORS[node.type]}
                  fontSize={isTarget ? "22" : "18"} 
                  fontWeight="800"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default ChordGraph;
