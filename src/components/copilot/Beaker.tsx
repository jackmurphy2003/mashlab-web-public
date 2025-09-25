import React from 'react';
import { Phase } from '../../state/useCopilot';

const colors = {
  accentPrimary: "#7aa7ff",
  accentSecondary: "#9a6bff",
  text: "#E8EEFF",
  muted: "#9AA6C3",
  surface: "#141a33",
};

interface BeakerProps {
  percent: number;
  label: string;
  phase: Phase;
}

const stages = [
  'Gathering songs',
  'Enriching BPM/Key', 
  'Sequencing',
  'Done'
];

export default function Beaker({ percent, label, phase }: BeakerProps) {
  const currentStage = Math.floor((percent / 100) * stages.length);
  const activeStage = Math.min(currentStage, stages.length - 1);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Beaker Visual */}
      <div className="relative">
        <div
          className="w-24 h-32 rounded-b-full border-4 relative overflow-hidden"
          style={{
            borderColor: colors.accentPrimary,
            backgroundColor: 'rgba(255,255,255,0.05)'
          }}
        >
          {/* Liquid */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{
              height: `${percent}%`,
              background: `linear-gradient(180deg, ${colors.accentPrimary} 0%, ${colors.accentSecondary} 100%)`,
              borderRadius: '0 0 2rem 2rem'
            }}
          />
          
          {/* Bubbles */}
          {phase === 'brewing' && (
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce opacity-60"
                  style={{
                    backgroundColor: colors.accentPrimary,
                    left: `${20 + i * 30}%`,
                    bottom: `${20 + i * 10}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Beaker Spout */}
        <div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-l-4 border-t-4 border-r-4"
          style={{
            borderColor: colors.accentPrimary,
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent'
          }}
        />
      </div>

      {/* Progress Text */}
      <div className="text-center">
        <div 
          className="text-2xl font-bold mb-1"
          style={{ color: colors.text }}
        >
          {percent}%
        </div>
        <div 
          className="text-sm"
          style={{ color: colors.muted }}
        >
          {label}
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="flex space-x-4">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="flex flex-col items-center space-y-1"
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= activeStage ? 'scale-110' : ''
              }`}
              style={{
                backgroundColor: index <= activeStage 
                  ? colors.accentPrimary 
                  : 'rgba(255,255,255,0.2)'
              }}
            />
            <div 
              className={`text-xs text-center max-w-16 transition-colors ${
                index === activeStage ? 'font-semibold' : ''
              }`}
              style={{
                color: index === activeStage ? colors.text : colors.muted
              }}
            >
              {stage}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${colors.accentPrimary} 0%, ${colors.accentSecondary} 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
