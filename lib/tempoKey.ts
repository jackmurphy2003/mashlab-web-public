type SpotifyAnalysis = {
  track: { 
    tempo?: number; 
    tempo_confidence?: number; 
    key?: number; 
    key_confidence?: number; 
    mode?: 0|1; 
    time_signature?: number; 
  };
  sections?: { tempo?: number; tempo_confidence?: number }[];
};

export function mapKeyToStr(keyNum?: number|null, mode?: 0|1|null): string|null {
  if (keyNum == null || mode == null) return null;
  const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return `${notes[keyNum % 12]} ${mode === 1 ? "major" : "minor"}`;
}

function median(nums: number[]) {
  if (!nums.length) return NaN;
  const a = [...nums].sort((x,y)=>x-y);
  const m = Math.floor(a.length/2);
  return a.length % 2 ? a[m] : (a[m-1]+a[m])/2;
}

function trimmedMean(nums: number[], trim = 0.1) {
  if (!nums.length) return NaN;
  const a = [...nums].sort((x,y)=>x-y);
  const k = Math.floor(a.length * trim);
  const b = a.slice(k, a.length - k);
  return b.reduce((s,n)=>s+n,0) / Math.max(1,b.length);
}

function normalizeTempo(bpm: number, tsig?: number) {
  // canonical window
  let v = bpm;
  if (v > 190) v = v/2;
  if (v < 60)  v = v*2;
  // For triple meters (3/6/12) we may allow a bit wider, but keep it simple for now.
  return v;
}

export function resolveTempoKeyFromAnalysis(ana: SpotifyAnalysis) {
  const t = ana.track || {};
  const secs = (ana.sections || []).map(s => s.tempo).filter((n): n is number => typeof n === "number" && n > 0);
  const secMedian = median(secs);
  const secTrim = trimmedMean(secs, 0.15);

  const rawTempoCandidates = [
    { value: t.tempo ?? NaN, source: "analysis.track", conf: t.tempo_confidence ?? 0 },
    { value: secMedian, source: "analysis.sections.median", conf: 0.7 },
    { value: secTrim, source: "analysis.sections.tmean", conf: 0.7 },
  ].filter(c => Number.isFinite(c.value));

  // Pick the highest confidence candidate closest to sections' central tendency
  const center = Number.isFinite(secTrim) ? secTrim : (t.tempo ?? NaN);
  rawTempoCandidates.sort((a,b) => (b.conf - a.conf) || (Math.abs((center??0)-a.value) - Math.abs((center??0)-b.value)));
  const chosenTempo = rawTempoCandidates[0]?.value;
  const normalized = Number.isFinite(chosenTempo) ? normalizeTempo(chosenTempo!, t.time_signature) : null;

  const key_num = Number.isFinite(t.key ?? NaN) ? t.key! : null;
  const mode = (t.mode === 0 || t.mode === 1) ? t.mode : null;
  const key_str = mapKeyToStr(key_num, mode);
  const key_conf = t.key_confidence ?? 0;
  const tempo_conf = t.tempo_confidence ?? 0;

  const confidence =
    (Number.isFinite(chosenTempo) ? 0.5 : 0) +
    (key_num != null ? 0.2 : 0) +
    (secs.length > 6 ? 0.3 : 0);

  const flags: Record<string, boolean> = {};
  if (normalized != null && chosenTempo != null && Math.abs(chosenTempo - normalized) > 1.5) {
    flags["half_double_fix"] = true;
  }
  if ((tempo_conf ?? 0) < 0.6) flags["low_tempo_conf"] = true;
  if ((key_conf ?? 0) < 0.4) flags["low_key_conf"] = true;

  return {
    bpm: normalized ?? null,
    raw_bpm: chosenTempo ?? null,
    key_num, mode, key_str,
    confidence: Math.max(0, Math.min(1, confidence)),
    flags
  };
}
