import { useMemo } from 'react';
import { Download, Image as ImageIcon, Activity, Disc, Headphones, ExternalLink, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { sendAudioRapAdEvent } from '../utils/adTracker';

export default function ExtractionResult({ file, coverUrl, spectrogramUrl, metadata, isProcessing, fileName, spectrumAnalysis }) {
  const audioPreviewUrl = useMemo(() => {
    if (file instanceof Blob || file instanceof File) {
      try {
        return URL.createObjectURL(file);
      } catch {
        return null;
      }
    }
    return null;
  }, [file]);

  if (isProcessing) return null;

  const baseName = metadata?.title 
    ? `${metadata.artist ? metadata.artist + ' - ' : ''}${metadata.title}`
    : (fileName ? fileName.replace(/\.[^/.]+$/, "") : "audio");

  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
  const isLossless = ['flac', 'wav', 'aiff', 'alac'].includes(ext);
  const isMp3 = ext === 'mp3';

  return (
    <div className="flex-col gap-8 w-full" style={{ animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .image-container {
          border-radius: 12px;
          overflow: hidden;
          border: var(--glass-border);
          background: rgba(0,0,0,0.2);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .spectrogram-container {
          border-radius: 12px;
          overflow: hidden;
          border: var(--glass-border);
          background: rgba(0,0,0,0.2);
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .spectrogram-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
          padding: 2rem;
          text-align: center;
        }
      `}</style>

      {/* Metadata Section */}
      {metadata && (
        <div className="flex-col gap-3 mb-4 pb-4" style={{ borderBottom: 'var(--glass-border)' }}>
          <div className="flex items-center gap-4">
            <Disc size={40} className="text-accent" style={{ color: 'var(--accent-color)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {metadata.title || 'Unknown Title'}
              </h2>
              <p className="text-secondary" style={{ margin: 0, fontSize: '1.1rem' }}>
                {metadata.artist || 'Unknown Artist'} 
                {metadata.album && ` • ${metadata.album}`}
              </p>
            </div>
          </div>

          {/* Audio Playback Preview & Quality Verifier */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {audioPreviewUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                <audio controls src={audioPreviewUrl} style={{ width: '100%', height: '36px', outline: 'none' }} />
              </div>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
              {spectrumAnalysis?.isFakeUpscale ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  <AlertTriangle size={14} /> ⚠️ Fake Lossless Alert: Brickwall Cutoff at {(spectrumAnalysis.detectedCutoffHz / 1000).toFixed(1)} kHz (~128 kbps source)
                </span>
              ) : spectrumAnalysis?.detectedCutoffHz >= 21000 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  <CheckCircle2 size={14} /> Verified Master: {(spectrumAnalysis.detectedCutoffHz / 1000).toFixed(1)} kHz Full Bandwidth ({ext.toUpperCase()})
                </span>
              ) : spectrumAnalysis?.detectedCutoffHz ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                  <ShieldCheck size={14} /> {(spectrumAnalysis.detectedCutoffHz / 1000).toFixed(1)} kHz Shelf Limit ({ext.toUpperCase()})
                </span>
              ) : isLossless ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  <CheckCircle2 size={14} /> True Lossless ({ext.toUpperCase()}) • Full 22 kHz Spectrum
                </span>
              ) : isMp3 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                  <ShieldCheck size={14} /> MP3 Container • 20 kHz Cutoff Threshold
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#93c5fd', background: 'rgba(147, 197, 253, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid rgba(147, 197, 253, 0.25)' }}>
                  <Activity size={14} /> {ext.toUpperCase() || 'Audio'} Stream Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="result-grid">
        {/* Cover Art */}
        <div className="flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <ImageIcon size={20} /> Cover Art
            </h3>
            {coverUrl && (
              <a href={coverUrl} download={`${baseName} - Cover.png`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <Download size={16} /> Save
              </a>
            )}
          </div>
          
          <div className="image-container">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover Art" />
            ) : (
              <div className="placeholder">
                <ImageIcon size={48} className="mb-4" style={{ opacity: 0.5 }} />
                <p>No cover art found in the file tags.</p>
              </div>
            )}
          </div>
        </div>

        {/* Spectrogram */}
        <div className="flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <Activity size={20} /> Spectrogram
            </h3>
            {spectrogramUrl && (
              <a href={spectrogramUrl} download={`${baseName} - Spectrogram.png`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Download Spectrogram (PNG)
              </a>
            )}
          </div>
          
          <div className="spectrogram-container">
            {spectrogramUrl ? (
              <img src={spectrogramUrl} alt="Spectrogram" />
            ) : (
              <div className="placeholder">
                <Activity size={48} className="mb-4" style={{ opacity: 0.5 }} />
                <p>Generating spectrogram...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Extraction Studio Monitoring Callout (Amazon Associates photoid03-20) */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          background: 'rgba(99, 102, 241, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Headphones size={24} style={{ color: '#818cf8', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>
              Inspecting "{baseName}"? Hear every frequency above 16 kHz clearly
            </strong>
            <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>
              Compare studio monitor headphones &amp; 24-bit/192kHz USB DACs on Amazon (Associate ID: photoid03-20).
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href="https://www.amazon.com/s?k=Audio-Technica+ATH-M50x+professional+studio+monitor+headphones&tag=photoid03-20"
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={() => sendAudioRapAdEvent({ type: 'click', slot: 'post-extraction', productId: 'ar-active-1' })}
            className="btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
          >
            ATH-M50x Headphones <ExternalLink size={14} />
          </a>
          <a
            href="https://www.amazon.com/s?k=Focusrite+Scarlett+2i2+4th+Gen+USB+audio+interface&tag=photoid03-20"
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={() => sendAudioRapAdEvent({ type: 'click', slot: 'post-extraction', productId: 'ar-active-2' })}
            className="btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
          >
            Scarlett 2i2 DAC <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
