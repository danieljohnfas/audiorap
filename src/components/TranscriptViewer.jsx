import { useState } from 'react';
import { Mic, Users, Download, Copy, Check, Search, FileText } from 'lucide-react';
import { vibeVoice } from '../utils/vibeVoice';

export default function TranscriptViewer({ file }) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState('ALL');

  const startTranscription = async () => {
    if (!file) return;
    setIsTranscribing(true);
    try {
      const data = await vibeVoice.transcribe(file);
      setTranscriptData(data);
    } catch (err) {
      console.error('[VibeVoice] transcription failed:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyFullText = () => {
    if (!transcriptData) return;
    navigator.clipboard.writeText(transcriptData.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSegments = (transcriptData?.segments || []).filter(s => {
    const matchesSpeaker = selectedSpeaker === 'ALL' || s.speaker === selectedSpeaker;
    const matchesSearch = s.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  return (
    <div className="w-full mt-6 p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">VibeVoice ASR Transcript</h3>
            <p className="text-xs text-white/50">Long-pass transcription with speaker separation (60-90m)</p>
          </div>
        </div>

        {!transcriptData && !isTranscribing && (
          <button
            onClick={startTranscription}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Users className="w-4 h-4" />
            Transcribe & Separate Speakers
          </button>
        )}
      </div>

      {isTranscribing && (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-indigo-300">Processing audio and clustering speaker voices…</p>
        </div>
      )}

      {transcriptData && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Speaker Filter & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/60">Speakers:</span>
              {['ALL', 'Speaker 1', 'Speaker 2'].map(spk => (
                <button
                  key={spk}
                  onClick={() => setSelectedSpeaker(spk)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                    selectedSpeaker === spk
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {spk}
                </button>
              ))}
            </div>

            {/* Actions: Copy & Exports */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyFullText}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center gap-1.5 transition-all"
                title="Copy full transcript"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => downloadFile(vibeVoice.exportSRT(transcriptData.segments), `${file.name || 'audio'}.srt`, 'text/plain')}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center gap-1.5 transition-all"
                title="Download SRT subtitles"
              >
                <Download className="w-3.5 h-3.5" />
                .SRT
              </button>
              <button
                onClick={() => downloadFile(vibeVoice.exportVTT(transcriptData.segments), `${file.name || 'audio'}.vtt`, 'text/vtt')}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center gap-1.5 transition-all"
                title="Download WebVTT subtitles"
              >
                <FileText className="w-3.5 h-3.5" />
                .VTT
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search words in transcript…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Transcript List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
            {filteredSegments.map(s => {
              const isSpeaker1 = s.speaker === 'Speaker 1';
              return (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3 items-start hover:bg-white/10 transition-colors"
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-medium shrink-0 ${
                      isSpeaker1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {s.speaker}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 leading-relaxed">{s.text}</p>
                    <span className="text-[11px] text-white/40 font-mono mt-1 inline-block">
                      {vibeVoice.formatTimestamp(s.start)} &rarr; {vibeVoice.formatTimestamp(s.end)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
