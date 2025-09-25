const KEY_NAMES = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

export function mapKeyToStr(keyNum: number | null, mode: 0 | 1 | null): string | null {
  if (keyNum == null || mode == null) return null;
  if (keyNum < 0 || keyNum > 11) return null;
  
  const keyName = KEY_NAMES[keyNum];
  const modeName = mode === 1 ? "major" : "minor";
  
  return `${keyName} ${modeName}`;
}
