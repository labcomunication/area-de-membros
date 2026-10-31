interface MascotVolumeSnapshot {
  renderer: string;
  state: string;
  scale: number;
  squint: number;
  depth: number;
  gaze: number[];
  eyeQuaternion: number[];
  family?: string;
  faceColor?: string;
  faceMaterial?: string;
  eyeGeometry?: string;
  eyePositions?: number[][];
  bodyMaterial?: string;
  bodyColor?: string;
  dotfield?: {
    active: boolean;
    peak: number;
    renderedFrames: number;
    pointCount: number;
  } | null;
  bodyAngle: number[];
  position: number[];
  renderedFrames: number;
  motionActive: boolean;
}
interface Window {
  previewCharacters: {
    volumeSnapshot(): MascotVolumeSnapshot;
  };
}
