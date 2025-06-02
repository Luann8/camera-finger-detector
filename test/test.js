import CameraSkinToneDetector from '../index.js';

const detector = new CameraSkinToneDetector({
  videoElementId: 'player',
  canvasElementId: 'canvas',
  statusElementId: 'status',
  analysisAreaElementId: 'analysisArea',
  frameIntervalMs: 500,
  skinToneThresholds: {
    fullWarmRatioClose: 0.8,
    fullWarmRatioFar: 0.4,
    centralWarmRatioFar: 0.1,
    colorVarianceThreshold: 2000
  }
});

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

startButton.addEventListener('click', () => {
  detector.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  detector.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
});