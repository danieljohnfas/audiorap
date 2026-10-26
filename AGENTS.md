# AudioRap — Coding Agent Operational Guide

This document is the authoritative contract for all AI coding agents working on AudioRap.

---

## 1. Runtime & Stack Invariants

- **Architecture:** 100% Client-Side In-Browser Audio Lab (Vite, React, Web Audio API, Canvas).
- **Core Mission:**
  - Drag-and-drop audio file handling for metadata/cover-art extraction and real-time spectrogram rendering.
  - VibeVoice ASR integration for transcript viewing and chaptering.
  - Optional bulk ZIP export of extracted album artwork.
- **Privacy & Execution Invariant:**
  - Audio files are processed **strictly in the user's browser**.
  - **NEVER** introduce server-side file upload backends or external audio processing services.
- **Monetization & Affiliates:**
  - Amazon affiliate search links in `src/components/GearLinks.jsx` must preserve associate tag `photoid03-20`.

---

## 2. Golden Verification Commands

```bash
# Start local Vite development server
npm run dev

# Fast linter check
npx oxlint

# Production build (must pass before deployment)
npm run build
```

---

## 3. Architecture & Key Files

- `src/App.jsx`: Main UI layout, file drop-zone, and bulk ZIP export orchestration.
- `src/utils/audioParser.js`: Pure in-browser ID3/metadata and embedded cover artwork extractor.
- `src/utils/spectrogram.js`: High-performance WebGL/Canvas audio frequency rendering.
- `src/utils/vibeVoice.js`: Local ASR client and transcript parser.
- `src/components/GearLinks.jsx`: Studio gear affiliate components.

---

## 4. 🛑 The YAGNI Rule (You Ain't Gonna Need It)

1. **No Speculative Code:** Build only the requested audio visualization, parsing, or metadata features. Do not add complex backend user accounts, cloud database sync, or multi-track DAWs unless requested.
2. **No Unsolicited Refactoring:** Do not modify the canvas spectrogram rendering loops or ID3 parser routines unless fixing an explicit bug.
3. **Zero Unnecessary Dependencies:** Do not add heavy audio libraries if Web Audio API or existing lightweight parsers suffice.
4. **Surgical, Minimal Diffs:** Keep edits modular and isolated to component files.

---

## 5. Definition of Done

Before completing any task:
- [ ] `npm run build` passes with zero Vite bundle errors.
- [ ] No server-side audio upload endpoints are introduced.
- [ ] Canvas spectrogram and audio playback continue to work without frame drops.
