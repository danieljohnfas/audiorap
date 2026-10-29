import { useEffect, useState } from 'react';
import { Headphones, Mic, Sliders, ExternalLink } from 'lucide-react';
import { sendAudioRapAdEvent } from '../utils/adTracker';

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
  { id: 'ar-active-7', category: 'headphones', badge: 'Open-Back King', rating: '4.8', reviews: '19,400+', title: 'Sennheiser HD 600 Open-Back Audiophile Reference Headphones', description: 'Neutral acoustic signature trusted by mastering engineers worldwide to spot compression artifacts.', url: directAsin('B00004SY4H') },
  { id: 'ar-active-8', category: 'headphones', badge: 'Closed Studio', rating: '4.7', reviews: '27,000+', title: 'Beyerdynamic DT 770 PRO 80 Ohm Closed-Back Studio Headphones', description: 'Zero bleed vocal tracking and sub-bass accuracy for hip-hop and electronic beatmakers.', url: directAsin('B0016MNAAI') },
  { id: 'ar-active-9', category: 'headphones', badge: 'Broadcast Legend', rating: '4.8', reviews: '41,000+', title: 'Sony MDR-7506 Professional Large Diaphragm Headphone', description: 'Foldable studio workhorse with neodymium magnets for surgical vocal and podcast editing.', url: directAsin('B000AJIF4E') },
  { id: 'ar-active-10', category: 'headphones', badge: 'Planar Magnetic', rating: '4.6', reviews: '8,200+', title: 'HIFIMAN Sundara Planar Magnetic Open-Back Headphones', description: 'Ultra-thin Neo Supernano diaphragm delivering lightning-fast transient response above 20 kHz.', url: directAsin('B077XDWT7X') },
  { id: 'ar-active-11', category: 'headphones', badge: 'In-Ear Monitor', rating: '4.7', reviews: '15,600+', title: 'Shure SE215 PRO Sound Isolating In-Ear Monitors', description: 'Blocks up to 37 dB of stage noise with reinforced Kevlar detachable MMCX cable.', url: directAsin('B004PNZFZ8') },
  { id: 'ar-active-12', category: 'headphones', badge: 'Mixing Reference', rating: '4.7', reviews: '6,400+', title: 'Sennheiser HD 650 Open-Back Studio Mastering Headphones', description: 'Hand-selected matched driver elements with silky treble extension for long mixing sessions.', url: directAsin('B00018MSNI') },
  { id: 'ar-active-13', category: 'interfaces', badge: '32-Bit Float', rating: '4.7', reviews: '5,100+', title: 'Zoom UAC-232 32-Bit Float USB-C Audio Interface', description: 'Clip-free 32-bit float recording with dual XLR/TRS combo preamps for dynamic vocalists.', url: directAsin('B0BVZ1X38H') },
  { id: 'ar-active-14', category: 'interfaces', badge: 'Vintage Preamp', rating: '4.7', reviews: '9,300+', title: 'Universal Audio Volt 2 USB-C Recording Studio Interface', description: 'Built-in analog 610 tube preamp emulation and 76 FET compressor for radio-ready rap vocals.', url: directAsin('B09J1V6M41') },
  { id: 'ar-active-15', category: 'interfaces', badge: 'Ultra-Low Latency', rating: '4.7', reviews: '7,800+', title: 'MOTU M2 2x2 USB-C Audio Interface with ESS Sabre32 DAC', description: '120 dB dynamic range ESS Sabre32 Ultra DAC with full-color LCD level meters.', url: directAsin('B08129P2XY') },
  { id: 'ar-active-16', category: 'interfaces', badge: '4-Preamp Rig', rating: '4.7', reviews: '11,200+', title: 'Focusrite Scarlett 4i4 (4th Gen) USB Audio Interface', description: 'Four inputs/outputs with Auto Gain, Clip Safe, and loopback for streaming producers.', url: directAsin('B0C6T7C84X') },
  { id: 'ar-active-17', category: 'interfaces', badge: 'Hi-Res Desktop DAC', rating: '4.6', reviews: '6,900+', title: 'FiiO K7 Balanced Desktop DAC and Headphone Amplifier', description: 'Dual AK4493SEQ DAC chips and THX AAA 788+ amps to drive 250-600 Ohm mastering cans.', url: directAsin('B0BJKKPL71') },
  { id: 'ar-active-18', category: 'interfaces', badge: 'Pro Monitor Speaker', rating: '4.8', reviews: '14,500+', title: 'Yamaha HS5 Powered 5-Inch Studio Monitor (Single)', description: 'Iconic white-cone bi-amplified nearfield reference speaker that reveals every mix flaw.', url: directAsin('B00CFOX420') },
  { id: 'ar-active-19', category: 'interfaces', badge: 'Hip-Hop Bass Monitor', rating: '4.8', reviews: '16,200+', title: 'KRK Rokit 5 G4 5-Inch Powered Studio Monitor with DSP EQ', description: 'Kevlar woofer and onboard LCD graphic EQ room tuning for punchy 808 sub-bass translation.', url: directAsin('B07NDBM57F') },
  { id: 'ar-active-20', category: 'interfaces', badge: 'Audiophile DAC', rating: '4.7', reviews: '4,400+', title: 'iFi Zen DAC V2 Desktop USB DAC and Headphone Amp', description: 'True Native DSD256/PCM384 Burr-Brown converter with analog TrueBass boost switch.', url: directAsin('B091B2JC44') },
  { id: 'ar-active-21', category: 'microphones', badge: 'Vocal Goat', rating: '4.8', reviews: '21,000+', title: 'Shure SM7B Vocal Dynamic Broadcast & Rap Microphone', description: 'The undisputed studio standard for hip-hop vocals, R&B, and flagship podcasting.', url: directAsin('B0002E4Z8M') },
  { id: 'ar-active-22', category: 'microphones', badge: 'Built-in Preamp', rating: '4.8', reviews: '3,900+', title: 'Shure SM7dB Dynamic Vocal Mic with Built-in +28dB Preamp', description: 'Legendary SM7B tone with integrated phantom-powered active preamp—no external booster needed.', url: directAsin('B0CG9K2V3N') },
  { id: 'ar-active-23', category: 'microphones', badge: 'Ultra-Low Noise', rating: '4.8', reviews: '17,800+', title: 'Rode NT1 5th Generation Large-Diaphragm Condenser Mic', description: 'World-first XLR + 32-bit float USB-C studio condenser with 4dBA self-noise and shockmount.', url: directAsin('B0BVR5B5TV') },
  { id: 'ar-active-24', category: 'microphones', badge: 'Best Entry XLR', rating: '4.7', reviews: '38,000+', title: 'Audio-Technica AT2020 Cardioid Condenser Studio Microphone', description: 'Custom-engineered low-mass diaphragm for crisp vocal and acoustic instrument detail.', url: directAsin('B0006H92QK') },
  { id: 'ar-active-25', category: 'microphones', badge: '25dB Clean Gain', rating: '4.8', reviews: '19,200+', title: 'Cloud Microphones Cloudlifter CL-1 Mic Activator Preamp', description: 'Adds +25dB of ultra-clean transparent gain to dynamic and ribbon mics like the SM7B.', url: directAsin('B004MQSV04') },
  { id: 'ar-active-26', category: 'microphones', badge: 'Stage & Studio', rating: '4.8', reviews: '52,000+', title: 'Shure SM58-LC Cardioid Dynamic Vocal Microphone', description: 'Pneumatic shock-mount system and spherical mesh grille for live cyphers and vocal booths.', url: directAsin('B000CZ0R42') },
  { id: 'ar-active-27', category: 'microphones', badge: 'Studio Boom Arm', rating: '4.7', reviews: '12,400+', title: 'Rode PSA1+ Pro Studio Swivel Microphone Boom Arm', description: 'Silent parallelogram spring design with integrated cable management for heavy broadcast mics.', url: directAsin('B09JBZF3C2') },
  { id: 'ar-active-28', category: 'microphones', badge: 'Portable Vocal Booth', rating: '4.6', reviews: '9,800+', title: 'TroyStudio Portable Microphone Isolation Shield & Pop Filter', description: 'High-density acoustic foam reflection filter that eliminates bedroom echo during vocal takes.', url: directAsin('B07T1DJW5Y') },
  { id: 'ar-active-29', category: 'controllers', badge: 'Standalone MPC', rating: '4.8', reviews: '6,700+', title: 'Akai Professional MPC One+ Standalone Beat Production Center', description: 'Wi-Fi/Bluetooth enabled standalone sampler, stem separator, and 16-pad drum machine.', url: directAsin('B0C3ZGVN9P') },
  { id: 'ar-active-30', category: 'controllers', badge: 'Ableton & Logic', rating: '4.7', reviews: '14,100+', title: 'Novation Launchkey Mini MK3 25-Key USB MIDI Controller', description: '16 RGB velocity pads, arpeggiator, and fixed chord mode for rapid chord progressions.', url: directAsin('B07WJZCPT3') },
  { id: 'ar-active-31', category: 'controllers', badge: 'Analog Labs', rating: '4.7', reviews: '8,900+', title: 'Arturia MiniLab 3 25-Key Universal MIDI Controller', description: 'Capacitive touch strips, 4 faders, and 500+ curated vintage synth & piano presets.', url: directAsin('B0B9H94M9H') },
  { id: 'ar-active-32', category: 'controllers', badge: 'DJ Stem Mixing', rating: '4.8', reviews: '7,400+', title: 'Pioneer DJ DDJ-FLX4 2-Deck Rekordbox & Serato DJ Controller', description: 'Smart CFX and Smart Fader for seamless BPM transitions and live acapella/stem mashups.', url: directAsin('B0BHTML72R') },
  { id: 'ar-active-33', category: 'controllers', badge: 'Field Sampler', rating: '4.7', reviews: '3,600+', title: 'Roland SP-404MKII Creative Phrase Sampler & Effector', description: 'OLED waveform editing, 16GB internal storage, and classic vinyl sim compression for lo-fi beats.', url: directAsin('B09J1TB8R3') },
  { id: 'ar-active-34', category: 'controllers', badge: 'Pocket Beatmaker', rating: '4.6', reviews: '5,900+', title: 'Teenage Engineering PO-33 K.O.! Pocket Operator Micro Sampler', description: '40-second sample memory, built-in recording mic, and 16 punch-in FX in your pocket.', url: directAsin('B079M56Z4G') },
  { id: 'ar-active-35', category: 'controllers', badge: '49-Key Studio', rating: '4.7', reviews: '11,800+', title: 'M-Audio Oxygen Pro 49 Semi-Weighted USB MIDI Keyboard', description: 'Semi-weighted keys with aftertouch, 16 RGB pads, and 9 assignable mixing faders.', url: directAsin('B08MV99Z6K') },
  { id: 'ar-active-36', category: 'controllers', badge: 'FL Studio Native', rating: '4.8', reviews: '4,200+', title: 'Novation FLkey 37 Full-Size MIDI Keyboard for FL Studio', description: 'Direct step-sequencer, Channel Rack, and Mixer integration tailored specifically for FL Studio.', url: directAsin('B09V2ZGWDF') },
  { id: 'ar-active-37', category: 'headphones', badge: '4-Ch Headphone Amp', rating: '4.6', reviews: '22,000+', title: 'Mackie HM-4 4-Way Studio Headphone Splitter Amplifier', description: 'Share your mix across 4 sets of studio headphones simultaneously with individual volume knobs.', url: directAsin('B079C8MLG8') },
  { id: 'ar-active-38', category: 'interfaces', badge: 'Lossless NVMe SSD', rating: '4.8', reviews: '82,000+', title: 'SanDisk 2TB Extreme Portable SSD for Sample Libraries', description: '1050MB/s NVMe speed for streaming massive Kontakt orchestral libraries and 24-bit WAV stems.', url: directAsin('B08GNXN86B') },
  { id: 'ar-active-39', category: 'microphones', badge: 'Shielded XLR Cable', rating: '4.8', reviews: '29,000+', title: 'Mogami Gold Studio XLR Microphone Cable (15 Foot)', description: 'Quad-conductor oxygen-free copper with gold-plated Neutrik XLR connectors for zero RF hum.', url: directAsin('B0002E1P2G') },
  { id: 'ar-active-40', category: 'interfaces', badge: 'Room Acoustics', rating: '4.4', reviews: '33,000+', title: '24-Pack High-Density Studio Acoustic Wedge Foam Panels', description: 'Tame flutter echo and standing waves so your studio monitors reveal true stereo separation.', url: directAsin('B07VDTR22R') },
  { id: 'ar-active-41', category: 'interfaces', badge: 'Monitor Isolation', rating: '4.7', reviews: '9,400+', title: 'Auralex Acoustics MoPAD Studio Monitor Isolation Pads', description: 'Decouples studio monitors from your desk to eliminate mud and resonant bass vibration.', url: directAsin('B0002D0B4K') },
  { id: 'ar-active-42', category: 'microphones', badge: '4-Track Field Recorder', rating: '4.7', reviews: '13,500+', title: 'Zoom H4n Pro 4-Track Portable WAV/MP3 Field Recorder', description: 'Onboard X/Y stereo condenser mics and dual XLR inputs for recording live concerts and foley.', url: directAsin('B01DPOXS8I') },
  { id: 'ar-active-43', category: 'headphones', badge: 'Wireless DJ Cans', rating: '4.7', reviews: '4,800+', title: 'AIAIAI TMA-2 DJ Modular Professional Headphones', description: 'Bio-cellulose speaker diaphragm engineered for high-SPL club cueing and bass clarity.', url: directAsin('B00UVG98E6') },
  { id: 'ar-active-44', category: 'interfaces', badge: 'Clean Studio Power', rating: '4.8', reviews: '18,900+', title: 'Furman M-8x2 Merit Series 8-Outlet Rack Power Conditioner', description: 'AC noise filtration and spike protection keeping preamps and monitors free of ground-loop buzz.', url: directAsin('B003BQ91Y6') },
  { id: 'ar-active-45', category: 'microphones', badge: 'Dual-Layer Pop Shield', rating: '4.7', reviews: '24,000+', title: 'Stedman Proscreen XL Metal Gooseneck Studio Pop Filter', description: 'Patented Louvered metal screen redirects plosive P/B blasts downward without dulling high frequencies.', url: directAsin('B0002CZW0Y') },
  { id: 'ar-active-46', category: 'controllers', badge: 'Motorized Fader', rating: '4.7', reviews: '3,100+', title: 'PreSonus FaderPort V2 Touch-Sensitive Motorized DAW Controller', description: '100mm motorized ALPS fader for writing expressive vocal rides and automation curves.', url: directAsin('B07GY938JV') },
  { id: 'ar-active-47', category: 'headphones', badge: 'Hi-Res DAP Player', rating: '4.5', reviews: '3,700+', title: 'Sony Walkman NW-A306 Hi-Res Lossless FLAC Digital Player', description: 'S-Master HX digital amp supporting 32-bit/384kHz PCM and DSD native playback.', url: directAsin('B0BS15C14F') },
  { id: 'ar-active-48', category: 'interfaces', badge: '4TB Stem Archive', rating: '4.7', reviews: '7,800+', title: 'Crucial X9 Pro 4TB Portable Studio Backup SSD', description: 'Store thousands of uncompressed 24-bit WAV multitrack sessions and extracted cover archives.', url: directAsin('B0863TXGM3') },
];

