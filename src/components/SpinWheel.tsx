import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Prize {
  id: number;
  text: string;
  color: string;
  textColor: string;
  canWin: boolean;
}

const prizes: Prize[] = [
  { id: 1, text: 'FREE RENT', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 2, text: 'FREE RENT', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
  { id: 3, text: 'FREE RENT', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 4, text: '1 YEAR FREE', color: '#0F766E', textColor: '#FFFFFF', canWin: false },
  { id: 5, text: 'FREE RENT', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 6, text: 'FREE RENT', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
  { id: 7, text: 'FREE RENT', color: '#F59E0B', textColor: '#FFFFFF', canWin: true },
  { id: 8, text: 'FREE RENT', color: '#0F766E', textColor: '#FFFFFF', canWin: true },
];

interface SpinWheelProps {
  onSpin: (prize: string) => void;
  isSpinning: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onSpin, isSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = () => {
    if (isSpinning) return;

    // Filter out prizes that can't win
    const winnablePrizes = prizes.filter(prize => prize.canWin);
    const randomWinnablePrize = winnablePrizes[Math.floor(Math.random() * winnablePrizes.length)];
    
    // Find the index of the selected prize in the original array
    const prizeIndex = prizes.findIndex(prize => prize.id === randomWinnablePrize.id);
    
    // Calculate the angle for each segment (360 degrees / 8 segments = 45 degrees each)
    const segmentAngle = 360 / prizes.length;
    const targetAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
    
    // Add multiple full rotations for effect (5-8 full rotations)
    const fullRotations = (Math.floor(Math.random() * 4) + 5) * 360;
    const finalRotation = fullRotations + (360 - targetAngle);
    
    setRotation(prev => prev + finalRotation);
    
    // Call onSpin after animation completes
    setTimeout(() => {
      onSpin(randomWinnablePrize.text);
    }, 3000);
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600"></div>
        </div>
        
        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-96 h-96 rounded-full relative overflow-hidden shadow-2xl border-8 border-yellow-400"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {prizes.map((prize, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            return (
              <div
                key={prize.id}
                className="absolute w-full h-full"
                style={{
                  background: `conic-gradient(from ${startAngle}deg, ${prize.color} 0deg, ${prize.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`,
                }}
              >
                <div
                  className="absolute text-sm font-bold transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    color: prize.textColor,
                    left: `${50 + 35 * Math.cos((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}%`,
                    top: `${50 + 35 * Math.sin((startAngle + segmentAngle/2 - 90) * Math.PI / 180)}%`,
                    transform: `translate(-50%, -50%) rotate(${startAngle + segmentAngle/2}deg)`,
                  }}
                >
                  {prize.text}
                </div>
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-lg"></div>
        </motion.div>
      </div>
      
      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="mt-8 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL!'}
      </button>
    </div>
  );
};