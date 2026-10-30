'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const STORAGE = 'nanofun.arcade.demo.v1';
  const games = {volleyball:{name:'皮卡丘打排球',path:'pikachu-volleyball/?v=p2-fix-1',hint:'选择模式时扣 1 币 / 场 · 左侧 WASD＋R · 右侧方向键＋Enter',paid:'本场可玩到 15 分。'},'2048':{name:'2048',path:'2048/?v=sound1',hint:'滑动棋盘或使用方向键 / WASD · 开始和重开扣 1 币',paid:'达到 2048 后可免费继续挑战。'},snake:{name:'贪吃蛇',path:'snake/?v=sound1',hint:'滑动、方向按钮或方向键 / WASD · 开始和重开扣 1 币',paid:'吃果子得分，撞墙或撞到自己结束。'}};
  let selectedGame = 'volleyball';
  let active = null, toastTimer, storageOK = true;
  function readStore() {
    try { const value=JSON.parse(localStorage.getItem(STORAGE)||'{"accounts":{}}'); return value && value.accounts && typeof value.accounts==='object' ? value : {accounts:{}}; }
    catch { storageOK=false; return {accounts:{}}; }
  }
  function writeStore(store) {
    try { localStorage.setItem(STORAGE,JSON.stringify(store)); return true; }
    catch { storageOK=false; toast('浏览器无法保存模拟币，请允许本地存储后再试。'); return false; }
  }
  function today() { const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
  function account() { if(!active) return null; const a=readStore().accounts[active]; return a && Number.isSafeInteger(a.coins) && a.coins>=0 && Array.isArray(a.log) ? a : null; }
  function transaction(amount,reason,guard=()=>true,extra={}) {
    const store=readStore(),a=store.accounts[active];
    if(!a || !Number.isSafeInteger(a.coins) || a.coins+amount<0 || !guard(a)) return false;
    a.coins+=amount; Object.assign(a,extra);
    a.log=[{reason,amount,at:Date.now()},...(Array.isArray(a.log)?a.log:[])].slice(0,12);
    if(!writeStore(store)) return false;
    render(); return true;
  }
  function toast(message) { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500); }
  function openWallet(message='') { window.NanoTouch?.pause(); $('game-frame-host').firstChild?.contentWindow?.postMessage('nanofun:pause',location.origin); render(); $('wallet-message').textContent=message; if(!$('wallet-dialog').open) $('wallet-dialog').showModal(); }
  function dailyClaim() {
    if(!account()) { openWallet(); return; }
    if(transaction(10,'每日领取',a=>a.day!==today(),{day:today()})) { $('wallet-message').textContent='今日 10 枚模拟币已到账，开玩吧！'; toast('每日奖励 ＋10 模拟币'); }
    else $('wallet-message').textContent='今天已经领取过了，明天再来。';
  }
  function render() {
    const a=account(),balance=a?a.coins:0;
    ['header-balance','cabinet-coins','wallet-balance'].forEach(id=>$(id).textContent=balance);
    $('email-form').hidden=!!a; $('account-panel').hidden=!a;
    $('wallet-play').hidden=!a || balance<1;
    if(!a) return;
    $('account-label').textContent=a.label+' · 演示身份';
    $('daily-button').disabled=a.day===today();
    $('daily-button').textContent=a.day===today()?'今日已领取 · 明天再来':'领取今日 10 模拟币';
    $('reward-button').disabled=a.coins!==0;
    $('reward-status').textContent=a.coins===0?'点上方按钮直接模拟广告完成奖励，不会播放广告。':'模拟币用完后开放此奖励。真实激励广告尚未接入。';
    $('ledger').replaceChildren(...a.log.map(item=>{const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=item.reason;value.textContent=(item.amount>0?'+':'')+item.amount;li.append(label,value);return li;}));
  }
  $('email-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.submitter;button.disabled=true;
    try {
      const email=$('email').value.trim().toLowerCase();
      if(!$('email').checkValidity()||!email){$('email').reportValidity();return;}
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(email));
      const id=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
      const store=readStore(),[name,domain]=email.split('@');
      if(!store.accounts[id])store.accounts[id]={coins:0,day:null,label:name.slice(0,2)+'***@'+domain,log:[]};
      store.active=id;if(!writeStore(store))return;active=id;$('email').value='';render();dailyClaim();
    } catch { $('wallet-message').textContent='无法建立演示身份，请使用支持本地存储的 HTTPS 浏览器。'; }
    finally {button.disabled=false;}
  });
  $('switch-account').addEventListener('click',()=>{const store=readStore();delete store.active;if(!writeStore(store))return;active=null;render();$('wallet-message').textContent='切换本机演示身份；原身份余额仍保留。';});
  $('daily-button').addEventListener('click',dailyClaim);
  $('reward-button').addEventListener('click',()=>{if(transaction(10,'模拟广告奖励',a=>a.coins===0)){$('wallet-message').textContent='模拟奖励已到账：＋10 币。本次未播放真实广告。';toast('模拟奖励 ＋10 币 · 无真实广告');}});
  $('wallet-button').addEventListener('click',()=>openWallet());
  $('claim-entry').addEventListener('click',()=>{openWallet();if(account())dailyClaim();});
  ['how-button','privacy-button'].forEach(id=>$(id).addEventListener('click',()=>$('info-dialog').showModal()));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('game-wallet').addEventListener('click',()=>openWallet());
  $('wallet-play').addEventListener('click',()=>{
    $('wallet-dialog').close();
    if($('cabinet-dialog').open) $('cabinet-dialog').close();
    const games=$('games');
    games.focus({preventScroll:true});
    games.scrollIntoView({block:'start'});
  });
  function openCabinet(gameId = 'volleyball') {
    selectedGame = games[gameId] ? gameId : 'volleyball';
    const game=games[selectedGame];
    if(!account()){openWallet('先建立演示身份，领取每日 10 币。然后进入机台。');return;}
    if(account().coins<1){openWallet('模拟币用完了。领取可用奖励后再来一局。');return;}
    if(!$('game-frame-host').firstChild){const frame=document.createElement('iframe');frame.src='games/'+game.path;frame.title=game.name+' — NanoFun 街机';frame.allow='autoplay; fullscreen';$('game-frame-host').append(frame);}
    $('cabinet-dialog').dataset.game=selectedGame; $('cabinet-title').textContent=game.name; $('cabinet-hint').textContent=game.hint; $('game-status').textContent='点击游戏内开始按钮投 1 枚模拟币。';$('cabinet-dialog').showModal();window.NanoTouch?.enter();render();
  }
  $('play-button').addEventListener('click',()=>openCabinet('volleyball'));
  $('play-2048').addEventListener('click',()=>openCabinet('2048'));
  $('play-snake').addEventListener('click',()=>openCabinet('snake'));
  $('exit-game').addEventListener('click',()=>$('cabinet-dialog').close());
  $('cabinet-dialog').addEventListener('close',()=>{window.NanoTouch?.reset();$('game-frame-host').replaceChildren();$('game-status').textContent='选择模式后投币开赛。';});
  // Synchronous same-origin bridge for this local demo, not a production security boundary.
  window.NanoArcade=Object.freeze({requestMatch(single=true){
    if(!$('cabinet-dialog').open||!account()){openWallet('请先进入演示身份。');return false;}
    if(selectedGame==='volleyball' && window.NanoOrientation && !window.NanoOrientation.prepare(single))return false;
    if(!transaction(-1,games[selectedGame].name+'开赛',a=>a.coins>=1)){openWallet(storageOK?'币用完啦，模拟领取奖励后再开赛。':'当前无法保存余额，暂时不能开赛。');return false;}
    $('game-status').textContent='已投 1 枚模拟币，'+games[selectedGame].paid+'重开另扣 1 币。';toast('已投币 −1 · 祝你玩得开心！');return true;
  }});
  window.addEventListener('storage',event=>{if(event.key===STORAGE)render();});
  active=readStore().active||null;render();
})();
