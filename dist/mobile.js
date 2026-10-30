(() => {
  const host = document.getElementById('mobile-controls');
  const pointers = new Map();
  let edges = 0, command = 0;
  const release = () => { pointers.clear(); edges = 0; host.querySelectorAll('.held').forEach(b => b.classList.remove('held')); };
  function refresh() { host.querySelectorAll('[data-bit]').forEach(b => b.classList.toggle('held', [...pointers.values()].some(bits => (bits & Number(b.dataset.bit)) !== 0))); }
  host.querySelectorAll('[data-bit]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); const bit = Number(button.dataset.bit);
      button.setPointerCapture(event.pointerId); pointers.set(event.pointerId, bit);
      if (bit === 16 || bit === 512) edges |= bit;
      refresh();
    });
    button.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      const pad = button.closest('.dpad');
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const shift = Number(button.dataset.bit) >= 32 ? 5 : 0;
      let bits = 0;
      if (Math.abs(x) < .75 && Math.abs(y) < .75) {
        if (x < -.16) bits |= 1; else if (x > .16) bits |= 2;
        if (y < -.16) bits |= 4; else if (y > .16) bits |= 8;
      }
      pointers.set(event.pointerId, bits << shift); refresh();
    });
    const end = event => { pointers.delete(event.pointerId); refresh(); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => button.addEventListener(name, end));
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  host.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => { release(); command = Number(button.dataset.command); }));
  window.NanoTouch = Object.freeze({
    poll() { let bits = edges; for (const bit of pointers.values()) if (bit !== 16 && bit !== 512) bits |= bit; bits |= command << 10; edges = 0; command = 0; return bits; },
    mode(single) { release(); host.dataset.mode = single ? 'single' : 'double'; document.getElementById('touch-help').textContent = single ? '左手十字键移动 · 右手 B 跳跃 / A 扣杀 · 移动中按 A 扑救' : 'P1 / P2 各有十字键和 A、B 按钮；同屏双人建议使用平板。'; },
    pause() { release(); command = 4; },
    reset() { release(); command = 0; },
    fullscreen() { const cabinet = document.getElementById('cabinet-dialog'); if (document.fullscreenElement) document.exitFullscreen?.(); else cabinet.requestFullscreen?.().catch(() => {}); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) window.NanoTouch.pause(); });
  window.addEventListener('blur', release);
  window.addEventListener('orientationchange', () => window.NanoTouch.pause());
  document.getElementById('touch-toggle').addEventListener('click', () => {
    release();
    const cabinet = document.getElementById('cabinet-dialog');
    cabinet.classList.toggle('touch-enabled');
    document.getElementById('touch-toggle').setAttribute('aria-pressed', String(cabinet.classList.contains('touch-enabled')));
  });
  if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) {
    document.getElementById('cabinet-dialog').classList.add('touch-enabled');
    document.getElementById('touch-toggle').setAttribute('aria-pressed', 'true');
  }
})();