export function StudioQuickDeals() {
  const quickItems = DEFAULT_GEAR.slice(0, 16);
  const deptPills = [
    { label: '🎧 Studio Headphones', url: amazonSearch('studio monitor headphones closed open back') },
    { label: '🎛️ USB-C Audio Interfaces', url: amazonSearch('USB C audio interface 24 bit 192kHz studio') },
    { label: '🎙️ XLR/USB Vocal Mics', url: amazonSearch('XLR dynamic condenser studio vocal microphone') },
    { label: '🎹 MIDI Pad Controllers', url: amazonSearch('MIDI keyboard pad controller 25 49 key') },
    { label: '🔊 Nearfield Studio Monitors', url: amazonSearch('powered studio monitor speakers pair 5 inch') },
    { label: '💿 Lossless DACs & Amps', url: amazonSearch('desktop balanced USB DAC headphone amplifier') },
  ];
  return (
    <section
      aria-label="Top Producer & Audiophile Quick Deals"
      data-amz-slot="studio-quick-deals"
      style={{
        marginBottom: '2rem',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
            🔥 Producer &amp; Audiophile Reference Deals (22 Verified Amazon Links)
          </span>
          <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.05rem', fontWeight: 800 }}>
            Hear Every Harmonic Above 16 kHz &amp; Upgrade Your Home Studio
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', opacity: 0.65 }}>Amazon Associates • ID: {AMAZON_TAG}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '0.65rem', marginBottom: '0.85rem' }}>
        {quickItems.map((item) => (
          <a
            key={`quick-${item.id}`}
            href={item.url}
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={() => sendAudioRapAdEvent({ type: 'click', slot: 'studio-quick-deals', productId: item.id })}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              gap: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 800, color: '#a5b4fc' }}>
              <span>{item.badge}</span>
              <span style={{ color: '#f59e0b' }}>★ {item.rating}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.25 }}>{item.title}</div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8' }}>View on Amazon →</span>
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {deptPills.map((pill) => (
          <a
            key={pill.label}
            href={pill.url}
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={() => sendAudioRapAdEvent({ type: 'click', slot: 'studio-dept-pill', productId: pill.label })}
            style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'inherit', textDecoration: 'none' }}
          >
            {pill.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}

export default function GearLinks() {
  const [gear, setGear] = useState(DEFAULT_GEAR);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    sendAudioRapAdEvent({ type: 'pageview' });
    sendAudioRapAdEvent({ type: 'impression', slot: 'studio-showcase' });

    fetch(`${CENTRAL_ENGINE}?action=serve&site=audiorap&slot=studio-showcase&limit=45`)
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
                asin: g.asin,
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
