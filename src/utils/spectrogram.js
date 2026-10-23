export function generateSpectrogram(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        const arrayBuffer = e.target.result;
        
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Set up OfflineAudioContext to process the whole file as fast as possible
        const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        const analyser = offlineCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0;
        
        const processor = offlineCtx.createScriptProcessor(4096, 1, 1);
        
        source.connect(analyser);
        analyser.connect(processor);
        processor.connect(offlineCtx.destination);
        
        const frequencies = new Uint8Array(analyser.frequencyBinCount);
        const spectrogramData = [];
        
        processor.onaudioprocess = () => {
          analyser.getByteFrequencyData(frequencies);
          spectrogramData.push(new Uint8Array(frequencies));
        };
        
        source.start(0);
        await offlineCtx.startRendering();
        
        const width = spectrogramData.length;
        const height = analyser.frequencyBinCount;
        
        if (width === 0 || height === 0) {
          throw new Error('Could not generate spectrogram data.');
        }

        // --- Algorithmic FFT Frequency Shelf & Transcode Analyzer ---
        const activeFrames = spectrogramData.filter(col => {
          let sum = 0;
          const sampleCount = Math.min(col.length, 250);
          for (let i = 0; i < sampleCount; i++) sum += col[i];
          return sum / sampleCount > 12;
        });

        const framesToExamine = activeFrames.length > 15 ? activeFrames : spectrogramData;
        const binEnergies = new Float32Array(height);
        for (const col of framesToExamine) {
          for (let b = 0; b < height; b++) {
            binEnergies[b] += col[b];
          }
        }

        const count = Math.max(1, framesToExamine.length);
        let maxBinWithSignal = 0;
        for (let b = 0; b < height; b++) {
          binEnergies[b] /= count;
          if (binEnergies[b] >= 5.0) {
            maxBinWithSignal = b;
          }
        }

        const hzPerBin = (audioBuffer.sampleRate / 2) / height;
        const detectedCutoffHz = Math.min(Math.round(maxBinWithSignal * hzPerBin), Math.round(audioBuffer.sampleRate / 2));
        
        const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
        const claimsLossless = ['flac', 'wav', 'aiff', 'alac'].includes(ext);
        const isFakeUpscale = claimsLossless && detectedCutoffHz < 17000;

        let shelfTier = 'master';
        if (detectedCutoffHz >= 21000) {
          shelfTier = 'master';
        } else if (detectedCutoffHz >= 19500) {
          shelfTier = '320kbps';
        } else if (detectedCutoffHz >= 17500) {
          shelfTier = '192kbps';
        } else {
          shelfTier = '128kbps';
        }
        // -------------------------------------------------------------

        const canvas = document.createElement('canvas');
        canvas.width = width;
        const displayHeight = Math.min(height, 512); 
        canvas.height = displayHeight;
        
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, displayHeight);
        
        for (let x = 0; x < width; x++) {
          const colData = spectrogramData[x];
          for (let y = 0; y < displayHeight; y++) {
            const freqVal = colData[y];
            const i = ((displayHeight - 1 - y) * width + x) * 4;
            
            const r = freqVal;
            const g = Math.max(0, freqVal - 100);
            const b = Math.min(255, freqVal + 50);
            
            imgData.data[i] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
            imgData.data[i + 3] = 255;
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        
        resolve({
          dataUrl,
          detectedCutoffHz,
          shelfTier,
          isFakeUpscale,
          sampleRate: audioBuffer.sampleRate,
        });
        
      } catch (err) {
        console.error('Error generating spectrogram:', err);
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
