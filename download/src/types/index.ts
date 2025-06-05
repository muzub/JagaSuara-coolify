
export type NoiseLevel = 'Idle' | 'Quiet' | 'Medium' | 'Noisy' | 'Error' | 'Initializing';

export type AnimationStyleId = 'classic' | 'breathe' | 'spin-expand' | 'focus-shift' | 'minimalist';
export interface AnimationStyle {
  id: AnimationStyleId;
  name: string;
}

export type AppThemeId = 'system' | 'light' | 'dark';
export interface AppTheme {
  id: AppThemeId;
  name: string;
}
