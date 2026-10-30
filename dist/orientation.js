(() => {
  const portrait = matchMedia('(orientation: portrait)');
  const overlay = document.getElementById('rotate-overlay');
  let pending = false, playingDouble = false, nextCommand = 0, requesting = false, locked = false, ownsFullscreen = false;
  function paint() {
    overlay.hidden = !(portrait.matches && (pending || playingDouble));
    document.getElementById('rotate-message').textContent = playingDouble
      ? '双人比赛已暂停。请横置手机，再点“暂停 / 继续”。'
      : '双人模式需要横屏。横置后自动开赛，届时才扣 1 币。';
  }
  function changed() {
    if (!portrait.matches && pending) { pending = false; nextCommand = 5; }
    paint();
  }
  async function rotate() {
    if (requesting) return;
    requesting = true;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({navigationUI:'hide'}); ownsFullscreen = true;
      }
      if (screen.orientation?.lock) { await screen.orientation.lock('landscape'); locked = true; }
    } catch { /* Rotation prompt remains available on browsers that prohibit locking. */ }
    finally { requesting = false; if (pending || playingDouble) changed(); else reset(); }
  }
  function unlock() { if (locked) { screen.orientation?.unlock?.(); locked = false; } }
  function reset() { pending = false; playingDouble = false; nextCommand = 0; unlock(); if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen?.().catch(()=>{}); ownsFullscreen = false; paint(); }
  window.NanoOrientation = Object.freeze({
    prepare(single) {
      if (single) { reset(); return true; }
      if (!portrait.matches) { pending = false; return true; }
      pending = true; paint(); rotate(); return false;
    },
    started(single) { pending = false; playingDouble = !single; nextCommand = 0; paint(); },
    poll() { if (portrait.matches && (pending || playingDouble)) return 4; const result = nextCommand; nextCommand = 0; return result; },
    reset
  });
  portrait.addEventListener('change', changed);
  document.getElementById('rotate-try').addEventListener('click', rotate);
  document.getElementById('rotate-cancel').addEventListener('click', () => { reset(); window.NanoTouch?.menu(); });
  document.getElementById('cabinet-dialog').addEventListener('close', reset);
})();
