import { useEffect, useState } from 'react';
import { Headphones, Mic, Sliders, ExternalLink } from 'lucide-react';

const AMAZON_TAG = 'photoid03-20';
const CENTRAL_ENGINE = 'https://tiketichap.com/api/amazon-ads';

const amazonSearch = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;

const DEFAULT_GEAR = [
  {
    id: 'ar-active-1',
    category: 'headphones',
    badge: 'Studio Standard',
    title: 'Audio-Technica ATH-M50x Studio Monitor Headphones',
    description: '45mm large-aperture drivers for inspecting frequency cutoffs, transcode artifacts, and isolated vocal stems.',
    url: amazonSearch('Audio-Technica ATH-M50x professional studio monitor headphones'),
  },
  {
    id: 'ar-active-2',
    category: 'interfaces',
    badge: '#1 Interface',
    title: 'Focusrite Scarlett 2i2 (4th Gen) USB-C Audio Interface',
    description: '120dB dynamic range converters and Air mode preamps for lossless studio monitoring and vocal recording.',
    url: amazonSearch('Focusrite Scarlett 2i2 4th Gen USB audio interface'),
  },
  {
    id: 'ar-active-3',
    category: 'microphones',
    badge: 'Pro Vocals',
    title: 'Shure MV7+ Dynamic Podcast & Vocal Microphone (USB/XLR)',
    description: 'Voice isolation and onboard DSP for crisp rap, podcast, and vocal takes in untreated rooms.',
    url: amazonSearch('Shure MV7+ dynamic vocal microphone USB XLR'),
  },
  {
    id: 'ar-active-4',
    category: 'controllers',
    badge: 'Beatmaker Pick',
    title: 'Akai Professional MPK Mini MK3 25-Key MIDI Pad Controller',
    description: '8 velocity-sensitive MPC drum pads for chopping samples and producing tracks in any DAW.',
    url: amazonSearch('Akai Professional MPK Mini MK3 MIDI controller'),
  },
  {
    id: 'ar-cand-1',
    category: 'headphones',
    badge: 'Mastering Reference',
    title: 'Beyerdynamic DT 990 PRO 250 Ohm Open-Back Headphones',
    description: 'Analytical high-frequency detail to hear exactly what your spectrogram shows above 16 kHz.',
    url: amazonSearch('Beyerdynamic DT 990 PRO open back studio headphones'),
  },
  {
    id: 'ar-cand-2',
    category: 'interfaces',
    badge: 'Nearfield Monitors',
    title: 'PreSonus Eris 3.5 Powered Studio Reference Monitors (Pair)',
    description: 'Compact woven-composite studio speakers for accurate beat mixing and stereo imaging.',
    url: amazonSearch('PreSonus Eris 3.5 studio monitors pair'),
  },
];

export function sendAudioRapAdEvent(payload) {
  try {
    const body = JSON.stringify({
      site: 'audiorap',
      associateTag: AMAZON_TAG,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      ...payload,
    });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(CENTRAL_ENGINE, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(CENTRAL_ENGINE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // non-blocking
  }
}

export default function GearLinks() {
  const [items, setItems] = useState(DEFAULT_GEAR);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    sendAudioRapAdEvent({ type: 'pageview' });
    sendAudioRapAdEvent({ type: 'impression', slot: 'studio-showcase' });

    fetch(`${CENTRAL_ENGINE}?action=serve&site=audiorap&slot=studio-showcase&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.allowed && Array.isArray(data.products) && data.products.length >= 3) {
          const mapped = data.products.map((p) => ({
            id: p.id,
            category: p.category || 'headphones',
            badge: p.badge || 'Studio Pick',
            title: p.title,
            description: p.description,
            url: p.localizedUrl || p.productUrl || amazonSearch(p.searchQuery || p.title),
          }));
          setItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter);

  return (
    <section className="glass-card gear-links" aria-labelledby="gear-heading" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 id="gear-heading" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <Headphones size={20} /> Studio &amp; Audiophile Gear for Hearing Every Detail
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', opacity: 0.78 }}>
            Spot 16 kHz MP3 cutoffs and inspect lossless FLAC masters with calibrated studio reference hardware.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Gear' },
            { key: 'headphones', label: 'Headphones' },
            { key: 'interfaces', label: 'Interfaces & Monitors' },
            { key: 'microphones', label: 'Mics & MIDI' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key === 'microphones' ? 'microphones' : tab.key)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.16)',
                background: activeFilter === tab.key ? 'var(--accent-color, #6366f1)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {filtered.map((g) => (
          <a
            key={g.id || g.title}
            href={g.url}
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={() =>
              sendAudioRapAdEvent({
                type: 'click',
                slot: 'studio-showcase',
                productId: g.id,
              })
            }
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.28)',
              textDecoration: 'none',
              color: 'inherit',
              gap: '0.6rem',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  marginBottom: '0.5rem',
                }}
              >
                {g.badge}
              </span>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.98rem', fontWeight: 700 }}>{g.title}</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.78, lineHeight: 1.4 }}>{g.description}</p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#818cf8',
                marginTop: '0.4rem',
              }}
            >
              Check on Amazon <ExternalLink size={13} />
            </span>
          </a>
        ))}
      </div>

      <small style={{ opacity: 0.7, fontSize: '0.78rem' }}>
        As an Amazon Associate (ID: {AMAZON_TAG}), AudioRap earns from qualifying purchases.
      </small>
    </section>
  );
}
