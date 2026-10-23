const CENTRAL_ENGINE = 'https://tiketichap.com/api/amazon-ads';
const AMAZON_TAG = 'photoid03-20';

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

    if (payload && payload.type === 'click' && typeof localStorage !== 'undefined') {
      try {
        const slot = payload.slot || 'studio-showcase';
        const clicks = JSON.parse(localStorage.getItem('audiorap_ad_clicks') || '{}');
        clicks[slot] = (clicks[slot] || 0) + 1;
        localStorage.setItem('audiorap_ad_clicks', JSON.stringify(clicks));
      } catch (_) {}
    }
  } catch {
    // Fail silent
  }
}
