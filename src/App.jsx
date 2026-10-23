import { useState, useEffect } from 'react';
import { Sun, Moon, Music, DownloadCloud, FileArchive } from 'lucide-react';
import Dropzone from './components/Dropzone';
import ExtractionResult from './components/ExtractionResult';
import { extractCoverArt } from './utils/audioParser';
import { generateSpectrogram } from './utils/spectrogram';
import GearLinks from './components/GearLinks';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
  const [theme, setTheme] = useState('light');
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [useOnlineFetch, setUseOnlineFetch] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleFileDrop = async (droppedFiles) => {
    setError(null);
    setIsProcessing(true);

    const initialResults = droppedFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      isProcessing: true,
      coverUrl: null,
      spectrogramUrl: null,
      metadata: null,
      error: null
    }));

    setResults(prev => [...initialResults, ...prev]);

    for (const item of initialResults) {
      try {
        const { coverUrl, tags } = await extractCoverArt(item.file, useOnlineFetch);
        
        setResults(prev => prev.map(r => 
          r.id === item.id 
            ? { ...r, coverUrl, metadata: tags } 
            : r
        ));

        const specUrl = await generateSpectrogram(item.file);
        
        setResults(prev => prev.map(r => 
          r.id === item.id 
            ? { ...r, spectrogramUrl: specUrl, isProcessing: false } 
            : r
        ));
      } catch (err) {
        setResults(prev => prev.map(r => 
          r.id === item.id 
            ? { ...r, error: err.message || 'An error occurred during extraction.', isProcessing: false } 
            : r
        ));
      }
    }

    setIsProcessing(false);
  };

  const downloadZip = async (filter) => {
    const zip = new JSZip();
    let hasFiles = false;

    for (const result of results) {
      if (result.error || result.isProcessing) continue;
      
      // Default to file name without extension if metadata is missing
      const baseName = result.metadata?.title 
        ? `${result.metadata.artist ? result.metadata.artist + ' - ' : ''}${result.metadata.title}`
        : result.file.name.replace(/\.[^/.]+$/, "");

      // Helper to fetch base64 as blob
      const fetchBlob = async (dataUrl) => {
        const res = await fetch(dataUrl);
        return await res.blob();
      };

      if ((filter === 'all' || filter === 'covers') && result.coverUrl) {
        const blob = await fetchBlob(result.coverUrl);
        zip.file(`${baseName} - Cover.png`, blob);
        hasFiles = true;
      }
      
      if ((filter === 'all' || filter === 'spectrograms') && result.spectrogramUrl) {
        const blob = await fetchBlob(result.spectrogramUrl);
        zip.file(`${baseName} - Spectrogram.png`, blob);
        hasFiles = true;
      }
    }

    if (hasFiles) {
      const content = await zip.generateAsync({ type: 'blob' });
      const filename = filter === 'all' ? 'AudioRap-All.zip' 
        : filter === 'covers' ? 'AudioRap-Covers.zip' 
        : 'AudioRap-Spectrograms.zip';
      saveAs(content, filename);
    }
  };

  // Only show download options if we have at least one successfully processed item
  const hasCompletedResults = results.some(r => !r.isProcessing && !r.error && (r.coverUrl || r.spectrogramUrl));

  return (
    <div className="page-layout">
      <div className="app-container flex-col items-center">
        <header className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-4">
          <Music size={32} className="text-gradient" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800' }}>
            AudioRap
          </h1>
        </div>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <main className="w-full max-w-3xl flex-col gap-8">
        <div className="glass-card mb-8">
          <h2 className="mb-4 text-center">Extract Magic from Your Music</h2>
          <p className="text-secondary text-center mb-8">
            Instantly extract hidden cover art and visualize spectrograms from your audio files.
            Everything happens securely on your device.
          </p>
          
          <div className="flex justify-center mb-6">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={useOnlineFetch} 
                onChange={(e) => setUseOnlineFetch(e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-color)' }}
              />
              Fetch missing covers from the internet
            </label>
          </div>
          
          <Dropzone onDrop={handleFileDrop} isProcessing={isProcessing} />
          
          
          {error && (
             <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
               {error}
             </div>
          )}
        </div>

        {hasCompletedResults && (
          <div className="flex justify-between items-center mb-4 p-4 glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div className="flex items-center gap-2 font-semibold">
              <FileArchive size={20} className="text-accent" />
              <span>Download Bulk ZIP</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadZip('covers')} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'var(--glass-border)', background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                Covers Only
              </button>
              <button onClick={() => downloadZip('spectrograms')} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'var(--glass-border)', background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                Spectrograms Only
              </button>
              <button onClick={() => downloadZip('all')} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <DownloadCloud size={16} /> All Images
              </button>
            </div>
          </div>
        )}

        {results.map(result => (
          <div className="glass-card" key={result.id} style={{ marginBottom: '2rem' }}>
            {result.error ? (
              <div className="p-4" style={{ color: '#ef4444' }}>
                <h3 style={{ fontWeight: 'bold' }}>{result.file.name}</h3>
                <p>{result.error}</p>
              </div>
            ) : (
              <ExtractionResult 
                file={result.file}
                coverUrl={result.coverUrl} 
                spectrogramUrl={result.spectrogramUrl} 
                metadata={result.metadata || { title: result.file.name, artist: 'Processing...' }}
                isProcessing={result.isProcessing}
                fileName={result.file.name}
              />
            )}
          </div>
        ))}

        <GearLinks />

        <section className="glass-card" style={{ marginTop: '2rem', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Free Online Audio Cover Art Extractor &amp; Spectrogram Analyzer
          </h2>
          <p className="text-secondary" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
            <strong>AudioRap</strong> lets DJs, audiophiles, music producers, and collectors extract original high-resolution embedded album artwork (ID3v2, Vorbis comments, MP4 atoms) and render detailed FFT frequency spectrograms from <strong>MP3, FLAC, WAV, M4A, and OGG</strong> audio files directly in the browser—with zero server uploads.
          </p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.35rem' }}>1. Extract Embedded Album Art</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Pull full-resolution JPEG/PNG cover art from MP3 ID3 tags and FLAC picture blocks without re-compression, or auto-fetch missing artwork online.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.35rem' }}>2. Verify True Lossless Audio</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Spot fake FLAC transcodes and upscaled MP3s immediately. Check whether high frequencies extend past 20 kHz (lossless/320kbps) or cut off at 16 kHz (128kbps).
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.35rem' }}>3. Batch ZIP Download</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Drop an entire album folder at once and export all extracted covers, all frequency spectrograms, or both in a single organized ZIP archive.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        More free tools:{' '}
        <a href="https://photosplitstudio.com/?utm_source=audiorap.com&utm_medium=referral">PhotoSplit Studio</a> (split scanned photos)
        {' · '}
        <a href="https://is-my-internet-working.com/?utm_source=audiorap.com&utm_medium=referral">Is My Internet Working?</a> (speed test)
      </footer>
      </div>
    </div>
  );
}

export default App;
