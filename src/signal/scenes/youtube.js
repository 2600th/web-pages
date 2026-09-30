// Side B's player: the YouTube IFrame API, loaded only when a tape is first played, playing
// one side of a tape as a queue. The player stays visible (YouTube requires it) in the J-card.
// Videos that refuse embedding are skipped; their links still open on YouTube.

let api = null;
function loadApi() {
  api ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) { resolve(window.YT); return; }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => { api = null; reject(new Error('YouTube did not load')); };
    document.head.append(script);
  });
  return api;
}

/**
 * @param {HTMLElement} host element the player replaces
 * @param {{ onTrack(i: number): void, onPlaying(on: boolean): void, onProgress(p: number): void, onSideEnd(): void, onSkip(i: number): void }} events
 */
export async function createTapePlayer(host, events) {
  const YT = await loadApi();
  let queue = [];
  let index = 0;
  let timer = 0;
  const player = await new Promise((resolve) => {
    const p = new YT.Player(host, {
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => resolve(p),
        onStateChange: (event) => {
          const playing = event.data === YT.PlayerState.PLAYING;
          events.onPlaying(playing);
          clearInterval(timer);
          if (playing) timer = setInterval(progress, 500);
          if (event.data === YT.PlayerState.ENDED) advance();
        },
        onError: () => { events.onSkip(index); advance(); },
      },
    });
  });
  const progress = () => {
    const duration = player.getDuration?.() || 0;
    const t = player.getCurrentTime?.() || 0;
    events.onProgress((index + (duration ? t / duration : 0)) / Math.max(1, queue.length));
  };
  const start = (i) => {
    index = i;
    events.onTrack(index);
    player.loadVideoById(queue[index].id);
  };
  const advance = () => {
    if (index + 1 < queue.length) start(index + 1);
    else { events.onPlaying(false); events.onSideEnd(); }
  };
  return {
    /** Play a side from its first track (or `from`). */
    side(tracks, from = 0) { queue = tracks.filter((t) => t.id); start(Math.min(from, queue.length - 1)); },
    play() { player.playVideo(); },
    pause() { player.pauseVideo(); },
    stop() { player.stopVideo(); events.onPlaying(false); },
    next() { if (index + 1 < queue.length) start(index + 1); },
    /** Back to the start of the track, or to the previous one if it has only just begun. */
    back() { if ((player.getCurrentTime?.() || 0) > 3 || index === 0) player.seekTo(0, true); else start(index - 1); },
    get playing() { return player.getPlayerState?.() === YT.PlayerState.PLAYING; },
  };
}
