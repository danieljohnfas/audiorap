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
  } catch {
    // Fail silent
  }
}
