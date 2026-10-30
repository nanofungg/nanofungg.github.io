/* Original looping chiptune: quiet melody, bass and offbeat chords. */
(() => {
  const key='nanofun.snake.music.muted.v1',beat=60/108/2;
  let context,master,timer=null,active=false,muted=false,next=0,step=0;
  const voices=new Set(),melody=[76,0,79,76,74,72,74,0,76,0,79,83,81,79,76,0,72,0,76,79,77,76,74,0,71,74,77,81,79,77,74,0,69,0,72,76,74,72,69,0,72,76,79,84,83,79,76,0,65,69,72,77,76,72,69,0,67,71,74,79,77,74,71,0];
  const bass=[48,48,53,55,45,48,53,55];
  try{muted=localStorage.getItem(key)==='true';}catch{}
  function label(){const b=document.getElementById('music-toggle');if(b){b.textContent=muted?'音乐：关':'音乐：开';b.setAttribute('aria-pressed',String(!muted));}}
  function note(midi,t,duration,type,volume){if(!midi)return;const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.value=440*Math.pow(2,(midi-69)/12);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);oscillator.connect(gain);gain.connect(master);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(t);oscillator.stop(t+duration+.02);}
  function pump(){if(!active||muted||document.hidden||context?.state!=='running')return;if(next<context.currentTime)next=context.currentTime+.025;while(next<context.currentTime+.15){const root=bass[Math.floor(step/8)%8];note(melody[step%64],next,beat*.82,'triangle',.32);if(step%4===0)note(root,next,beat*2.8,'sine',.5);if(step%4===2){note(root+12,next,beat*.45,'sine',.12);note(root+19,next,beat*.45,'sine',.1);}next+=beat;step=(step+1)%64;}}
  function silence(){if(timer!==null){clearInterval(timer);timer=null;}for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
  function sync(){if(!active||muted||document.hidden||context?.state!=='running'){silence();return;}if(timer===null){next=context.currentTime+.025;pump();timer=setInterval(pump,80);}}
  function unlock(){try{if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context=new Audio();master=context.createGain();master.gain.value=.15;master.connect(context.destination);}if(context.state==='suspended')context.resume().then(sync).catch(()=>{});else sync();}catch{}}
  window.NanoMusic=Object.freeze({setActive(value){active=value;if(value)unlock();else silence();}});
  document.getElementById('music-toggle')?.addEventListener('click',()=>{muted=!muted;try{localStorage.setItem(key,String(muted));}catch{}label();if(!muted)unlock();sync();});
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){active=false;silence();}});window.addEventListener('blur',()=>{active=false;silence();});window.addEventListener('pagehide',silence);
  label();
})();
