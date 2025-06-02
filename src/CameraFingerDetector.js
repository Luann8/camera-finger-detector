class CameraFingerDetector {
    constructor({
        videoElementId = 'player',
        canvasElementId = 'canvas',
        statusElementId = 'status',
        analysisAreaElementId = 'analysisArea',
        frameIntervalMs = 500,
        skinToneThresholds = {
            fullWarmRatioClose: 0.8,
            fullWarmRatioFar: 0.2,      // Ajustado para maior sensibilidade
            centralWarmRatioFar: 0.05,   // Ajustado para maior sensibilidade
            colorVarianceThreshold: 2000
        }
    } = {}) {
        this.video = document.getElementById(videoElementId);
        this.canvas = document.getElementById(canvasElementId);
        this.statusDiv = document.getElementById(statusElementId);
        this.analysisArea = document.getElementById(analysisAreaElementId);
        this.ctx = this.canvas.getContext('2d');
        this.lastProcessedFrame = 0;
        this.frameIntervalMs = frameIntervalMs;
        this.skinToneThresholds = skinToneThresholds;
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.updateAnalysisArea();
                this.analyzeFrame();
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (this.statusDiv) {
                this.statusDiv.textContent = 'Error: Camera access denied';
                this.statusDiv.style.color = 'red';
            }
            this.isRunning = false;
        }
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        if (this.statusDiv) {
            this.statusDiv.textContent = 'Camera stopped';
            this.statusDiv.style.color = 'black';
        }
    }

    updateAnalysisArea() {
        if (!this.analysisArea) return;
        const centerX = Math.floor(this.video.videoWidth / 3);
        const centerY = Math.floor(this.video.videoHeight / 3);
        const regionWidth = Math.floor(this.video.videoWidth / 3);
        const regionHeight = Math.floor(this.video.videoHeight / 3);

        this.analysisArea.style.width = `${regionWidth}px`;
        this.analysisArea.style.height = `${regionHeight}px`;
        this.analysisArea.style.left = `${(this.video.offsetWidth - regionWidth) / 2}px`;
        this.analysisArea.style.top = `${(this.video.offsetHeight - regionHeight) / 2}px`;
    }

    calculateVariance(data) {
        let rSum = 0, gSum = 0, bSum = 0;
        let rSumSq = 0, gSumSq = 0, bSumSq = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            rSum += r;
            gSum += g;
            bSum += b;
            rSumSq += r * r;
            gSumSq += g * g;
            bSumSq += b * b;
            pixelCount++;
        }

        const rMean = rSum / pixelCount;
        const gMean = gSum / pixelCount;
        const bMean = bSum / pixelCount;

        const rVariance = (rSumSq / pixelCount) - (rMean * rMean);
        const gVariance = (gSumSq / pixelCount) - (gMean * gMean);
        const bVariance = (bSumSq / pixelCount) - (bMean * bMean);

        return (rVariance + gVariance + bVariance) / 3;
    }

    isSkinTone(r, g, b) {
        return r > g * 1.0 && r > b * 1.0 && r > 50 && g > 15 && b < 150;
    }

    analyzeFrame = () => {
        if (!this.isRunning) return;

        const now = Date.now();
        if (now - this.lastProcessedFrame < this.frameIntervalMs) {
            requestAnimationFrame(this.analyzeFrame);
            return;
        }
        this.lastProcessedFrame = now;

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Full frame analysis
        const fullImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const fullData = fullImageData.data;

        let fullWarmPixelCount = 0;
        let fullTotalPixelCount = 0;

        for (let i = 0; i < fullData.length; i += 4) {
            const r = fullData[i];
            const g = fullData[i + 1];
            const b = fullData[i + 2];

            if (this.isSkinTone(r, g, b)) {
                fullWarmPixelCount++;
            }
            fullTotalPixelCount++;
        }

        const fullWarmRatio = fullWarmPixelCount / fullTotalPixelCount;
        const colorVariance = this.calculateVariance(fullData);

        // Central region analysis
        const centerX = Math.floor(this.canvas.width / 3);
        const centerY = Math.floor(this.canvas.height / 3);
        const regionWidth = Math.floor(this.canvas.width / 3);
        const regionHeight = Math.floor(this.canvas.height / 3);

        const centralImageData = this.ctx.getImageData(centerX, centerY, regionWidth, regionHeight);
        const centralData = centralImageData.data;

        let centralWarmPixelCount = 0;
        let centralTotalPixelCount = 0;

        for (let i = 0; i < centralData.length; i += 4) {
            const r = centralData[i];
            const g = centralData[i + 1];
            const b = centralData[i + 2];

            if (this.isSkinTone(r, g, b)) {
                centralWarmPixelCount++;
            }
            centralTotalPixelCount++;
        }

        const centralWarmRatio = centralWarmPixelCount / centralTotalPixelCount;

        // Debug logs
        console.log(`fullWarmRatio: ${fullWarmRatio.toFixed(3)}, centralWarmRatio: ${centralWarmRatio.toFixed(3)}, colorVariance: ${colorVariance.toFixed(1)}`);
        console.log(`fullWarmPixelCount: ${fullWarmPixelCount}, fullTotalPixelCount: ${fullTotalPixelCount}`);
        console.log(`centralWarmPixelCount: ${centralWarmPixelCount}, centralTotalPixelCount: ${centralTotalPixelCount}`);

        // Update status
        if (this.statusDiv) {
            if (fullWarmRatio > this.skinToneThresholds.fullWarmRatioClose && colorVariance < this.skinToneThresholds.colorVarianceThreshold) {
                this.statusDiv.textContent = 'Finger touching the lens!';
                this.statusDiv.style.color = 'purple';
            } else if (fullWarmRatio > this.skinToneThresholds.fullWarmRatioFar || centralWarmRatio > this.skinToneThresholds.centralWarmRatioFar) {
                this.statusDiv.textContent = 'Finger detected, but far!';
                this.statusDiv.style.color = 'orange';
            } else {
                this.statusDiv.textContent = 'Camera clear';
                this.statusDiv.style.color = 'green';
            }
        }

        requestAnimationFrame(this.analyzeFrame);
    }
}

export default CameraSkinToneDetector;