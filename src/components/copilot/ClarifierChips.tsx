import React from 'react';
import { Brief } from '../../state/useCopilot';

const colors = {
  accentPrimary: "#7aa7ff",
  accentSecondary: "#9a6bff",
  text: "#E8EEFF",
  muted: "#9AA6C3",
  surface: "#141a33",
};

interface ClarifierChipsProps {
  missing: string[];
  brief: Brief;
  onAnswer: (field: string, value: any) => Promise<void>;
}

const chipOptions: Record<string, any[]> = {
  duration_min: [30, 45, 60, 90, 120, 180],
  audience: ['college', 'club', 'festival', 'wedding', 'corporate', 'house party'],
  genres: ['hip-hop', 'pop', 'electronic', 'rock', 'indie', 'rnb', 'country', 'reggaeton'],
  eras: ['2000s', '2010s', '2020s', '90s', '80s'],
  energy_curve: ['building', 'peak-heavy', 'steady', 'roller-coaster', 'chill-out'],
  familiarity_bias: ['low', 'medium', 'high'],
  explicit_ok: [true, false],
  must_include: [], // Free text
  must_exclude: [] // Free text
};

export default function ClarifierChips({ missing, brief, onAnswer }: ClarifierChipsProps) {
  const handleChipClick = async (field: string, value: any) => {
    await onAnswer(field, value);
  };

  const handleMultipleSelect = async (field: string, value: any) => {
    const currentValues = (brief as any)[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: any) => v !== value)
      : [...currentValues, value];
    
    await onAnswer(field, newValues);
  };

  const renderChip = (field: string, value: any, label?: string) => {
    const isSelected = Array.isArray((brief as any)[field])
      ? (brief as any)[field].includes(value)
      : (brief as any)[field] === value;

    return (
      <button
        key={`${field}-${value}`}
        onClick={() => {
          if (Array.isArray((brief as any)[field])) {
            handleMultipleSelect(field, value);
          } else {
            handleChipClick(field, value);
          }
        }}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          isSelected ? 'ring-2 ring-offset-1' : ''
        }`}
        style={{
          backgroundColor: isSelected 
            ? colors.accentPrimary 
            : 'rgba(255,255,255,0.1)',
          color: isSelected ? '#000' : colors.text,
          borderColor: isSelected ? colors.accentPrimary : 'transparent'
        }}
      >
        {label || value}
      </button>
    );
  };

  const renderField = (field: string) => {
    const options = chipOptions[field];
    if (!options) return null;

    const fieldLabels: Record<string, string> = {
      duration_min: 'Duration (minutes)',
      audience: 'Audience',
      genres: 'Genres',
      eras: 'Eras',
      energy_curve: 'Energy Curve',
      familiarity_bias: 'Familiarity',
      explicit_ok: 'Explicit Content OK?',
      must_include: 'Must Include',
      must_exclude: 'Must Exclude'
    };

    return (
      <div key={field} className="mb-4">
        <h4 
          className="text-sm font-medium mb-2"
          style={{ color: colors.text }}
        >
          {fieldLabels[field]}
        </h4>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            if (typeof option === 'boolean') {
              return renderChip(field, option, option ? 'Yes' : 'No');
            }
            return renderChip(field, option);
          })}
        </div>
      </div>
    );
  };

  if (missing.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 
        className="text-sm font-semibold"
        style={{ color: colors.text }}
      >
        Quick Questions:
      </h3>
      {missing.map(renderField)}
    </div>
  );
}
