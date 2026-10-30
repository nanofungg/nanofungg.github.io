/* Browser audio adapter; match events still originate in the Godot simulation. */
(() => {
  const files={jump:'WAVE142_1.wav',pika:'WAVE141_1.wav',smash:'WAVE145_1.wav',point:'WAVE146_1.wav',win:'WAVE140_1.wav',music:'bgm.mp3'};
  let context,master,music=null,active=false,muted=false,loading=false;
  const buffers={},voices=new Set();
  function status(){const el=document.getElementById('audio-status');if(el)el.textContent=muted?'声音已关闭':context?.state==='running'?(Object.keys(buffers).length===6?'声音已开启':'声音加载中…'):'点击游戏启用声音';}
  function stopMusic(){if(music){music.stop();music=null;}}
  function sync(){
    status();if(!active||muted||document.hidden||context?.state!=='running'){stopMusic();return;}
    if(!music&&buffers.music){music=context.createBufferSource();music.buffer=buffers.music;music.loop=true;const gain=context.createGain();gain.gain.value=.18;music.connect(gain);gain.connect(master);music.onended=()=>gain.disconnect();music.start();}
  }
  function unlock(){
    try{
      if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context=new Audio();master=context.createGain();master.gain.value=.7;master.connect(context.destination);context.addEventListener('statechange',sync);}
      if(context.state!=='running')context.resume().then(sync).catch(status);
      if(!loading){loading=true;Object.entries(files).forEach(async([name,file])=>{try{const response=await fetch('audio/'+file);if(!response.ok)throw Error(response.status);buffers[name]=await context.decodeAudioData(await response.arrayBuffer());sync();}catch(error){console.error('Pikachu audio failed: '+name,error);const el=document.getElementById('audio-status');if(el)el.textContent='声音加载失败，请刷新重试';}});}
      sync();
    }catch(error){console.error('Pikachu audio initialization failed',error);}
  }
  function play(name){if(!active||muted||document.hidden||context?.state!=='running'||!buffers[name])return;const source=context.createBufferSource();source.buffer=buffers[name];source.connect(master);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();};source.start();}
  function silence(){for(const source of voices)source.stop();voices.clear();stopMusic();}
  window.NanoPikaAudio=Object.freeze({unlock,play,setActive(value){if(active===value)return;active=value;if(!value)silence();sync();},setMuted(value){muted=value;if(muted)silence();if(master)master.gain.value=muted?0:.7;sync();}});
  document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)silence();else sync();});window.addEventListener('pagehide',silence);
  status();
})();
