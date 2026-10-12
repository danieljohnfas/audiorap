import { Download, Image as ImageIcon, Activity, Disc } from 'lucide-react';

export default function ExtractionResult({ coverUrl, spectrogramUrl, metadata, isProcessing, fileName }) {
  if (isProcessing) return null;

  const baseName = metadata?.title 
    ? `${metadata.artist ? metadata.artist + ' - ' : ''}${metadata.title}`
    : (fileName ? fileName.replace(/\.[^/.]+$/, "") : "audio");

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
        <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: 'var(--glass-border)' }}>
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
              <a href={spectrogramUrl} download={`${baseName} - Spectrogram.png`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <Download size={16} /> Save
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
    </div>
  );
}
