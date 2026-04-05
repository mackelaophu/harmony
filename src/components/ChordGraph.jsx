import React, { useMemo, useState } from 'react';
import { audioEngine } from '../utils/AudioEngine';
import { MAJOR, MINOR, DOM_MAJOR, DOM_MINOR, DIMINISHED, getChordContext } from '../utils/MusicTheory';

const TYPE_COLORS = {
  major: 'var(--color-major)',
  minor: 'var(--color-minor)',
  dom7: 'var(--color-dom7)',
  dim: 'var(--color-dim)'
};

const ChordGraph = ({ onChordSelect }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeNode, setActiveNode] = useState(null);

  const cx = 500;
  const cy = 500;
  
  // Adjusted radii for the dense Tonnetz look
  const R_MAJOR = 420;
  const R_MINOR = 340;
  const R_DOM = 260;
  const R_DIM = 140;
  const NODE_RADIUS = 30;

  const nodes = useMemo(() => {
    const all = [];
    for (let i = 0; i < 12; i++) {
      const baseAngle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const offset15 = (15 / 180) * Math.PI;
      const offset7_5 = (7.5 / 180) * Math.PI;

      // 1. Major Ring (Outer)
      const cMaj = getChordContext(MAJOR[i], 'major');
      all.push({ 
        key: `maj_${i}`, id: MAJOR[i], type: 'major', 
        x: cx + R_MAJOR * Math.cos(baseAngle), 
        y: cy + R_MAJOR * Math.sin(baseAngle), 
        notes: cMaj.notes, context: cMaj 
      });
      
      // 2. Minor Ring (Interleaved Outer)
      const minorAngle = baseAngle + offset15;
      const cMin = getChordContext(MINOR[i], 'minor');
      all.push({ 
        key: `min_${i}`, id: MINOR[i], type: 'minor', 
        x: cx + R_MINOR * Math.cos(minorAngle), 
        y: cy + R_MINOR * Math.sin(minorAngle), 
        notes: cMin.notes, context: cMin 
      });
      
      // 3. Dom7 for Major (Yellow Ring)
      const domMajAngle = baseAngle - offset7_5;
      const cDomMaj = getChordContext(DOM_MAJOR[i], 'dom7');
      all.push({ 
        key: `domMaj_${i}`, id: DOM_MAJOR[i], type: 'dom7', 
        x: cx + R_DOM * Math.cos(domMajAngle), 
        y: cy + R_DOM * Math.sin(domMajAngle), 
        notes: cDomMaj.notes, context: cDomMaj 
      });
      
      // 4. Dom7 for Minor (Yellow Ring)
      const domMinAngle = minorAngle - offset7_5;
      const cDomMin = getChordContext(DOM_MINOR[i], 'dom7');
      all.push({ 
        key: `domMin_${i}`, id: DOM_MINOR[i], type: 'dom7', 
        x: cx + R_DOM * Math.cos(domMinAngle), 
        y: cy + R_DOM * Math.sin(domMinAngle), 
        notes: cDomMin.notes, context: cDomMin 
      });
      
      // 5. Diminished (Inner Star)
      const cDim = getChordContext(DIMINISHED[i], 'dim');
      all.push({ 
        key: `dim_${i}`, id: DIMINISHED[i], type: 'dim', 
        x: cx + R_DIM * Math.cos(baseAngle), 
        y: cy + R_DIM * Math.sin(baseAngle), 
        notes: cDim.notes, context: cDim 
      });
    }
    return all;
  }, []);

  const links = useMemo(() => {
    const all = [];
    for (let i = 0; i < 12; i++) {
        const nextI = (i + 1) % 12; // Direction of fifths resolving G -> C (idx 1 -> idx 0).
        
        // C <-> Am (Relative)
        all.push({ source: `maj_${i}`, target: `min_${i}`, type: 'bidir' });
        
        // Circle of Fifths (Outer borders)
        all.push({ source: `maj_${nextI}`, target: `maj_${i}`, type: 'uni' }); // G -> C
        all.push({ source: `min_${nextI}`, target: `min_${i}`, type: 'uni' }); // Em -> Am
  
        // Dominant Resolutions
        all.push({ source: `domMaj_${i}`, target: `maj_${i}`, type: 'uni' }); // G7 -> C
        all.push({ source: `domMin_${i}`, target: `min_${i}`, type: 'uni' }); // E7 -> Am
        
        // Diminished Resolutions
        all.push({ source: `dim_${i}`, target: `maj_${i}`, type: 'uni' }); // B° -> C
        all.push({ source: `dim_${i}`, target: `min_${i}`, type: 'uni' }); // B° -> Am
        
        // Central star lines (from Dim to center)
        all.push({ source: `dim_${i}`, target: 'center', type: 'uni' });
    }
    return all;
  }, []);

  const handleNodeClick = (node) => {
    setActiveNode(node.key);
    if (onChordSelect) onChordSelect(node.context);
    
    // Call Audio Engine directly without setTimeout, but separated in an async wrapper
    // so it doesn't block the UI sync state in case of failure.
    const playAudio = async () => {
        try {
            await audioEngine.init();
            audioEngine.playChord(node.notes);
        } catch (error) {
            console.warn('Audio Context failed to start', error);
        }
    };
    playAudio();
  };

  return (
    <div className="chord-graph-container">
      <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%', maxHeight: '800px' }}>
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" opacity="0.8"/>
          </marker>
          <marker id="arrowhead-white" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" opacity="1"/>
          </marker>
          <marker id="arrowhead-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" opacity="1"/>
          </marker>
          <marker id="arrowhead-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" opacity="0.8"/>
          </marker>
          <marker id="arrowhead-start-white" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" opacity="1"/>
          </marker>
          <marker id="arrowhead-start-active" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" opacity="1"/>
          </marker>
        </defs>

        {/* Draw Center Cross (Reticle) */}
        <g stroke="#fbbf24" strokeWidth="3" opacity="0.5">
            <line x1={cx - 15} y1={cy} x2={cx + 15} y2={cy} />
            <line x1={cx} y1={cy - 15} x2={cx} y2={cy + 15} />
        </g>

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

            // Offset endpoints to avoid drawing inside the circular node
            const dx = targetX - s.x;
            const dy = targetY - s.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const isCenter = link.target === 'center';
            const sOffset = NODE_RADIUS + 4;
            const tOffset = isCenter ? 20 : NODE_RADIUS + 4;
            
            const startX = s.x + (dx/dist)*sOffset;
            const startY = s.y + (dy/dist)*sOffset;
            const endX = targetX - (dx/dist)*tOffset;
            const endY = targetY - (dy/dist)*tOffset;

            const isHoveredLink = hoveredNode === link.source || hoveredNode === link.target;
            const isActiveLink = activeNode === link.source || activeNode === link.target;
            
            let strokeColor = "#fbbf24";
            let opacity = 0.8;
            let strokeWidth = "1.5";
            let arrowEnd = "url(#arrowhead)";
            let arrowStart = "url(#arrowhead-start)";

            if (isActiveLink) {
              strokeColor = "#38bdf8"; // Bright Cyan active path
              opacity = 1;
              strokeWidth = "3.5";
              arrowEnd = "url(#arrowhead-active)";
              arrowStart = "url(#arrowhead-start-active)";
            } else if (isHoveredLink) {
              strokeColor = "#ffffff";
              opacity = 1;
              strokeWidth = "3";
              arrowEnd = "url(#arrowhead-white)";
              arrowStart = "url(#arrowhead-start-white)";
            }
            
            return (
              <line 
                key={i} 
                x1={startX} y1={startY} x2={endX} y2={endY} 
                stroke={strokeColor}
                strokeWidth={strokeWidth} 
                style={{ transition: 'all 0.3s ease', opacity: opacity }}
                markerEnd={!isCenter ? arrowEnd : ""}
                markerStart={link.type === 'bidir' ? arrowStart : ""}
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
                  style={{ transition: 'all 0.2s ease', filter: isTarget ? `drop-shadow(0 0 20px ${TYPE_COLORS[node.type]})` : 'drop-shadow(0 0 6px rgba(0,0,0,1))' }} 
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
