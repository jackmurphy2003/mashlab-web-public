// Tempo and key resolution utilities for Resolver v2

export interface TempoKeySource {
  bpm: number | null;
  keyNum: number | null;
  mode: number | null;
  confidence: number;
  source: string;
  rawBpm?: number;
  flags?: Record<string, any>;
}

export interface ResolvedTempoKey {
  bpm: number | null;
  keyNum: number | null;
  mode: number | null;
  keyStr: string | null;
  confidence: number;
  flags: Record<string, any>;
  source: string;
}

// Convert key number and mode to string
export function mapKeyToStr(keyNum: number | null, mode: number | null): string | null {
  if (keyNum === null || mode === null) return null;
  
  const keyNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const modeNames = ["minor", "major"];
  
  return `${keyNames[keyNum]} ${modeNames[mode]}`;
}

// Calculate median of array
export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Calculate trimmed mean (remove outliers)
export function trimmedMean(arr: number[], trimPercent: number = 0.1): number {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const trimCount = Math.floor(arr.length * trimPercent);
  const trimmed = sorted.slice(trimCount, -trimCount);
  
  return trimmed.reduce((sum, val) => sum + val, 0) / trimmed.length;
}

// Normalize tempo to 60-180 BPM window
export function normalizeTempo(bpm: number): { bpm: number; wasNormalized: boolean; factor: number } {
  if (bpm < 60) {
    return { bpm: bpm * 2, wasNormalized: true, factor: 2 };
  } else if (bpm > 180) {
    return { bpm: bpm / 2, wasNormalized: true, factor: 0.5 };
  }
  return { bpm, wasNormalized: false, factor: 1 };
}

// Resolve BPM from Spotify audio analysis sections
export function resolveFromAnalysis(analysisJson: any): TempoKeySource {
  if (!analysisJson || !analysisJson.sections) {
    return { bpm: null, keyNum: null, mode: null, confidence: 0, source: "spotify_analysis" };
  }
  
  const sections = analysisJson.sections || [];
  const tempos = sections
    .map((s: any) => s.tempo)
    .filter((t: number) => t && t > 0);
  
  if (tempos.length === 0) {
    return { bpm: null, keyNum: null, mode: null, confidence: 0, source: "spotify_analysis" };
  }
  
  // Use median tempo from sections
  const rawBpm = median(tempos);
  const normalized = normalizeTempo(rawBpm);
  
  // Calculate confidence based on tempo consistency
  const tempoVariance = Math.sqrt(
    tempos.reduce((sum: number, t: number) => sum + Math.pow(t - rawBpm, 2), 0) / tempos.length
  );
  const confidence = Math.max(0, Math.min(1, 1 - (tempoVariance / 50)));
  
  return {
    bpm: normalized.bpm,
    keyNum: analysisJson.key,
    mode: analysisJson.mode,
    confidence: confidence * (analysisJson.tempo_confidence || 0.5),
    source: "spotify_analysis",
    rawBpm,
    flags: {
      half_double_fix: normalized.wasNormalized,
      factor: normalized.factor
    }
  };
}

// Find consensus across multiple sources
export function consensus(sources: TempoKeySource[]): ResolvedTempoKey {
  if (sources.length === 0) {
    return {
      bpm: null,
      keyNum: null,
      mode: null,
      keyStr: null,
      confidence: 0,
      flags: {},
      source: "none"
    };
  }
  
  // Filter out sources with no data
  const validSources = sources.filter(s => s.bpm !== null || s.keyNum !== null);
  
  if (validSources.length === 0) {
    return {
      bpm: null,
      keyNum: null,
      mode: null,
      keyStr: null,
      confidence: 0,
      flags: {},
      source: "none"
    };
  }
  
  // Find best BPM source
  const bpmSources = validSources.filter(s => s.bpm !== null);
  let bestBpmSource = bpmSources[0];
  let bpmAgreement = false;
  
  if (bpmSources.length > 1) {
    // Check for agreement within ±2 BPM
    const bpmValues = bpmSources.map(s => s.bpm!);
    const medianBpm = median(bpmValues);
    
    const agreeingSources = bpmSources.filter(s => 
      Math.abs(s.bpm! - medianBpm) <= 2
    );
    
    if (agreeingSources.length >= 2) {
      bpmAgreement = true;
      // Pick the one with highest confidence
      bestBpmSource = agreeingSources.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    } else {
      // Pick highest confidence
      bestBpmSource = bpmSources.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    }
  }
  
  // Find best key source
  const keySources = validSources.filter(s => s.keyNum !== null && s.mode !== null);
  let bestKeySource = keySources[0];
  let keyAgreement = false;
  
  if (keySources.length > 1) {
    // Check for exact key agreement
    const keyPairs = keySources.map(s => `${s.keyNum}-${s.mode}`);
    const uniqueKeys = new Set(keyPairs);
    
    if (uniqueKeys.size === 1) {
      keyAgreement = true;
      // Pick highest confidence
      bestKeySource = keySources.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    } else {
      // Pick highest confidence
      bestKeySource = keySources.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    }
  }
  
  // Calculate overall confidence
  let confidence = Math.max(
    bestBpmSource?.confidence || 0,
    bestKeySource?.confidence || 0
  );
  
  // Boost confidence if sources agree
  if (bpmAgreement) confidence = Math.min(1, confidence + 0.2);
  if (keyAgreement) confidence = Math.min(1, confidence + 0.2);
  
  // Collect flags
  const flags: Record<string, any> = {
    disagreement: !bpmAgreement && bpmSources.length > 1,
    key_disagreement: !keyAgreement && keySources.length > 1,
    low_confidence: confidence < 0.5
  };
  
  // Merge flags from best sources
  if (bestBpmSource?.flags) Object.assign(flags, bestBpmSource.flags);
  if (bestKeySource?.flags) Object.assign(flags, bestKeySource.flags);
  
  return {
    bpm: bestBpmSource?.bpm || null,
    keyNum: bestKeySource?.keyNum || null,
    mode: bestKeySource?.mode || null,
    keyStr: mapKeyToStr(bestKeySource?.keyNum || null, bestKeySource?.mode || null),
    confidence,
    flags,
    source: bestBpmSource?.source || bestKeySource?.source || "consensus"
  };
}
