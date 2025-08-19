import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Prize {
  id: number;
  text: string;
  color: string;
  textColor: string;
  canWin: boolean;
}

const prizes: Prize[] = [
  { id: 1, text: 'FREE RENT 1 YEAR', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 2, text: 'FREE RENT 1 MONTH', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
  { id: 3, text: 'FREE RENT 1 YEAR', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 4, text: 'FREE RENT 1 MONTH', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
  { id: 5, text: 'FREE RENT 1 YEAR', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 6, text: 'FREE RENT 1 MONTH', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
  { id: 7, text: 'FREE RENT 1 YEAR', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 8, text: 'FREE RENT 1 MONTH', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
];

interface SpinWheelProps {
  onSpin: (prize: string) => void;
  isSpinning: boolean;
  canSpin?: boolean;
  triggerSpin?: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onSpin, isSpinning, canSpin = false, triggerSpin = false }) => {
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Auto-trigger spin when triggerSpin prop changes to true
  useEffect(() => {
    if (triggerSpin && canSpin && !isSpinning) {
      handleSpin();
    }
  }, [triggerSpin, canSpin, isSpinning]);

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setActiveIndex(null);

    // Force 100% probability: always pick a '1 MONTH' segment
    const upper = prizes.map((p) => p.text.toUpperCase());
    const monthIndices = upper.map((t, i) => ({ t, i })).filter(({ t }) => t.includes('1 MONTH')).map(({ i }) => i);
    const pool = monthIndices.length ? monthIndices : prizes.map((_, i) => i);
    const chosenIndex = pool[Math.floor(Math.random() * pool.length)];
    const randomPrize = prizes[chosenIndex];
    
    // Find the index of the selected prize in the original array
    const prizeIndex = chosenIndex;
    
    // Each segment is 45 degrees (360/8)
    const segmentAngle = 360 / prizes.length;
    
    // Calculate the center angle of the selected segment (0° is TOP in our SVG)
    const segmentCenterAngle = prizeIndex * segmentAngle + (segmentAngle / 2);
    
    // Current rotation normalized (0..359)
    const current = ((rotation % 360) + 360) % 360;
    
    // Align the selected segment's center to the top pointer (0°)
    const alignDelta = ((0 - segmentCenterAngle - current) % 360 + 360) % 360; // 0..359
    
    // Add multiple full rotations for effect (5-8 full rotations)
    const fullRotations = (Math.floor(Math.random() * 4) + 5) * 360;
    const finalRotation = fullRotations + alignDelta;
    
    setRotation(rotation + finalRotation);
    
    // Call onSpin after animation completes
    setTimeout(() => {
      setActiveIndex(prizeIndex);
      onSpin(randomPrize.text);
    }, 3000);
  };

  const radius = 180;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" className="block mx-auto">
            <polygon points="188,166 212,166 200,140" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
          </svg>
        </div>
        
        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-2xl">
            {/* Wheel segments */}
            {prizes.map((prize, index) => {
              const segmentAngle = 360 / prizes.length;
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              
              // Convert angles to radians
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              
              // Calculate arc coordinates
              const x1 = centerX + radius * Math.cos(startRad);
              const y1 = centerY + radius * Math.sin(startRad);
              const x2 = centerX + radius * Math.cos(endRad);
              const y2 = centerY + radius * Math.sin(endRad);
              
              // Create path for segment
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const isActive = activeIndex === index;
              
              return (
                <g key={prize.id}>
                  <path
                    d={pathData}
                    fill={prize.color}
                    stroke={isActive ? '#F59E0B' : '#ffffff'}
                    strokeWidth={isActive ? 8 : 2}
                    filter={isActive ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' : 'none'}
                  />
                  {isActive && (
                    <path
                      d={pathData}
                      fill="rgba(255, 255, 255, 0.12)"
                    />
                  )}
                  {/* Text */}
                  {(() => {
                    const segmentMidRad = (startAngle + segmentAngle / 2 - 90) * Math.PI / 180;
                    const labelX = centerX + (radius * 0.7) * Math.cos(segmentMidRad);
                    const labelY = centerY + (radius * 0.7) * Math.sin(segmentMidRad);
                    const main = 'FREE RENT';
                    const rest = prize.text.replace(/^FREE RENT\s*/i, '').trim();
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={prize.textColor}
                        fontWeight="bold"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        <tspan x={labelX} dy={-4} fontSize={isActive ? '16' : '14'}>{main}</tspan>
                        {rest && (
                          <tspan x={labelX} dy={isActive ? 18 : 16} fontSize={isActive ? '14' : '12'}>{rest}</tspan>
                        )}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r="32"
              fill="#F59E0B"
              stroke="#ffffff"
              strokeWidth="4"
            />
          </svg>
        </motion.div>

        {/* Non-rotating SPIN label overlay */}
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div
            style={{
              width: '400px',
              height: '400px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '1px'
              }}
            >
              SPIN
            </div>
          </div>
        </div>
      </div>
      
      {/* Spin Button - REMOVED: Spin happens automatically after email submission */}
    </div>
  );
};