(() => {
  const host = document.getElementById('mobile-controls');
  const pointers = new Map();
  let edges = 0, command = 0;
  const release = () => { pointers.clear(); edges = 0; host.querySelectorAll('.held').forEach(b => b.classList.remove('held')); };
  function refresh() { host.querySelectorAll('[data-bit]').forEach(b => b.classList.toggle('held', [...pointers.values()].includes(Number(b.dataset.bit)))); }
  host.querySelectorAll('[data-bit]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); const bit = Number(button.dataset.bit);
      button.setPointerCapture(event.pointerId); pointers.set(event.pointerId, bit);
      if (bit === 16 || bit === 512) edges |= bit;
      refresh();
    });
    const end = event => { pointers.delete(event.pointerId); refresh(); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => button.addEventListener(name, end));
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  host.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => { release(); command = Number(button.dataset.command); }));
  window.NanoTouch = Object.freeze({
    poll() { let bits = edges; for (const bit of pointers.values()) if (bit !== 16 && bit !== 512) bits |= bit; bits |= command << 10; edges = 0; command = 0; return bits; },
    mode(single) { release(); host.dataset.mode = single ? 'single' : 'double'; document.getElementById('touch-help').textContent = single ? '你控制左侧皮卡丘。按住方向移动；跳起后点扣杀；移动中点扣杀可扑救。' : 'P1 控制左侧，P2 控制右侧。双人建议横屏；两组手柄支持同时操作。'; },
    pause() { release(); command = 4; },
    reset() { release(); command = 0; },
    fullscreen() { const cabinet = document.getElementById('cabinet-dialog'); if (document.fullscreenElement) document.exitFullscreen?.(); else cabinet.requestFullscreen?.().catch(() => {}); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.NanoTouch.pause(); });
  window.addEventListener('blur', release);
  window.addEventListener('orientationchange', () => window.NanoTouch.pause());
  document.getElementById('touch-toggle').addEventListener('click', () => {
    const cabinet = document.getElementById('cabinet-dialog');
    cabinet.classList.toggle('touch-enabled');
    document.getElementById('touch-toggle').setAttribute('aria-pressed', String(cabinet.classList.contains('touch-enabled')));
  });
  if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) {
    document.getElementById('cabinet-dialog').classList.add('touch-enabled');
    document.getElementById('touch-toggle').setAttribute('aria-pressed', 'true');
  }
})();
