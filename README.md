# AudioRap

[audiorap.com](https://audiorap.com): drop audio files to extract embedded cover art and draw a
spectrogram, entirely in the browser. Optional lookup of missing covers online; bulk ZIP download.

## Code

- `src/App.jsx`: page, file handling, ZIP export
- `src/utils/audioParser.js`: reads ID3/metadata and embedded artwork
- `src/utils/spectrogram.js`: renders the spectrogram
- `src/components/GearLinks.jsx`: Amazon affiliate links (search pages, tag `photoid03-20`)

## Develop

```bash
npm install
npm run dev
npm run build
```
