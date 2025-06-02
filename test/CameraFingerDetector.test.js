import CameraFingerDetector from '../index.js';

describe('CameraFingerDetector', () => {
  test('inicializa corretamente', () => {
    const detector = new CameraFingerDetector();
    expect(detector).toBeInstanceOf(CameraFingerDetector);
    expect(detector.isRunning).toBe(false);
  });
});