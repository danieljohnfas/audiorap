// Amazon affiliate links (search pages, so no prices or ratings are copied onto this site).
const AMAZON_TAG = 'photoid03-20';

const GEAR = [
  { label: 'Studio headphones', query: 'studio monitor headphones' },
  { label: 'USB audio interfaces', query: 'usb audio interface' },
  { label: 'Portable DAC / amps', query: 'portable headphone dac amp' },
  { label: 'Hi-res music players', query: 'hi-res digital audio player' },
];

const amazonSearch = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;

export default function GearLinks() {
  return (
    <section className="glass-card gear-links" aria-labelledby="gear-heading">
      <h3 id="gear-heading">Gear for hearing every detail</h3>
      <ul>
        {GEAR.map((g) => (
          <li key={g.query}>
            <a href={amazonSearch(g.query)} target="_blank" rel="sponsored nofollow noopener">
              {g.label}
            </a>
          </li>
        ))}
      </ul>
      <small>As an Amazon Associate, AudioRap earns from qualifying purchases.</small>
    </section>
  );
}
