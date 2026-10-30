(() => {
  const host=document.getElementById('mobile-controls'),cabinet=document.getElementById('cabinet-dialog');
  const pointers=new Map(),sticks=[...host.querySelectorAll('.joystick')],owners=new Map();
  let edges=0,command=0,oldViewport=null,ownsFullscreen=false;
  const center=stick=>{stick.style.setProperty('--stick-x','0px');stick.style.setProperty('--stick-y','0px');stick.classList.remove('held');};
  function release(){pointers.clear();owners.clear();edges=0;sticks.forEach(center);host.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
  function updateStick(stick,event){
    const rect=stick.getBoundingClientRect(),radius=rect.width/2;
    let x=(event.clientX-rect.left-radius)/radius,y=(event.clientY-rect.top-radius)/radius;
    const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
    stick.style.setProperty('--stick-x',`${x*radius*.48}px`);stick.style.setProperty('--stick-y',`${y*radius*.48}px`);
    let bits=0;if(x<-.24)bits|=1;else if(x>.24)bits|=2;if(y<-.42)bits|=4;else if(y>.42)bits|=8;
    pointers.set(event.pointerId,bits<<(Number(stick.dataset.side)*5));
  }
  sticks.forEach(stick=>{
    stick.addEventListener('pointerdown',event=>{event.preventDefault();if(owners.has(stick))return;owners.set(stick,event.pointerId);stick.setPointerCapture(event.pointerId);stick.classList.add('held');updateStick(stick,event);});
    stick.addEventListener('pointermove',event=>{if(owners.get(stick)!==event.pointerId)return;event.preventDefault();updateStick(stick,event);});
    const end=event=>{if(owners.get(stick)!==event.pointerId)return;pointers.delete(event.pointerId);owners.delete(stick);center(stick);};
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>stick.addEventListener(name,end));
  });
  host.querySelectorAll('[data-bit]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);const bit=Number(button.dataset.bit);pointers.set(event.pointerId,bit);edges|=bit;button.classList.add('held');});
    const end=event=>{pointers.delete(event.pointerId);if(![...pointers.values()].includes(Number(button.dataset.bit)))button.classList.remove('held');};
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>button.addEventListener(name,end));
  });
  host.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{release();command=Number(button.dataset.command);}));
  function enterFullscreen(){
    // Fullscreen API excludes dialog elements, so fullscreen the document behind the modal.
    if(!document.fullscreenElement && document.documentElement.requestFullscreen){
      document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{ownsFullscreen=true;}).catch(()=>{document.getElementById('game-status').textContent='当前浏览器不支持全屏，已使用铺满屏幕的游戏界面。';});
    }
  }
  window.NanoTouch=Object.freeze({
    poll(){let bits=edges;for(const bit of pointers.values())if(bit!==16&&bit!==512)bits|=bit;const orientationCommand=window.NanoOrientation?.poll()||0;bits|=(orientationCommand||command)<<10;edges=0;command=0;return bits;},
    mode(single){window.NanoOrientation?.started(single);release();host.dataset.mode=single?'single':'double';document.getElementById('touch-help').textContent=single?'左右推摇杆移动 · 向上推跳跃 · 右手扣杀 / 扑救':'P1 / P2 各有摇杆和扣杀键；同屏双人建议使用平板。';},
    menu(){release();command=2;},pause(){release();command=4;},reset(){release();command=0;},
    enter(){
      const meta=document.querySelector('meta[name="viewport"]');oldViewport=meta.getAttribute('content');
      meta.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
      if(matchMedia('(pointer: coarse)').matches)enterFullscreen();
    },
    fullscreen(){if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else enterFullscreen();}
  });
  cabinet.addEventListener('close',()=>{release();const meta=document.querySelector('meta[name="viewport"]');if(oldViewport!==null){meta.setAttribute('content',oldViewport);oldViewport=null;}if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});ownsFullscreen=false;});
  document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreen-toggle').textContent=document.fullscreenElement?'退出全屏':'全屏游戏';release();});
  // Only the active cabinet suppresses browser gestures; homepage and wallet stay normal.
  ['gesturestart','gesturechange','gestureend','dblclick','contextmenu'].forEach(name=>cabinet.addEventListener(name,event=>event.preventDefault(),{passive:false}));
  cabinet.addEventListener('touchmove',event=>{if(event.target.closest('#mobile-controls, #game-frame-host'))event.preventDefault();},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)window.NanoTouch.pause();});
  window.addEventListener('blur',release);
  window.addEventListener('orientationchange',()=>window.NanoTouch.pause());
  document.getElementById('fullscreen-toggle').addEventListener('click',()=>window.NanoTouch.fullscreen());
  document.getElementById('touch-toggle').addEventListener('click',()=>{release();cabinet.classList.toggle('touch-enabled');document.getElementById('touch-toggle').setAttribute('aria-pressed',String(cabinet.classList.contains('touch-enabled')));});
  if(matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0){cabinet.classList.add('touch-enabled');document.getElementById('touch-toggle').setAttribute('aria-pressed','true');}
})();
