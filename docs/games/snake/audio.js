/* Original, synthesized arcade cues. No downloads or autoplay before interaction. */
(() => {
  'use strict';
  const key='nanofun.effects.muted.v1';
  let context=null,master=null,muted=false,lastCue=-1,epoch=0;
  const voices=new Set();
  try{muted=localStorage.getItem(key)==='true';}catch{}
  function label(){const button=document.getElementById('sound-toggle');if(button){button.textContent=muted?'音效：关':'音效：开';button.setAttribute('aria-pressed',String(!muted));}}
  function unlock(){
    try{
      if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context=new Audio();master=context.createGain();master.gain.value=muted?0:.24;master.connect(context.destination);}
      if(context.state==='suspended')context.resume().catch(()=>{});
    }catch{}
  }
  function stop(){epoch++;for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
  function tone(frequency,delay,duration,type='sine',end=frequency,level=.55){
    const t=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.006);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain);gain.connect(master);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration+.015);
  }
  function play(cue,value=0){
    if(muted||document.hidden||!context)return;
    if(context.state==='suspended'){const pending=epoch;context.resume().then(()=>{if(context.state==='running'&&pending===epoch)play(cue,value);}).catch(()=>{});return;}
    if(context.state!=='running')return;
    if((cue==='move'||cue==='turn')&&context.currentTime-lastCue<.055)return;
    lastCue=context.currentTime;
    if(cue==='start'){tone(523,0,.12,'triangle');tone(784,.09,.14,'triangle');tone(1047,.18,.22,'sine');}
    else if(cue==='move')tone(210,0,.055,'sine',310,.3);
    else if(cue==='merge'){const f=Math.min(1200,330*Math.pow(2,Math.max(0,Math.log2(Math.max(4,value))-2)/12));tone(f,0,.12,'triangle',f*1.15);tone(f*1.5,.055,.15,'sine');}
    else if(cue==='turn')tone(260,0,.045,'triangle',350,.22);
    else if(cue==='eat'){tone(660,0,.09,'triangle');tone(990,.065,.13,'triangle');}
    else if(cue==='level'){tone(784,0,.1,'triangle');tone(988,.09,.1,'triangle');tone(1319,.18,.19,'sine');}
    else if(cue==='win'){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.1,.24,'triangle'));}
    else if(cue==='lose'){stop();tone(220,0,.22,'triangle',110);tone(165,.18,.35,'triangle',55);}
    else if(cue==='resume'){tone(440,0,.07,'sine');tone(660,.06,.12,'sine');}
  }
  function setMuted(value){muted=value;stop();if(master)master.gain.setValueAtTime(muted?0:.24,context.currentTime);label();}
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
  document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('blur',stop);
  window.addEventListener('storage',event=>{if(event.key===key)setMuted(event.newValue==='true');});
  document.getElementById('sound-toggle')?.addEventListener('click',()=>{unlock();setMuted(!muted);try{localStorage.setItem(key,String(muted));}catch{}if(!muted)play('eat');});
  label();window.NanoSFX=Object.freeze({play,stop,unlock});
})();
