interface MascotVolumeSnapshot {
  renderer: string;
  state: string;
  scale: number;
  squint: number;
  depth: number;
  gaze: number[];
  eyeQuaternion: number[];
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
