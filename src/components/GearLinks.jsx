import { useEffect, useState } from 'react';
import { Headphones, Mic, Sliders, ExternalLink } from 'lucide-react';

const AMAZON_TAG = 'photoid03-20';
const CENTRAL_ENGINE = 'https://tiketichap.com/api/amazon-ads';

const directAsin = (asin) => `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
const amazonSearch = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;

const DEFAULT_GEAR = [
  {
    id: 'ar-active-1',
    category: 'headphones',
    badge: 'Studio Standard',
    rating: '4.7',
    reviews: '34,000+',
    title: 'Audio-Technica ATH-M50x Professional Studio Monitor Headphones',
    description: '45mm large-aperture drivers for inspecting frequency cutoffs, transcode artifacts, and isolated vocal stems.',
    url: directAsin('B00HVLUR86'),
  },
  {
    id: 'ar-active-2',
    category: 'interfaces',
    badge: '#1 Interface',
    rating: '4.6',
    reviews: '2,800+',
    title: 'Focusrite Scarlett 2i2 (4th Gen) USB-C Audio Interface',
    description: '120dB dynamic range converters and Air mode preamps for lossless studio monitoring and vocal recording.',
    url: directAsin('B0C6T72Q5L'),
  },
  {
    id: 'ar-active-3',
    category: 'microphones',
    badge: 'Pro Vocals',
    rating: '4.6',
    reviews: '4,500+',
    title: 'Shure MV7+ Dynamic Podcast & Vocal Microphone (USB/XLR)',
    description: 'Voice isolation and onboard DSP for crisp rap, podcast, and vocal takes in untreated rooms.',
    url: directAsin('B0CV269GGS'),
  },
  {
    id: 'ar-active-4',
    category: 'controllers',
    badge: 'Beatmaker Pick',
    rating: '4.7',
    reviews: '31,000+',
    title: 'Akai Professional MPK Mini MK3 25-Key MIDI Pad Controller',
    description: '8 velocity-sensitive MPC drum pads for chopping samples and producing tracks in any DAW.',
    url: directAsin('B0886ZPWC8'),
  },
  {
    id: 'ar-cand-1',
    category: 'headphones',
    badge: 'Mastering Reference',
    rating: '4.7',
    reviews: '23,000+',
    title: 'Beyerdynamic DT 990 PRO 250 Ohm Open-Back Headphones',
    description: 'Analytical high-frequency detail to hear exactly what your spectrogram shows above 16 kHz.',
    url: directAsin('B0011UB9CQ'),
  },
  {
    id: 'ar-cand-2',
    category: 'interfaces',
    badge: 'Nearfield Monitors',
    rating: '4.5',
    reviews: '18,000+',
    title: 'PreSonus Eris 3.5 Powered Studio Reference Monitors (Pair)',
    description: 'Compact woven-composite studio speakers for accurate beat mixing and stereo imaging.',
    url: directAsin('B075QVMBT9'),
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
      navigator.sendBeacon(CENTRAL_ENGINE, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
    } else if (typeof fetch !== 'undefined') {
      fetch(CENTRAL_ENGINE, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

export default function GearLinks() {
  const [gear, setGear] = useState(DEFAULT_GEAR);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    sendAudioRapAdEvent({ type: 'pageview' });
    sendAudioRapAdEvent({ type: 'impression', slot: 'studio-showcase' });

    fetch(`${CENTRAL_ENGINE}?action=serve&site=audiorap&slot=studio-showcase&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.allowed || !Array.isArray(data.products) || !data.products.length) return;
        const dynamicItems = data.products.map((p) => ({
          id: p.id,
          category: p.category || 'interfaces',
          badge: p.badge || 'Studio Pick',
          rating: p.rating || '4.6',
          reviews: '2,000+',
          title: p.title,
          description: p.description,
          url: p.localizedUrl || p.productUrl || amazonSearch(p.searchQuery || p.title),
        }));
        setGear((prev) => {
          const ids = new Set(dynamicItems.map((d) => d.id));
          return [...dynamicItems, ...prev.filter((d) => !ids.has(d.id))];
        });
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: 'All Studio Gear' },
    { id: 'headphones', label: 'Headphones', icon: Headphones },
    { id: 'interfaces', label: 'Audio Interfaces', icon: Sliders },
    { id: 'microphones', label: 'Microphones', icon: Mic },
    { id: 'controllers', label: 'MIDI & Beats' },
  ];

  const filtered = category === 'all' ? gear : gear.filter((g) => g.category === category);

  return (
    <section
      aria-label="Recommended Studio & Audio Hardware"
      data-amz-slot="studio-showcase"
      style={{
        marginTop: '2.5rem',
        padding: '1.5rem',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#818cf8',
            }}
          >
            AudioRap Studio Showcase • Amazon photoid03-20
          </span>
          <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
            Inspecting Audio? Recommended Studio Reference Gear
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', opacity: 0.7 }}>
            Accurate monitors, preamps and microphones to verify frequency cutoffs and master tracks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: category === c.id ? '#6366f1' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.3)',
              textDecoration: 'none',
              color: 'inherit',
              gap: '0.6rem',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                  }}
                >
                  {g.badge}
                </span>
                <span style={{ background: '#232f3e', color: '#ff9900', fontSize: '0.62rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', fontStyle: 'italic' }}>
                  prime
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.96rem', fontWeight: 700, lineHeight: 1.3 }}>{g.title}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#f59e0b' }}>★★★★★</span>
                <span style={{ fontWeight: 700 }}>{g.rating || '4.6'}</span>
                <span style={{ opacity: 0.6 }}>({g.reviews || '2.5k+'})</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.75, lineHeight: 1.4 }}>{g.description}</p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fff',
                background: '#4f46e5',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                marginTop: '0.5rem',
              }}
            >
              Check Price on Amazon → <ExternalLink size={13} />
            </span>
          </a>
        ))}
      </div>

      <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.5, textAlign: 'center' }}>
        As an Amazon Associate (ID: {AMAZON_TAG}), AudioRap earns from qualifying purchases. Product recommendations are editorially selected.
      </p>
    </section>
  );
}
