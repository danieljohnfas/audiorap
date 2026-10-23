import * as jsmediatags from 'jsmediatags';

async function fetchOnlineCoverArt(title, artist) {
  if (!title || !artist) return null;
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch (err) {
    console.error('Failed to fetch online cover art:', err);
  }
  return null;
}

export function extractCoverArt(file, useOnlineFetch = false) {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: async function(tag) {
        const tags = tag.tags;
        let coverUrl = null;
        
        if (tags.picture) {
          const { data, format } = tags.picture;
          let base64String = '';
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          const base64 = btoa(base64String);
          coverUrl = `data:${format};base64,${base64}`;
        } else if (useOnlineFetch && tags.title && tags.artist) {
          coverUrl = await fetchOnlineCoverArt(tags.title, tags.artist);
        }
        
        resolve({
          coverUrl,
          tags: {
            title: tags.title,
            artist: tags.artist,
            album: tags.album,
          }
        });
      },
      onError: function(error) {
        console.error('Error reading tags:', error);
        // Even if reading tags fails, we can resolve with nulls rather than crashing
        resolve({
          coverUrl: null,
          tags: null
        });
      }
    });
  });
}
